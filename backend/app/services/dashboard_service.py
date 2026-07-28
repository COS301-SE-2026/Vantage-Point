from app.config import get_settings
from app.database.models import Users

class DashBoardService:
    """
    This is the class where you will get all dashboard related data. Service to extract the required data.
    """
    #might be paired with get user of admin, but I'll hvae to wait and see if that will hold truth
    @staticmethod
    async def get_user_status()-> None: