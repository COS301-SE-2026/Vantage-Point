import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship

# @NeoMachabaUP :
# Hey so i am moving the model definitions to this file to keep main.py cleaner.
# I also added some comments to explain the purpose of each table and field.
# Let me know if you have any questions or want me to change anything!
# Likely to get more complex as we add more features but this is a good starting point for the basic match/summoner/champion data we need to store.


# Champions
# Stores static champion data. champion_id matches Riot's own ID system so we won't change that.
# we can cross reference api responses directly without a lookup step making it easier to confirm data integrity.
class Champions(SQLModel, table=True):
    champion_id: int = Field(primary_key=True)
    name: str
    tags: str  # e.g. "Marksman", "Mage" — Riot returns this as a string

    participants: List["Participants"] = Relationship(back_populates="champion")

# Users
# Represents a registered Vantage Point account.
# We don't store passwords — Cognito owns that.
# cognito_sub is the 'sub' claim from the Cognito JWT token,
# it's the stable unique identifier for a user.
class Users(SQLModel, table=True):
    cognito_sub: str = Field(primary_key=True)
    email: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    linked_game_accounts: List["UserGameAccounts"] = Relationship(back_populates="user")


# UserGameAccounts
# Join table: tracks which game accounts a user has linked to their account.
# A user can track many game accounts, and a game account can be tracked by many users.
class UserGameAccounts(SQLModel, table=True):
    __tablename__ = "user_game_accounts"

    id: Optional[int] = Field(default=None, primary_key=True)
    cognito_sub: str = Field(foreign_key="users.cognito_sub")
    puuid: str = Field(foreign_key="game_accounts.puuid")

    user: "Users" = Relationship(back_populates="linked_game_accounts")
    game_account: "GameAccounts" = Relationship(back_populates="linked_users")


# GameAccounts
# THIS IS A PLAYER ACCOUNT.
# PUUID is Riot's global unique identifier for a player SO DO NOT TOUCH IT
# I REPEAT DO NOT MESS WITH PUUID.
# this stays the same acorss regions and name changes which is why we use it as the primary key. We can always look up the current name and tag using the PUUID.
class GameAccounts(SQLModel, table=True):
    __tablename__ = "game_accounts"

    puuid: str = Field(primary_key=True)
    game: str          # identifies which game this account belongs to e.g. "league_of_legends", "dota2"
    game_name: str
    tag_line: str  # the part after '#' in Riot ID, e.g. "EUW" in "Player#EUW"
    gameAccounts_level: int

    linked_users: List["UserGameAccounts"] = Relationship(back_populates="game_account")
    participations: List["Participants"] = Relationship(back_populates="game_account")


# Matches
# 1 row per match
# match_id is Riot's unique identifier for a match, so we use that as the primary key.
# Format is a string of numbers and letters, e.g. "EUW1_1234567890"
# queue_id is Riot's identifier for the game mode (e.g. 420 for ranked solo/duo ; 450 = ARAM )
# game duration is important for normalizing stats like KDA and CS/min,
# and for filtering matches by length if we want to exclude very short or very long games in our analysis.
class Matches(SQLModel, table=True):
    match_id: str = Field(primary_key=True)
    game_version: str  # Patch the game was played on, e.g. "13.12" - this is important for tracking balance changes and how they affect champion performance over time.
    game_duration: int  # in seconds;
    queue_id: int

    participants: List["Participants"] = Relationship(back_populates="match")


# Participants
# This is the "join table" that connects Summoners, Matches, and Champions.
# Each row represents one player's participation in one match, including which champion they played and their performance stats.
# internal_id is a like a auto incremanting "fake" PK as we will be using the forgeign keys (match_id, puuid, champion_id) as the main identifier
class Participants(SQLModel, table=True):
    internal_id: Optional[int] = Field(default=None, primary_key=True)

    match_id: str = Field(foreign_key="matches.match_id")
    puuid: str = Field(foreign_key="game_accounts.puuid")
    champion_id: int = Field(foreign_key="champions.champion_id")

    win: bool
    kills: int
    deaths: int
    assists: int
    individual_position: str  # Riot's assigned lane: "TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY" ; will use this later to determine role for champion mastery and other stats

    # Below are back-references so we can navigate from a participant to its match/player/champion
    match: "Matches" = Relationship(back_populates="participants")
    game_account: "GameAccounts" = Relationship(back_populates="participations")
    champion: "Champions" = Relationship(back_populates="participants")
