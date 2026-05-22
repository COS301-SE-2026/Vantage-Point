QUEUE_LABELS: dict[int, str] = {
    420: "Ranked Solo/Duo",
    450: "ARAM",
    400: "Normal Draft",
    430: "Normal Blind",
}

MAP_LABELS: dict[int, str] = {
    11: "Summoner's Rift",
    12: "Howling Abyss",
}


def queue_label(queue_id: int) -> str:
    return QUEUE_LABELS.get(queue_id, f"Queue {queue_id}")


def map_label(map_id: int) -> str:
    return MAP_LABELS.get(map_id, f"Map {map_id}")
