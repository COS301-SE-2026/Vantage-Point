import boto3
from botocore.exceptions import ClientError
from app.config import get_settings
from fastapi import HTTPException

settings = get_settings()

client = boto3.client("cognito-idp", region_name=settings.aws_region) #type: ignore

#admin abilities/services

class admin_service:
    async def get_users(self, limit: int = 10):
       try: 
            response = client.list_users(
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

    async def get_user(self, username: str):
        try:
            response = client.admin_get_user(
                UserPoolId=settings.cognito_user_pool_id,
                Username=username
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


    async def add_user_to_group(self, username:str, group: str="Users"):
        try:
            response = client.admin_add_user_to_group(
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
                GroupName=group
            )

            return response
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "GroupExistsException":
                raise HTTPException(status_code=400, detail="Group name already exists.")
            raise HTTPException(status_code=400, detail=error_code)

    
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
        try:
            response = client.admin_set_user_password(
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
                Password=password,
                Permanent=True
            )

            return response
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "UserNotFoundException":
                raise HTTPException(status_code=403, detail="User not found.")
            if error_code == "InvalidPasswordException":
                raise HTTPException(status_code=400, detail="Password does not meet format")          
            raise HTTPException(status_code=400, detail=error_code)
    
    #todo update user attr

    async def user_global_sign_out(self, username: str):
        response = client.admin_user_global_sign_out(
            UserPoolId=settings.cognito_user_pool_id,
            Username=username
        )

        return response
    
    async def delete_user(self, username: str):
        try:
            response = client.admin_delete_user(
                UserPoolId=settings.cognito_user_pool_id,
                Username=username
            )

            return response
        except ClientError as e:
           error = e.response.get("Error", {})
           error_code = error.get("Code", "ClientError")
           if error_code == "UserNotFoundException":
               raise HTTPException(status_code=404, detail="Uer not found.")

    async def create_user(self, username: str, email: str, temp_pass: str="TemPass@123"):
        try:
            response = client.admin_create_user(
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
            

#     {
#   "User": {
#     "Username": "john_doe",
#     "UserStatus": "FORCE_CHANGE_PASSWORD"
#   }
# }

    async def create_group(self, group_name: str, precedence: int, description: str):
        client.create_group(
            GroupName=group_name,
            UserPoolId=settings.cognito_user_pool_id,
            Description=description,
            Precedence=precedence
        )
        # {
#   "Group": {
#     "GroupName": "Admin"
#   }
# }

    async def update_group_attr(self, group_name: str, precedence: int, description: str):
        client.update_group(
            GroupName=group_name,
            UserPoolId=settings.cognito_user_pool_id,
            Description=description,
            Precedence=precedence
        )

    async def delete_group(self, group_name: str):
        client.delete_group(
            GroupName=group_name,
            UserPoolId=settings.cognito_user_pool_id
        )
