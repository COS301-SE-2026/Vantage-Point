import boto3
from botocore.exceptions import ClientError
from app.config import get_settings
from fastapi import HTTPException
import asyncio

settings = get_settings()

client = boto3.client("cognito-idp", region_name=settings.aws_region) #type: ignore

#admin abilities/services

class admin_service:
    @staticmethod
    async def get_users(limit: int = 10):
       try: 
            response = await asyncio.to_thread(
            client.list_users,
            UserPoolId=settings.cognito_user_pool_id,
            Limit=limit
            )

            return response
       except ClientError as e:
           error = e.response.get("Error", {})
           error_code = error.get("Code", "ClientError")
           if error_code == "UserNotFoundException":
               raise HTTPException(status_code=404, detail="Uer not found.")
           if error_code == "InvalidParamaterException":
               raise HTTPException(status_code=422, detail="Invalid username")
           raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def get_user(username: str):
        try:
            response = await asyncio.to_thread(
                client.admin_get_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username
            )

            return response
        except ClientError as e:
           error = e.response.get("Error", {})
           error_code = error.get("Code", "ClientError")
           if error_code == "UserNotFoundException":
               raise HTTPException(status_code=404, detail="User not found.")
           if error_code == "InvalidParamaterException":
               raise HTTPException(status_code=422, detail="Invalid username")
           raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def add_user_to_group(username:str, group: str="Users"):
        try:
            await asyncio.to_thread(
                client.admin_add_user_to_group,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
                GroupName=group
            )

            return {"success": True}
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "UserNotFoundException":
                raise HTTPException(status_code=404, detail="User not found.")
            if error_code == "ResourceNotFoundException":
                raise HTTPException(status_code=400, detail="The specified group was not found.")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def remove_user_from_group(username: str, group: str ="Users"):
        try:
            await asyncio.to_thread(
                client.admin_remove_user_from_group,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
                GroupName=group
            )

            return {"success": True}
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")           
            raise HTTPException(status_code=400, detail=error_code)
    
    @staticmethod
    async def disable_user(username: str):
        try:
            await asyncio.to_thread(
                client.admin_disable_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username
            )

            return {"success": True}
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)
    
    @staticmethod
    async def enable_user(username: str):
        try:
            await asyncio.to_thread(
                client.admin_enable_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username
            )

            return {"success": True}
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)
    
    @staticmethod
    async def set_password(username: str, password: str):
        try:
            await asyncio.to_thread(
                client.admin_set_user_password,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
                Password=password,
                Permanent=True
            )

            return {"success": True}
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "UserNotFoundException":
                raise HTTPException(status_code=403, detail="User not found.")
            if error_code == "InvalidPasswordException":
                raise HTTPException(status_code=400, detail="Password does not meet format")          
            raise HTTPException(status_code=400, detail=error_code)
    
    #todo update user attr

    @staticmethod
    async def user_global_sign_out(username: str):
        try:
            await asyncio.to_thread(
                client.admin_user_global_sign_out,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username
            )

            return {"success": True}
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)
    
    @staticmethod
    async def delete_user(username: str):
        try:
            await asyncio.to_thread(
                client.admin_delete_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username
            )

            return {"success": True}
        except ClientError as e:
           error = e.response.get("Error", {})
           error_code = error.get("Code", "ClientError")
           if error_code == "UserNotFoundException":
               raise HTTPException(status_code=404, detail="Uer not found.")

    @staticmethod
    async def create_user(username: str, email: str, temp_pass: str="TemPass@123"):
        try:
            response = await asyncio.to_thread(
                client.admin_create_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
                UserAttributes=[
                    {"Name": "email", "Value": email},
                    {"Name": "email_verified", "Value": "true"}
                ],
                TemporaryPassword=temp_pass,
                MessageAction="SUPPRESS"
            )

            return response
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "UserNameExistException":
                raise HTTPException(status_code=400, detail="Username or email already exist.")
            if error_code == "InvalidPasswordException":
                raise HTTPException(status_code=400, detail="Password does not meet format")
            if error_code == "InvalidParamaterException":
                raise HTTPException(status_code=422, detail="Invalid username")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod   
    async def create_group(group_name: str, precedence: int, description: str):
        try:
            response = await asyncio.to_thread(
                client.create_group,
                GroupName=group_name,
                UserPoolId=settings.cognito_user_pool_id,
                Description=description,
                Precedence=precedence
            )
            
            return response
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "GroupExistException":
               raise HTTPException(status_code=400, detail="Group name already exist.")
            raise HTTPException(status_code=400, detail=error_code)
        # {

    @staticmethod
    async def update_group_attr(group_name: str, precedence: int, description: str):
        try:
            await asyncio.to_thread(
                client.update_group,
                GroupName=group_name,
                UserPoolId=settings.cognito_user_pool_id,
                Description=description,
                Precedence=precedence
            )

        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def delete_group(group_name: str):
        try:
            await asyncio.to_thread(
                client.delete_group,
                GroupName=group_name,
                UserPoolId=settings.cognito_user_pool_id
            )

            return {"success": True}
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)
