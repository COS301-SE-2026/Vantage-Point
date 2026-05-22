def parse_riot_id(riot_id: str) -> tuple[str, str]:
    """Split a Riot ID into game name and tag line (split on last #)."""
    trimmed = riot_id.strip()
    if "#" not in trimmed:
        raise ValueError("Riot ID must include a tag, e.g. Player#EUW")
    idx = trimmed.rindex("#")
    game_name = trimmed[:idx].strip()
    tag_line = trimmed[idx + 1 :].strip().lstrip("#")
    if not game_name or not tag_line:
        raise ValueError("Riot ID must include both name and tag")
    return game_name, tag_line
