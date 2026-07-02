export const COGNITO_PROVIDERS = {
  Google: "Google",
  SignInWithApple: "SignInWithApple",
  Riot: "Riot",
} as const;

export type CognitoProvider =
  (typeof COGNITO_PROVIDERS)[keyof typeof COGNITO_PROVIDERS];

function getCognitoConfig(): {
  domain: string;
  clientId: string;
  redirectUri: string;
  region: string;
} | null {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN?.trim();
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID?.trim();
  const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI?.trim();
  const region = import.meta.env.VITE_AWS_REGION?.trim() ?? "eu-west-1";

  if (!domain || !clientId || !redirectUri) {
    return null;
  }

  return { domain, clientId, redirectUri, region };
}

export function isCognitoOAuthConfigured(): boolean {
  return getCognitoConfig() !== null;
}

export function buildAuthorizeUrl(provider: CognitoProvider): string | null {
  const config = getCognitoConfig();
  if (!config) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    scope: "openid email profile",
    redirect_uri: config.redirectUri,
    identity_provider: provider,
  });

  return `https://${config.domain}.auth.${config.region}.amazoncognito.com/oauth2/authorize?${params.toString()}`;
}

export function getOAuthRedirectUri(): string | null {
  return getCognitoConfig()?.redirectUri ?? null;
}
