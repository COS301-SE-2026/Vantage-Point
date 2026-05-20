from pydantic import BaseModel, Field
from typing import Any, Optional

ERROR_REASONS: dict[int, str] = {
    400: "Bad request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Data not found",
    405: "Method not allowed",
    415: "Unsupported media type",
    429: "Rate limit exceeded",
    500: "Internal server error",
    502: "Bad gateway",
    503: "Service unavailable",
    504: "Gateway timeout",
}


def get_error_reason(status_code: int) -> str:
    return ERROR_REASONS.get(status_code, "Unexpected error")


class APIResponse(BaseModel):
    status: str = "success"
    message: Optional[str] = None
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    status: str = Field(default="error", description="Error response status")
    error_number: int = Field(..., description="HTTP status code for the error")
    reason: str = Field(..., description="Standard reason for the error number")
    detail: Any = Field(..., description="Specific error details")
