import boto3
import hmac
import hashlib
import base64
from botocore.exceptions import ClientError
from mypy_boto3_cognito_idp import CognitoIdentityProviderClient
from app.config import get_settings

settings = get_settings()

# Initialize the Cognito Client
client: CognitoIdentityProviderClient = boto3.client('cognito-idp', region_name=settings.aws_region)

def get_secret_hash(username: str):
    """
    Cognito requires a keyed-hash (HMAC) to verify the client.
    """
    msg = username + settings.cognito_client_id
    dig = hmac.new(
        str(settings.cognito_client_secret).encode('utf-8'),
        msg=msg.encode('utf-8'), 
        digestmod=hashlib.sha256
    ).digest()
    return base64.b64encode(dig).decode()

def log_registration(username:str, email:str):
    """Writes new user info to a local text file"""
    with open("registrations.txt", "a") as f:
        f.write(f"User: {username} | Email: {email} | Status: REGISTERED\n")

async def register_user(username: str, password: str, email: str):
    try: 
        response = client.sign_up(
            ClientId=settings.cognito_client_id,
            SecretHash=get_secret_hash(username),
            Username=username,
            Password=password,
            UserAttributes=[{'Name': 'email', 'Value': email}],
        )

        # 2. AUTO-CONFIRM (Only for local testing!)
        # This makes the user active immediately so they can login.
        if settings.debug: # Use your debug flag from config.py
            client.admin_confirm_sign_up(
                UserPoolId=settings.cognito_user_pool_id,
                Username=username
            )

        log_registration(username, email)
        return response
    except ClientError as e:
        return {'error': str(e)}
    

async def login_user(username: str, password: str):
    try:
        response = client.initiate_auth(
            ClientId=settings.cognito_client_id,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': username,
                'PASSWORD': password,
                'SECRET_HASH': get_secret_hash(username)
            }
        )
        # This returns the AccessToken, IdToken, and RefreshToken
        return response['AuthenticationResult']
    except ClientError as e:
        return {"error": str(e)}
    
async def confirm_user(username: str, code: str):
    """Confirm the user using the code sent to their email."""
    try:
        client.confirm_sign_up(
            ClientId=settings.cognito_client_id,
            SecretHash=get_secret_hash(username),
            Username=username,
            ConfirmationCode=code
        )
        return {"status": "success"}
    except ClientError as e:
        error_message = e.response.get('Error', {}).get('Message', 'Could not confirm please try again later!')
        return {"error": error_message}
    

async def logout_user(access_token: str):
    """
    Invalidates the user's tokens globally in Cognito.
    """
    try:
        client.global_sign_out(AccessToken=access_token)
        return {"status": "success", "message": "Logged out from all devices"}
    except ClientError as e:
        return {"error": str(e)}
    
async def revoke_refresh_token(refresh_token: str):
    """
    Revokes a specific refresh token and its associated access tokens.
    """
    try:
        client.revoke_token(
            Token=refresh_token,
            ClientId=settings.cognito_client_id,
            ClientSecret=settings.cognito_client_secret,
            # SecretHash is NOT needed for revoke_token, 
            # but ClientSecret IS if your client has one
        )
        return {"status": "success", "message": "Refresh token revoked."}
    except ClientError as e:
        return {"error": str(e)}