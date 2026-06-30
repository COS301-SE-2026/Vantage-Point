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

        return response

    async def get_user(self, username: str):
        
        response = client.admin_get_user(
            UserPoolId=settings.cognito_user_pool_id,
            Username=username
        )

        return response

    async def add_user_to_group(self, username:str, group: str="Users"):

        response = client.admin_add_user_to_group(
            UserPoolId=settings.cognito_user_pool_id,
            Username=username,
            GroupName=group
        )

        return response
    
    async def remove_user_from_group(self, username: str, group: str ="Users"):
        response = client.admin_remove_user_from_group(
            UserPoolId=settings.cognito_user_pool_id,
            Username=username,
            GroupName=group
        )

        return response
    
    async def disable_user(self, username: str):
        response = client.admin_disable_user(
            UserPoolId=settings.cognito_user_pool_id,
            Username=username
        )

        return response
    
    async def enable_user(self, username: str):
        response = client.admin_enable_user(
            UserPoolId=settings.cognito_user_pool_id,
            Username=username
        )

        return response
    
    async def set_password(self, username: str, password: str):
        response = client.admin_set_user_password(
            UserPoolId=settings.cognito_user_pool_id,
            Username=username,
            Password=password,
            Permanent=True
        )

        return response
    
    #todo update user attr

    async def user_global_sign_out(self, username: str):
        response = client.admin_user_global_sign_out(
            UserPoolId=settings.cognito_user_pool_id,
            Username=username
        )

        return response
    
    async def delete_user(self, username: str):
        response = client.admin_delete_user(
            UserPoolId=settings.cognito_user_pool_id,
            Username=username
        )

        return response