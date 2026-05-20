Api Endpoints Documentation

League of legends

This will be the data sent to the frontend

Base URL: http://127.0.0.1:8000

Version: 1.0.0

Last Updated: 13 May 2026

Table of Contents
1 Authentication Endpoints

2 User Profile Endpoints

3 Riot & Match Data Endpoints

1.1 Register User
Endoint: POST /api/auth/register

Description: Creates a new user Account
This might change later on as we still need to decide on the riot api. 

Request Body: 
{
    "username": "Sn1per1",
    "email": "player@example.com",
    "password": "SecurePass123!"
}


Response Body:
{
  "message": "User registered successfully."
}


1.2 Login User
Endpoint: /api/auth/login

Description: Authenticates a user and returns Cognito JWT tokens.

Request Body: 
{
  "password": "securepassword123",
  "username": "Sn1per1"
}

Response Body: 
{
    "AccessToken": "eyJraWQiOiJFMnk3eDc...",
    "ExpiresIn": 3600,
    "TokenType": "Bearer",
    "RefreshToken": "eyJjdHkiOiJKV1QiLCJ...",
    "IdToken": "eyJraWQiOiJsMmVHZ0g..."
}

1.3 Confirm Email
Endpoint: Post /api/auth/confirm
Description: Verifies the user's email registration using the Cognito confirmation code

Request Body:
{
   "username": "Sn1per1",
  "confirmation_code": "123456" 
}

Response Body:
{
    "status": "success"
}

1.4 Logout User
Endpoint: /api/auth/logout
Description: Globally invalidates the user's active session across all devices.
Requires Authentication: Bearer <Access Token>

Responde Body:
{
  "message": "Successfully logged out from all devices."
}

Pending Backend Implementation
The following authentication endpoints exist in design but are missing from the current codebase:
POST /api/auth/resend-code (Resends registration code)
POST /api/auth/forgot-password (Triggers password reset flow)

1.5 Resend Verification Code
EndPoint: POST /api/auth/resend-code

Description: Resends email verification code

Request Body:
{
    "username": "Sn1per1"
}
Response Body:
{
    "status": "success",
    "message": "Verification code sent successfully",
    "data": {
        "username": "Sn1per1",
        "email": "p***@example.com",
        "resend_available_after": "2026-05-13T10:35:00Z"
    }
}

1.5 Forgot Password
Endpoint: POST /api/auth/forgot-password

Description: Requests password reset code via email.

Request Body
{
    "username": "Sn1per1"
}

Response Body: 
{
    status": "success",
    "message": "If an account exists, a password reset code has been sent to your email",
    "data": {
        "code_expires_in_minutes": 10
    }
}

1.6 Delete Account
Endpoint: /api/profile

Description: Delete a Users Account

Response Body:
{}

1.7 Undo Delete Account
Endpoint: /api/profile

Description: Delete a Users Account

2 User Profile Endpoints
All endpoints in this section require an authentication header: Authorization: Bearer <Token>.

2.1 Get Profile Summary
Endpoint: Get /api/profile
Description: Retrieves the authenticated user's profile details and a parsed aggregate performance summary.
Still up to be chnaged is mock data at the moment
Response Body:
{
  "uuid": "b0fc69dc-40a1-704a-5302-a6c936519de9",
  "username": "Sn1per1",
  "total_matches": 142,
  "player_summary": {
    "most_played_character": "Jinx",
    "common_mistakes": [
      "Low vision score",
      "Overextending late game"
    ],
    "avg_kda": "8.4 / 4.2 / 6.1",
    "win_rate": "54%"
  }
}

2.2 Update Riot Key
Endpoint Put /api/profile/riot-key
Description: Temporarily updates the Riot API key configuration for the user's current session.

Request Body:
{
    "riot_api_key": "RGAPI-xxx..."
}

Response Body:
{
  "message": "Riot API Key updated successfully for this session.",
  "user": "Sn1per1",
  "status": "mock_verified"
}

2.3 Delete Account 
Endpoint Delete /api/profile
Description:Places the authenticated account into a 30-day grace period queue before permanent deletion.

Response Body:
{
    "message": "Account marked for deletion. You have 30 days to undo this action."
}

2.4 Undo Delete Account 
Endpoint Post /api/profile/undo-delete

Response Bidy:
{
    "message": "Account deletion cancelled successfully"
}

3 Riot & Match Data Endpoints

3.2 Get Riot Match IDs by PUUID
Endpoint: Get /api/riot/mathces/{puuid}
Description: Hits the live Riot API engine to pull historical match ID strings associated with a specific Player UUID.
Query Params: count(optional, default=5)

Response Body:
[
    NA1_51029301",
  "NA1_51028442",
  "NA1_51027119"
]

3.3 Get Single Player Filtered Match Summary
Endpoint Get  /api/matches/{match_id}/filtered
Description: Resolves full match details directly through Riot's servers and outputs an optimized, lightweight runtime payload focused on a singular player's stats

Query Parameters:

puuid (string, required): The target player's exact PUUID.


Response Body: 
{
  "match_id": "NA1_51029301",
  "game_mode": "CLASSIC",
  "game_duration_seconds": 1930,
  "game_end_timestamp": "2026-05-13T14:22:00Z",
  "target_player": {
    "puuid": "0d2c7b5e-riot-puuid-example-123456",
    "riot_id": "Sn1per1#NA1",
    "champion_name": "Jinx",
    "champion_id": 222,
    "team_position": "BOTTOM",
    "win": true,
    "kills": 12,
    "deaths": 3,
    "assists": 8,
    "kda": 6.67,
    "gold_earned": 15400,
    "total_damage_dealt_to_champions": 28450,
    "vision_score": 18,
    "creep_score": {
      "total_minions_killed": 235,
      "neutral_minions_killed": 12,
      "cs_per_minute": 7.7
    },
    "items": [
      3031,
      3046,
      3006,
      1055,
      3072,
      0,
      3363
    ]
  }
}