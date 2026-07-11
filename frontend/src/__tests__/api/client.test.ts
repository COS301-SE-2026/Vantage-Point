// src/__tests__/api/client.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  ApiError,
  apiFetch,
  apiFetchFormData,
  apiFetchPublic,
} from "../../api/client";
import * as tokens from "../../lib/tokens";

//1. Mock the tokens module
vi.mock("../../lib/tokens", () => ({
  getStoredTokens: vi.fn(),
  setStoredTokens: vi.fn(),
  clearStoredTokens: vi.fn(),
}));

//2. MOck global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// A fake api URL via environmonent variable
vi.stubEnv("VITE_API_URL", "https://fakeapi.com");

const { getStoredTokens, setStoredTokens, clearStoredTokens } =
  vi.mocked(tokens);

beforeEach(() => {
  vi.resetAllMocks();
  // default token state should be : no tokens
  getStoredTokens.mockReturnValue({ accessToken: null, refreshToken: null });
});

// Helper function to mock fetch responses
function makeResponse(
  status: number,
  body: unknown = null,
  statusText: string = "OK",
): Response {
  const bodyTest = body !== null ? JSON.stringify(body) : "";
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(bodyTest),
  } as unknown as Response;
}

// test cases start below

// ApiError class tests
describe("ApiError", () => {
  it("carries the HTTP status and message", () => {
    const err = new ApiError(404, "Not Found");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not Found");
    expect(err.name).toBe("ApiError");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });
});

// apiFetch function tests
describe("apiFetch", () => {
  it("makes a GET request to the correct URL", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(200, { ok: true }));

    await apiFetch("/test");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:8000/test");
  });

  it("attaches Authorization header when access token is present", async () => {
    getStoredTokens.mockReturnValue({
      accessToken: "tok-abc",
      refreshToken: null,
    });
    mockFetch.mockResolvedValueOnce(makeResponse(200, { data: 1 }));

    await apiFetch("/secure");

    const [, init] = mockFetch.mock.calls[0] as [
      string,
      RequestInit & { headers: Headers },
    ];
    expect(init.headers.get("Authorization")).toBe("Bearer tok-abc");
  });

  it("does not set Authorization header when no access token", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(200, { data: 1 }));

    await apiFetch("/public");

    const [, init] = mockFetch.mock.calls[0] as [
      string,
      RequestInit & { headers: Headers },
    ];
    expect(init.headers.get("Authorization")).toBeNull();
  });

  it("sets Content-Type: application/json when body is present and header not already set", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(200, {}));

    await apiFetch("/data", { method: "POST", body: JSON.stringify({ x: 1 }) });

    const [, init] = mockFetch.mock.calls[0] as [
      string,
      RequestInit & { headers: Headers },
    ];
    expect(init.headers.get("Content-Type")).toBe("application/json");
  });

  it("does not override an explicit Content-Type header", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(200, {}));

    await apiFetch("/data", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "raw",
    });

    const [, init] = mockFetch.mock.calls[0] as [
      string,
      RequestInit & { headers: Headers },
    ];
    expect(init.headers.get("Content-Type")).toBe("text/plain");
  });

  it("returns parsed JSON on success", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(200, { name: "vantage" }));

    const result = await apiFetch<{ name: string }>("/info");
    expect(result).toEqual({ name: "vantage" });
  });

  it("returns undefined for 204 No Content", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(204));

    const result = await apiFetch("/no-content");
    expect(result).toBeUndefined();
  });

  it("throws ApiError with string detail on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(400, { detail: "Bad input" }));

    await expect(apiFetch("/bad")).rejects.toMatchObject({
      status: 400,
      message: "Bad input",
    });
  });

  it("throws ApiError with first array detail msg on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce(
      makeResponse(422, { detail: [{ msg: "field required" }] }),
    );

    await expect(apiFetch("/validate")).rejects.toMatchObject({
      status: 422,
      message: "field required",
    });
  });

  it("falls back to statusText when error body is not parseable JSON", async () => {
    const badResponse = {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: vi.fn().mockRejectedValue(new SyntaxError("bad json")),
    } as unknown as Response;
    mockFetch.mockResolvedValueOnce(badResponse);

    await expect(apiFetch("/crash")).rejects.toMatchObject({
      status: 500,
      message: "Internal Server Error",
    });
  });

  // ── 401 / token refresh ───────────────────────────────────────────────────

  it("retries with new token after successful refresh on 401", async () => {
    getStoredTokens
      .mockReturnValueOnce({ accessToken: "old-tok", refreshToken: "ref-tok" }) // initial call
      .mockReturnValueOnce({ accessToken: "old-tok", refreshToken: "ref-tok" }) // inside refreshAccessToken
      .mockReturnValueOnce({ accessToken: "new-tok", refreshToken: "ref-tok" }); // retry call

    mockFetch
      .mockResolvedValueOnce(makeResponse(401, { detail: "Unauthorized" })) // original request
      .mockResolvedValueOnce(
        // refresh endpoint
        makeResponse(200, {
          access_token: "new-tok",
          refresh_token: "ref-tok",
        }),
      )
      .mockResolvedValueOnce(makeResponse(200, { data: "secret" })); // retry

    const result = await apiFetch<{ data: string }>("/secure");

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(setStoredTokens).toHaveBeenCalledWith("new-tok", "ref-tok");
    expect(result).toEqual({ data: "secret" });

    // The retry request should use the new token
    const [, retryInit] = mockFetch.mock.calls[2] as [
      string,
      RequestInit & { headers: Headers },
    ];
    expect(retryInit.headers.get("Authorization")).toBe("Bearer new-tok");
  });

  it("throws ApiError when refresh fails on 401", async () => {
    getStoredTokens.mockReturnValue({
      accessToken: "old",
      refreshToken: "ref",
    });

    mockFetch
      .mockResolvedValueOnce(makeResponse(401, { detail: "Unauthorized" })) // original
      .mockResolvedValueOnce(makeResponse(401, {})); // refresh fails

    await expect(apiFetch("/secure")).rejects.toMatchObject({ status: 401 });
    expect(clearStoredTokens).toHaveBeenCalledOnce();
  });

  it("does not retry when retryOnUnauthorized is false", async () => {
    getStoredTokens.mockReturnValue({
      accessToken: "tok",
      refreshToken: "ref",
    });
    mockFetch.mockResolvedValueOnce(
      makeResponse(401, { detail: "Unauthorized" }),
    );

    await expect(apiFetch("/secure", {}, false)).rejects.toMatchObject({
      status: 401,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("does not attempt refresh when no refresh token is stored", async () => {
    getStoredTokens.mockReturnValue({ accessToken: "tok", refreshToken: null });
    mockFetch.mockResolvedValueOnce(
      makeResponse(401, { detail: "Unauthorized" }),
    );

    await expect(apiFetch("/secure")).rejects.toMatchObject({ status: 401 });
    // Only the original request — refresh endpoint never called
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

// apiFetchFormData function tests
describe("apiFetchFormData", () => {
  it("Should POSTs FormData to the correct URL", async () => {
    mockFetch.mockResolvedValue(makeResponse(200, { uploaded: true }));

    const formData = new FormData();
    formData.append("file", "blobdata");
    await apiFetchFormData("/upload", formData);

    const [url, init] = mockFetch.mock.calls[0] as [
      string,
      RequestInit & { headers: Headers },
    ];
    expect(url).toBe("http://localhost:8000/upload");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(formData);
  });

  it("should attach Authorization header if access token is present", async () => {
    getStoredTokens.mockReturnValue({
      accessToken: "abc-123",
      refreshToken: "null",
    });

    mockFetch.mockResolvedValue(makeResponse(200, {}));

    await apiFetchFormData("/upload", new FormData());

    const [, init] = mockFetch.mock.calls[0] as [
      string,
      RequestInit & { headers: Headers },
    ];
    expect(init.headers.get("Authorization")).toBe("Bearer abc-123");
  });

  it("should not set Content-Type (lets browser set multipart/form-data boundary)", async () => {
    mockFetch.mockResolvedValue(makeResponse(200, {}));

    await apiFetchFormData("/upload", new FormData());

    const [, init] = mockFetch.mock.calls[0] as [
      string,
      RequestInit & { headers: Headers },
    ];
    expect(init.headers.get("Content-Type")).toBeNull();
  });

  it("should return parsed JSON on success", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(200, { id: 69 }));

    const result = await apiFetchFormData("/upload", new FormData());
    expect(result).toEqual({ id: 69 });
  }); // we all know why 69 is such a nice number

  it("should throw ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce(
      makeResponse(413, { detail: "File is too large big boss" }),
    );

    await expect(
      apiFetchFormData("/upload", new FormData()),
    ).rejects.toMatchObject({
      status: 413,
      message: "File is too large big boss",
    });
  });

  it("should retry with a new token after successful refresh on 401 response", async () => {
    getStoredTokens
      .mockReturnValueOnce({
        accessToken: "old-token",
        refreshToken: "refresh-token",
      }) // initial call returns old token
      .mockReturnValueOnce({
        accessToken: "old-token",
        refreshToken: "refresh-token",
      }) //this call is for the first fetch call, which will return 401, so we need to return the same old token
      .mockReturnValueOnce({
        accessToken: "new-token",
        refreshToken: "refresh-token",
      }); // after refresh, returns new token

    mockFetch
      .mockResolvedValueOnce(makeResponse(401, { detail: "Unauthorized" })) // first fetch call returns 401
      .mockResolvedValueOnce(
        makeResponse(200, {
          accessToken: "new-token",
          refreshToken: "refresh-token",
        }),
      ) // second fetch call returns 200
      .mockResolvedValueOnce(makeResponse(200, { done: true })); // third fetch call returns 200

    const result = await apiFetchFormData<{ done: boolean }>(
      "/upload",
      new FormData(),
    );

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ done: true });
  });

  it("should not rety when retryOnUnauthorized is false", async () => {
    getStoredTokens.mockReturnValue({
      accessToken: "old-token",
      refreshToken: "refresh-token",
    });

    mockFetch.mockResolvedValueOnce(makeResponse(401, {}));

    await expect(
      apiFetchFormData("/upload", new FormData(), false),
    ).rejects.toMatchObject({
      status: 401,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

// apiFetchPublic function tests
describe("apiFetchPublic", () => {
  it("should make a request for data without authorization", async () => {
    mockFetch.mockResolvedValue(makeResponse(200, { public: true }));

    await apiFetchPublic("/open"); //I am not entirely sure if open or /open is the correct path, but I will assume it is for now

    const [, init] = mockFetch.mock.calls[0] as [
      string,
      RequestInit & { headers: Headers },
    ];
    expect(init.headers.get("Authorization")).toBeNull();
  });

  it("should set Content-Type: application/json when body is present", async () => {
    mockFetch.mockResolvedValue(makeResponse(200, {}));

    await apiFetchPublic("/open", {
      method: "POST",
      body: JSON.stringify({ q: 1 }),
    });

    const [, init] = mockFetch.mock.calls[0] as [
      string,
      RequestInit & { headers: Headers },
    ];
    expect(init.headers.get("Content-Type")).toBe("application/json");
  });

  it("should return parsed JSON on success", async () => {
    mockFetch.mockResolvedValueOnce(
      makeResponse(200, { greetings: "COMRADE" }),
    );

    const result = await apiFetchPublic("/open");
    expect(result).toEqual({ greetings: "COMRADE" });
  }); // just to put it out there, I just find it funny to greet people with Comrade, no particular reason

  it("should throw ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce(
      makeResponse(404, { error: "Not Found" }, "Not Found"),
    );

    await expect(apiFetchPublic("/missing")).rejects.toMatchObject({
      status: 404,
      message: "Not Found",
    });
  });

  it("does not perform token refresh on 401 response (public endpoint)", async () => {
    mockFetch.mockResolvedValueOnce(
      makeResponse(401, { detail: "Unauthorized" }),
    );

    await expect(apiFetchPublic("/open")).rejects.toMatchObject({
      status: 401,
      message: "Unauthorized",
    });

    // Only 1 fetch call : no refresh attempt should be made for public endpoints
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
