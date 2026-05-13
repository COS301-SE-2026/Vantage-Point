Api Endpoints Documentation

League of legends

This will be the data sent to the frontend

Base URL: http://127.0.0.1:8000
Version: 1.0.0
Last Updated: 13 May 2026

Table of Contents
1. Authentication

1. Authentication Endpoints

1.1 Register User
Endoint: POST /api/auth/register

Description: Creates a new user Account
This might change later on as we still need to decide on the riot api. 

Request Body: 
{
    "username": "Sn1per1",
    "email": "player@example.com",
    "password": "SecurePass123!",
    "confirm_password": "SecurePass123!"
}


Response Body:
{
  "message": "User registered successfully."
}


1.2 Login User
Endpoint: /api/auth/login

Description: Used to login a user.
Will allow to use riot ID through cognito

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

1.3 Logout
Endpoint: /api/auth/logout

Responde Body:
{
  "message": "Successfully logged out from all devices."
}

1.4 Confirm Email
Endpoint: POST /api/auth/confirm

Description: Verifies user's email with confirmation code.

Request Body: 
{
    "username": "Sn1per1",
    "confirmation_code": "123456"
}

Response Body: 
{
    "status": "success"
}

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

