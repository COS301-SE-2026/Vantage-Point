# Cognito Backend Requirements

This document lists AWS console setup and backend code changes required for the Cognito frontend auth integration. The frontend targets these contracts; full end-to-end auth will not work until these items are complete.

## AWS Cognito console

### Hosted UI domain

1. Cognito console → User pool → **App integration** → **Domain**
2. Create a Cognito domain prefix (e.g. `vantage-point-dev`)
3. Full authorize URL base: `https://{domain}.auth.{region}.amazoncognito.com`

### App client OAuth settings

On the existing **confidential** app client (`COGNITO_CLIENT_SECRET` must remain server-side):

| Setting | Value |
|---------|--------|
| Allowed OAuth flows | Authorization code grant |
| Callback URL(s) | `http://localhost:5173/auth/callback` (+ production URL) |
| Sign-out URL(s) | `http://localhost:5173/login` |
| OAuth scopes | `openid`, `email`, `profile` |
| Auth flows | Keep `USER_PASSWORD_AUTH` enabled |

### Sign-in aliases

- User pool → **Sign-in experience** → enable **email** as a sign-in option
- Frontend uses email as the Cognito `username` on register/login

### Federated identity providers

| Provider | Cognito type | Callback to register at IdP |
|----------|--------------|------------------------------|
| Google | Google | `https://{cognito-domain}.auth.{region}.amazoncognito.com/oauth2/idpresponse` |
| Apple | Sign in with Apple | Same Cognito `idpresponse` URL |
| Riot | Custom OIDC (RSO) | Same Cognito `idpresponse` URL |

**Riot custom OIDC endpoints (manual input in Cognito):**

| Endpoint | URL |
|----------|-----|
| Authorization | `https://auth.riotgames.com/authorize` |
| Token | `https://auth.riotgames.com/token` |
| UserInfo | `https://auth.riotgames.com/userinfo` |
| JWKS URI | `https://auth.riotgames.com/jwks.json` |

Scopes: `openid cpid` (minimum `openid` required).

Record the **provider names** exactly as configured in Cognito — the frontend passes them as `identity_provider`:

- `Google`
- `SignInWithApple`
- `Riot` (or your custom OIDC provider name; update `COGNITO_PROVIDERS` in the frontend if different)

---

## Backend environment variables

Add to [`backend/app/config.py`](../backend/app/config.py) and `backend/.env.example`:

| Variable | Description |
|----------|-------------|
| `AWS_REGION` | Already exists (default `eu-west-1`) |
| `COGNITO_USER_POOL_ID` | Already exists |
| `COGNITO_CLIENT_ID` | Already exists |
| `COGNITO_CLIENT_SECRET` | Already exists |
| `COGNITO_DOMAIN` | Hosted UI domain prefix (no `https://`) |
| `COGNITO_OAUTH_REDIRECT_URI` | Must match frontend callback, e.g. `http://localhost:5173/auth/callback` |

---

## Required backend API changes

### 1. Normalize token responses

**File:** [`backend/app/api/routes.py`](../backend/app/api/routes.py)

`POST /api/auth/login` currently returns raw AWS `AuthenticationResult` (PascalCase). Normalize to:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "id_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

The frontend accepts both PascalCase and snake_case until this ships.

### 2. `POST /api/auth/refresh`

**Files:** [`backend/app/services/auth_service.py`](../backend/app/services/auth_service.py), `routes.py`

- Request: `{ "refresh_token": "..." }`
- Use Cognito `InitiateAuth` with `AuthFlow=REFRESH_TOKEN_AUTH`
- Return normalized token response (same shape as login)

### 3. `POST /api/auth/oauth/callback`

**Files:** `auth_service.py`, `routes.py`

- Request: `{ "code": "...", "redirect_uri": "..." }`
- Server-side POST to `https://{COGNITO_DOMAIN}.auth.{region}.amazoncognito.com/oauth2/token`
- Use `grant_type=authorization_code`, client id + **client secret** (never expose secret to frontend)
- Return normalized token response

### 4. Register validation

**File:** `routes.py`

- Validate `confirm_password` matches `password` on `POST /api/auth/register` (schema exists; route does not check today)

### 5. Cognito JWT → `Users` table bridge

**Files:** [`backend/app/auth/deps.py`](../backend/app/auth/deps.py), new `backend/app/services/cognito_users.py`

The frontend calls `GET /api/v1/users/me` with a Cognito **AccessToken**. Today `auth/deps.py` validates local HS256 JWTs against the `Users` table.

Required behavior:

1. Reuse JWKS validation from [`backend/app/api/auth.py`](../backend/app/api/auth.py) (extract shared `decode_cognito_token()` helper)
2. Read claims: `sub`, `email`, `name` / `cognito:username`
3. `get_or_create_user(session, sub, email, display_name)` where `Users.id = cognito_sub`
4. Cognito-only users: use a sentinel `password_hash` (never verified locally)

### 6. Mount v1 routers (not local JWT auth)

**File:** [`backend/app/main.py`](../backend/app/main.py)

```python
from app.routers import users, matches

app.include_router(users.router)
app.include_router(matches.router)
# Do NOT mount routers/auth.py — Cognito replaces local JWT register/login/refresh
```

This enables endpoints the frontend already uses:

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `POST /api/v1/users/me/game-accounts`
- `GET /api/v1/users/me/profile`
- Match routes under `/api/v1/...`

### 7. Logout

`POST /api/auth/logout` already exists. Frontend sends Bearer **AccessToken** (not IdToken) for `global_sign_out`.

---

## Token contract (target)

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "id_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

## Verification checklist (backend team)

- [ ] Hosted UI domain + OAuth callback URLs configured
- [ ] Google, Apple, Riot IdPs configured with correct `idpresponse` callbacks
- [ ] Email sign-in alias enabled on user pool
- [ ] Login returns normalized tokens (or PascalCase accepted by frontend)
- [ ] Refresh endpoint works with stored refresh token
- [ ] OAuth callback exchanges authorization code server-side
- [ ] `GET /api/v1/users/me` works with Cognito AccessToken
- [ ] Riot linking and dashboard routes work after login
- [ ] Logout invalidates Cognito session globally

---

## Related frontend files

- [`frontend/src/landing/app/api/auth.ts`](../../frontend/src/landing/app/api/auth.ts)
- [`frontend/src/landing/app/lib/cognito-oauth.ts`](../../frontend/src/landing/app/lib/cognito-oauth.ts)
- [`frontend/.env.example`](../../frontend/.env.example)
