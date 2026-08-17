import json
from typing import Any

from loguru import logger

def log_activity(event_type: str, message: str, **details: Any) -> None:
    event: dict[str, Any] = {
        "event_type": event_type,
        "message": message,
        **details
    }
    logger.info(json.dumps(event))