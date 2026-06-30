import boto3
from app.config import get_settings

settings = get_settings()

client = boto3.client("cognito-idp", region_name=settings.aws_region) #type: ignore

#admin abilities/services

class admin_service:
    async def get_users(self, limit: int = 10):

        response = client.list_users(
            UserPoolId=settings.cognito_user_pool_id,
            Limit=limit
        )

    async def get_user(self, username: str):
        
        response = client.admin_get_user(
            UserPoolId=settings.cognito_user_pool_id,
            Username=username
        )