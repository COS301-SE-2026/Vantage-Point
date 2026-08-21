import type { BrowserContext, Route } from "@playwright/test";
import {
  ACCESS_TOKEN,
  API_ORIGIN,
  CONFIRMATION_CODE,
  MATCH_HISTORY,
  REFRESH_TOKEN,
  ROTATED_ACCESS_TOKEN,
  TEST_EMAIL,
  TEST_PASSWORD,
  makeLiveMetrics,
  makeMatchDetail,
  makeProfile,
  makeTimeline,
  makeUser,
  type LiveMetricsBody,
  type MatchDetailBody,
  type MatchHistoryRowBody,
  type ProfileBody,
  type TimelineBody,
  type UserMeBody,
} from "./data";

/** Every route the frontend can call, addressable by name from a spec. */
export type EndpointName =
  | "register"
  | "confirmUser"
  | "login"
  | "logout"
  | "refresh"
  | "me"
  | "updateMe"
  | "uploadAvatar"
  | "deleteAvatar"
  | "linkRiot"
  | "updateRiot"
  | "liveMetrics"
  | "profile"
  | "matchHistory"
  | "matchSync"
  | "matchTimeline"
  | "matchDetail";

export interface MockReply {
  status?: number;
  /** Serialised as JSON. Omit together with `body` for a 204. */
  json?: unknown;
  body?: string;
  contentType?: string;
}

export interface MockRequest {
  readonly method: string;
  readonly pathname: string;
  readonly search: URLSearchParams;
  /** Path parameter captured by the route pattern, e.g. the match id. */
  readonly params: readonly string[];
  readonly bearer: string | null;
  json<T = Record<string, unknown>>(): T | null;
}

/** Return `undefined` to fall through to the default handler. */
export type MockHandler = (
  request: MockRequest,
) => MockReply | undefined | Promise<MockReply | undefined>;

export interface RecordedCall {
  readonly name: EndpointName;
  readonly method: string;
  readonly pathname: string;
  readonly search: string;
  readonly bearer: string | null;
  readonly body: unknown;
}

export interface MockState {
  /** `null` makes every authenticated endpoint answer 401. */
  user: UserMeBody | null;
  profile: ProfileBody;
  liveMetrics: LiveMetricsBody;
  matches: MatchHistoryRowBody[];
  matchDetails: Record<string, MatchDetailBody>;
  timelines: Record<string, TimelineBody>;
  credentials: { email: string; password: string };
  accessToken: string;
  refreshToken: string;
  /** Bearer values that answer 401, driving the refresh-and-retry path. */
  revokedAccessTokens: Set<string>;
  /** Riot ids the fake Riot lookup refuses to resolve. */
  unknownRiotIds: Set<string>;
  syncResult: { fetched: number; imported: number; total: number };
  /** Extra rows appended to the history the next time sync runs. */
  syncAdds: MatchHistoryRowBody[];
}

interface RouteEntry {
  readonly name: EndpointName;
  readonly method: string;
  readonly pattern: RegExp;
  readonly handle: MockHandler;
}

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

/**
 * Data Dragon's static name files, cut down to what the fixtures reference.
 *
 * The analysis table names the ability and item in every slot, and Riot's match
 * data carries neither, only the slot number and the item id, so a spec that
 * asserts on those names needs the CDN to answer with JSON, not with a pixel.
 */
const DDRAGON_ITEM_NAMES: Record<string, string> = {
  "3006": "Berserker's Greaves",
  "3031": "Infinity Edge",
  "3036": "Lord Dominik's Regards",
  "3094": "Rapid Firecannon",
  "3363": "Farsight Alteration",
  "6676": "The Collector",
};

const DDRAGON_CHAMPION_ABILITIES: Record<
  string,
  { passive: string; spells: string[] }
> = {
  Jinx: {
    passive: "Get Excited!",
    spells: [
      "Switcheroo!",
      "Zap!",
      "Flame Chompers!",
      "Super Mega Death Rocket!",
    ],
  },
};

const DDRAGON_JSON: { pattern: RegExp; body: unknown }[] = [
  {
    pattern: /\/data\/[^/]+\/item\.json$/,
    body: {
      data: Object.fromEntries(
        Object.entries(DDRAGON_ITEM_NAMES).map(([id, name]) => [id, { name }]),
      ),
    },
  },
  ...Object.entries(DDRAGON_CHAMPION_ABILITIES).map(([key, entry]) => ({
    pattern: new RegExp(`/data/[^/]+/champion/${key}\\.json$`),
    body: {
      data: {
        [key]: {
          passive: { name: entry.passive },
          spells: entry.spells.map((name) => ({ name })),
        },
      },
    },
  })),
];

function unauthorised(): MockReply {
  return { status: 401, json: { detail: "Not authenticated" } };
}

/**
 * Intercepts the whole backend surface plus Riot's Data Dragon CDN, so specs
 * never touch the network. Mutate `state` before navigating, or install a
 * per-test handler with `override` / `once` to exercise failure paths.
 */
export class ApiMock {
  readonly state: MockState;
  readonly calls: RecordedCall[] = [];

  private readonly overrides = new Map<EndpointName, MockHandler>();
  private readonly onceHandlers = new Map<EndpointName, MockHandler[]>();
  private readonly routes: RouteEntry[];

  constructor() {
    this.state = {
      user: makeUser(),
      profile: makeProfile(),
      liveMetrics: makeLiveMetrics(),
      matches: MATCH_HISTORY.map((row) => ({ ...row })),
      matchDetails: Object.fromEntries(
        MATCH_HISTORY.map((row) => [
          row.match_id,
          makeMatchDetail(row.match_id),
        ]),
      ),
      timelines: Object.fromEntries(
        MATCH_HISTORY.map((row) => [row.match_id, makeTimeline(row.match_id)]),
      ),
      credentials: { email: TEST_EMAIL, password: TEST_PASSWORD },
      accessToken: ACCESS_TOKEN,
      refreshToken: REFRESH_TOKEN,
      revokedAccessTokens: new Set<string>(),
      unknownRiotIds: new Set<string>(),
      syncResult: { fetched: 10, imported: 0, total: MATCH_HISTORY.length },
      syncAdds: [],
    };
    this.routes = this.buildRoutes();
  }

  /** Replace an endpoint for the rest of the test. */
  override(name: EndpointName, handler: MockHandler): void {
    this.overrides.set(name, handler);
  }

  /** Replace an endpoint for its next call only, then fall back to default. */
  once(name: EndpointName, handler: MockHandler): void {
    const queue = this.onceHandlers.get(name) ?? [];
    queue.push(handler);
    this.onceHandlers.set(name, queue);
  }

  /** Shorthand for the common "this endpoint is broken" case. */
  fail(name: EndpointName, status: number, detail: string): void {
    this.override(name, () => ({ status, json: { detail } }));
  }

  restore(name: EndpointName): void {
    this.overrides.delete(name);
    this.onceHandlers.delete(name);
  }

  callsTo(name: EndpointName): RecordedCall[] {
    return this.calls.filter((call) => call.name === name);
  }

  countOf(name: EndpointName): number {
    return this.callsTo(name).length;
  }

  lastBody<T = Record<string, unknown>>(name: EndpointName): T | undefined {
    const calls = this.callsTo(name);
    return calls.at(-1)?.body as T | undefined;
  }

  async install(context: BrowserContext): Promise<void> {
    // Riot's CDN: answer locally so the suite works offline and stays fast.
    // The name files are JSON, everything else under /cdn is an image.
    await context.route("https://ddragon.leagueoflegends.com/**", (route) => {
      const path = new URL(route.request().url()).pathname;
      const json = DDRAGON_JSON.find((entry) => entry.pattern.test(path));
      if (json) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(json.body),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "image/png",
        body: ONE_PIXEL_PNG,
      });
    });
    // Everything aimed at the backend origin, and nothing aimed at Vite.
    await context.route(
      (url) => url.origin === API_ORIGIN,
      (route) => this.handle(route),
    );
  }

  private async handle(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method().toUpperCase();

    const entry = this.routes.find(
      (candidate) =>
        candidate.method === method && candidate.pattern.test(url.pathname),
    );

    if (!entry) {
      // Uploaded avatars are served off the backend, outside the JSON API. The
      // lookup has to come first: the Cognito auth routes (/register, /login,
      // /confim-user) are unversioned too, so a plain prefix test would answer
      // them with a PNG.
      if (!url.pathname.startsWith("/api/")) {
        await route.fulfill({
          status: 200,
          contentType: "image/png",
          body: ONE_PIXEL_PNG,
        });
        return;
      }
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          detail: `No mock for ${method} ${url.pathname}`,
        }),
      });
      return;
    }

    const rawBody = request.postData();
    const mockRequest: MockRequest = {
      method,
      pathname: url.pathname,
      search: url.searchParams,
      params: (entry.pattern.exec(url.pathname) ?? []).slice(1),
      bearer: bearerFrom(request.headers()["authorization"]),
      json: <T>() => parseJson<T>(rawBody),
    };

    this.calls.push({
      name: entry.name,
      method,
      pathname: url.pathname,
      search: url.search,
      bearer: mockRequest.bearer,
      body: parseJson(rawBody) ?? rawBody ?? null,
    });

    const reply = (await this.runOnce(entry.name, mockRequest)) ??
      (await this.overrides.get(entry.name)?.(mockRequest)) ??
      (await entry.handle(mockRequest)) ?? { status: 204 };

    await route.fulfill({
      status: reply.status ?? 200,
      contentType: reply.contentType ?? "application/json",
      body:
        reply.body ??
        (reply.json === undefined ? "" : JSON.stringify(reply.json)),
    });
  }

  private async runOnce(
    name: EndpointName,
    request: MockRequest,
  ): Promise<MockReply | undefined> {
    const queue = this.onceHandlers.get(name);
    if (!queue?.length) return undefined;
    const handler = queue.shift();
    if (!queue.length) this.onceHandlers.delete(name);
    return handler?.(request);
  }

  /** 401 unless the request carries a live access token for a live user. */
  private guard(request: MockRequest): MockReply | undefined {
    if (!request.bearer) return unauthorised();
    if (this.state.revokedAccessTokens.has(request.bearer))
      return unauthorised();
    if (!this.state.user) return unauthorised();
    return undefined;
  }

  private tokens(): MockReply {
    return {
      json: {
        access_token: this.state.accessToken,
        refresh_token: this.state.refreshToken,
        token_type: "bearer",
      },
    };
  }

  private buildRoutes(): RouteEntry[] {
    return [
      // Cognito sign-up and sign-in live on unversioned paths and take their
      // arguments as JSON bodies, because each one carries a secret and a URL is
      // written to access logs and browser history. See
      // backend/app/api/router/auth_routes.py.
      {
        name: "register",
        method: "POST",
        pattern: /^\/register$/,
        handle: (request) => {
          const body = request.json<{ email?: string; username?: string }>();
          const email = body?.email ?? "";
          const username = body?.username ?? "";
          if (email === this.state.credentials.email) {
            return {
              status: 400,
              json: { detail: "Email already registered" },
            };
          }
          this.state.user = makeUser({
            email: email || "new@vantagepoint.dev",
            display_name: username || "New Player",
            riot_id_tag: null,
            has_linked_riot: false,
          });
          this.state.credentials = {
            email: this.state.user.email,
            password: TEST_PASSWORD,
          };
          // Cognito starts the account UNCONFIRMED and returns no tokens; the
          // client sends the user to /verify-email to redeem the emailed code.
          return { json: { status: "success" } };
        },
      },
      {
        name: "confirmUser",
        method: "POST",
        // The backend really does spell it "confim-user".
        pattern: /^\/confim-user$/,
        handle: (request) => {
          const code = request.json<{ code?: string }>()?.code ?? "";
          if (code !== CONFIRMATION_CODE) {
            return { status: 400, json: { detail: "Invalid code" } };
          }
          return { json: { status: "success" } };
        },
      },
      {
        name: "login",
        method: "POST",
        pattern: /^\/login$/,
        handle: (request) => {
          const body = request.json<{ username?: string; password?: string }>();
          const ok =
            body?.username === this.state.credentials.email &&
            body?.password === this.state.credentials.password;
          if (!ok) {
            return {
              status: 401,
              json: { detail: "Incorrect email or password" },
            };
          }
          this.state.revokedAccessTokens.delete(this.state.accessToken);
          return this.tokens();
        },
      },
      {
        name: "logout",
        method: "POST",
        pattern: /^\/logout$/,
        handle: () => ({ json: { message: "Signed out" } }),
      },
      {
        name: "refresh",
        method: "POST",
        pattern: /^\/refresh-auth$/,
        handle: (request) => {
          const body = request.json<{
            username?: string;
            refresh_token?: string;
          }>();
          // Cognito needs the username to compute the secret hash, so a refresh
          // that omits it is rejected before the token is even looked at.
          if (!body?.username) {
            return { status: 422, json: { detail: "username is required" } };
          }
          if (body.refresh_token !== this.state.refreshToken) {
            return { status: 401, json: { detail: "Invalid refresh token" } };
          }
          this.state.accessToken = ROTATED_ACCESS_TOKEN;
          // Deliberately does not rotate the refresh token: a REFRESH_TOKEN_AUTH
          // exchange returns a new access token and an id token, nothing else.
          return {
            json: {
              access_token: this.state.accessToken,
              id_token: null,
            },
          };
        },
      },
      {
        name: "liveMetrics",
        method: "GET",
        pattern: /^\/api\/v1\/users\/me\/live-metrics$/,
        handle: (request) =>
          this.guard(request) ?? { json: this.state.liveMetrics },
      },
      {
        name: "profile",
        method: "GET",
        pattern: /^\/api\/v1\/users\/me\/profile$/,
        handle: (request) =>
          this.guard(request) ?? { json: this.state.profile },
      },
      {
        name: "uploadAvatar",
        method: "POST",
        pattern: /^\/api\/v1\/users\/me\/avatar$/,
        handle: (request) => {
          const denied = this.guard(request);
          if (denied) return denied;
          const avatarUrl = "/static/avatars/e2e.png";
          if (this.state.user) this.state.user.avatar_url = avatarUrl;
          this.state.profile.avatar_url = avatarUrl;
          return { json: { avatar_url: avatarUrl } };
        },
      },
      {
        name: "deleteAvatar",
        method: "DELETE",
        pattern: /^\/api\/v1\/users\/me\/avatar$/,
        handle: (request) => {
          const denied = this.guard(request);
          if (denied) return denied;
          if (this.state.user) this.state.user.avatar_url = null;
          this.state.profile.avatar_url = null;
          return { status: 204 };
        },
      },
      {
        name: "linkRiot",
        method: "POST",
        pattern: /^\/api\/v1\/users\/me\/game-accounts$/,
        handle: (request) => this.linkAccount(request),
      },
      {
        name: "updateRiot",
        method: "PUT",
        pattern: /^\/api\/v1\/users\/me\/game-accounts$/,
        handle: (request) => this.linkAccount(request),
      },
      {
        name: "me",
        method: "GET",
        pattern: /^\/api\/v1\/users\/me$/,
        handle: (request) => this.guard(request) ?? { json: this.state.user },
      },
      {
        name: "updateMe",
        method: "PATCH",
        pattern: /^\/api\/v1\/users\/me$/,
        handle: (request) => {
          const denied = this.guard(request);
          if (denied) return denied;
          const body = request.json<{ display_name: string }>();
          if (body?.display_name && this.state.user) {
            this.state.user.display_name = body.display_name;
            this.state.profile.display_name = body.display_name;
          }
          return { json: this.state.user };
        },
      },
      {
        name: "matchSync",
        method: "POST",
        pattern: /^\/api\/v1\/matches\/sync$/,
        handle: (request) => {
          const denied = this.guard(request);
          if (denied) return denied;
          this.state.matches.push(...this.state.syncAdds);
          const imported = this.state.syncAdds.length;
          this.state.syncAdds = [];
          return {
            json: {
              ...this.state.syncResult,
              imported: imported || this.state.syncResult.imported,
              total: this.state.matches.length,
            },
          };
        },
      },
      {
        name: "matchTimeline",
        method: "GET",
        pattern: /^\/api\/v1\/matches\/([^/]+)\/timeline$/,
        handle: (request) => {
          const denied = this.guard(request);
          if (denied) return denied;
          const matchId = decodeURIComponent(request.params[0] ?? "");
          const timeline = this.state.timelines[matchId];
          if (!timeline) {
            return { status: 404, json: { detail: "Timeline not stored" } };
          }
          return { json: timeline };
        },
      },
      {
        name: "matchHistory",
        method: "GET",
        pattern: /^\/api\/v1\/matches$/,
        handle: (request) =>
          this.guard(request) ?? { json: this.state.matches },
      },
      {
        name: "matchDetail",
        method: "GET",
        pattern: /^\/api\/v1\/matches\/([^/]+)$/,
        handle: (request) => {
          const denied = this.guard(request);
          if (denied) return denied;
          const matchId = decodeURIComponent(request.params[0] ?? "");
          const detail = this.state.matchDetails[matchId];
          if (!detail) {
            return { status: 404, json: { detail: "Match not found" } };
          }
          return { json: detail };
        },
      },
    ];
  }

  private linkAccount(request: MockRequest): MockReply {
    const denied = this.guard(request);
    if (denied) return denied;
    const riotId = request.json<{ riot_id: string }>()?.riot_id ?? "";
    if (!riotId.includes("#") || this.state.unknownRiotIds.has(riotId)) {
      return {
        status: 404,
        json: { detail: `Riot ID "${riotId}" was not found.` },
      };
    }
    if (this.state.user) {
      this.state.user.riot_id_tag = riotId;
      this.state.user.has_linked_riot = true;
    }
    this.state.profile.riot_id_tag = riotId;
    return {
      json: {
        puuid: "puuid-blue-1",
        riot_id_tag: riotId,
        message: "Linked",
      },
    };
  }
}

function bearerFrom(header: string | undefined): string | null {
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  return header.slice("bearer ".length);
}

function parseJson<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export { PRIMARY_MATCH_ID } from "./data";
