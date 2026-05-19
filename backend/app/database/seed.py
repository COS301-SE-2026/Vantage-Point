import asyncio
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

from app.database.models import (
    Champions,
    Users,
    GameAccounts,
    UserGameAccounts,
    Matches,
    Participants,
)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL, echo=False)

# Champion IDs sourced from Riot Data Dragon (patch 12.1).
# Names and classes cross-referenced with Champion_Stats_12_1 dataset.
# Format: (champion_id, name, tags)
CHAMPIONS = [
    (266, "Aatrox", "Fighter"),
    (103, "Ahri", "Mage"),
    (84, "Akali", "Assassin"),
    (166, "Akshan", "Marksman"),
    (12, "Alistar", "Tank"),
    (32, "Amumu", "Tank"),
    (34, "Anivia", "Mage"),
    (1, "Annie", "Mage"),
    (523, "Aphelios", "Marksman"),
    (22, "Ashe", "Marksman"),
    (136, "Aurelion Sol", "Mage"),
    (268, "Azir", "Mage"),
    (432, "Bard", "Support"),
    (53, "Blitzcrank", "Tank"),
    (63, "Brand", "Mage"),
    (201, "Braum", "Support"),
    (51, "Caitlyn", "Marksman"),
    (164, "Camille", "Fighter"),
    (69, "Cassiopeia", "Mage"),
    (31, "Cho'Gath", "Tank"),
    (42, "Corki", "Marksman"),
    (122, "Darius", "Fighter"),
    (131, "Diana", "Fighter"),
    (36, "Dr. Mundo", "Fighter"),
    (119, "Draven", "Marksman"),
    (245, "Ekko", "Assassin"),
    (60, "Elise", "Mage"),
    (28, "Evelynn", "Assassin"),
    (81, "Ezreal", "Marksman"),
    (9, "Fiddlesticks", "Mage"),
    (114, "Fiora", "Fighter"),
    (105, "Fizz", "Assassin"),
    (3, "Galio", "Tank"),
    (41, "Gangplank", "Fighter"),
    (86, "Garen", "Fighter"),
    (150, "Gnar", "Fighter"),
    (79, "Gragas", "Fighter"),
    (104, "Graves", "Marksman"),
    (887, "Gwen", "Fighter"),
    (120, "Hecarim", "Fighter"),
    (74, "Heimerdinger", "Mage"),
    (420, "Illaoi", "Fighter"),
    (39, "Irelia", "Fighter"),
    (427, "Ivern", "Support"),
    (40, "Janna", "Support"),
    (59, "Jarvan IV", "Tank"),
    (24, "Jax", "Fighter"),
    (126, "Jayce", "Fighter"),
    (202, "Jhin", "Marksman"),
    (222, "Jinx", "Marksman"),
    (145, "Kai'Sa", "Marksman"),
    (429, "Kalista", "Marksman"),
    (43, "Karma", "Mage"),
    (30, "Karthus", "Mage"),
    (38, "Kassadin", "Assassin"),
    (55, "Katarina", "Assassin"),
    (10, "Kayle", "Fighter"),
    (141, "Kayn", "Fighter"),
    (85, "Kennen", "Mage"),
    (121, "Kha'Zix", "Assassin"),
    (203, "Kindred", "Marksman"),
    (240, "Kled", "Fighter"),
    (96, "Kog'Maw", "Marksman"),
    (7, "LeBlanc", "Assassin"),
    (64, "Lee Sin", "Fighter"),
    (89, "Leona", "Tank"),
    (876, "Lillia", "Fighter"),
    (127, "Lissandra", "Mage"),
    (236, "Lucian", "Marksman"),
    (117, "Lulu", "Support"),
    (99, "Lux", "Mage"),
    (54, "Malphite", "Tank"),
    (90, "Malzahar", "Mage"),
    (57, "Maokai", "Tank"),
    (11, "Master Yi", "Assassin"),
    (21, "Miss Fortune", "Marksman"),
    (82, "Mordekaiser", "Fighter"),
    (25, "Morgana", "Mage"),
    (267, "Nami", "Support"),
    (75, "Nasus", "Fighter"),
    (111, "Nautilus", "Tank"),
    (518, "Neeko", "Mage"),
    (76, "Nidalee", "Assassin"),
    (56, "Nocturne", "Assassin"),
    (20, "Nunu", "Tank"),
    (2, "Olaf", "Fighter"),
    (61, "Orianna", "Mage"),
    (516, "Ornn", "Tank"),
    (80, "Pantheon", "Fighter"),
    (78, "Poppy", "Tank"),
    (555, "Pyke", "Support"),
    (246, "Qiyana", "Assassin"),
    (133, "Quinn", "Marksman"),
    (497, "Rakan", "Support"),
    (33, "Rammus", "Tank"),
    (421, "Rek'Sai", "Fighter"),
    (526, "Rell", "Tank"),
    (58, "Renekton", "Fighter"),
    (107, "Rengar", "Assassin"),
    (92, "Riven", "Fighter"),
    (68, "Rumble", "Fighter"),
    (13, "Ryze", "Mage"),
    (360, "Samira", "Marksman"),
    (113, "Sejuani", "Tank"),
    (235, "Senna", "Marksman"),
    (147, "Seraphine", "Mage"),
    (875, "Sett", "Fighter"),
    (35, "Shaco", "Assassin"),
    (98, "Shen", "Tank"),
    (102, "Shyvana", "Fighter"),
    (27, "Singed", "Tank"),
    (14, "Sion", "Tank"),
    (15, "Sivir", "Marksman"),
    (72, "Skarner", "Fighter"),
    (37, "Sona", "Support"),
    (16, "Soraka", "Support"),
    (50, "Swain", "Mage"),
    (517, "Sylas", "Mage"),
    (134, "Syndra", "Mage"),
    (223, "Tahm Kench", "Support"),
    (163, "Taliyah", "Mage"),
    (91, "Talon", "Assassin"),
    (44, "Taric", "Support"),
    (17, "Teemo", "Marksman"),
    (412, "Thresh", "Support"),
    (18, "Tristana", "Marksman"),
    (48, "Trundle", "Fighter"),
    (23, "Tryndamere", "Fighter"),
    (4, "Twisted Fate", "Mage"),
    (29, "Twitch", "Marksman"),
    (77, "Udyr", "Fighter"),
    (6, "Urgot", "Fighter"),
    (110, "Varus", "Marksman"),
    (67, "Vayne", "Marksman"),
    (45, "Veigar", "Mage"),
    (161, "Vel'Koz", "Mage"),
    (711, "Vex", "Mage"),
    (254, "Vi", "Fighter"),
    (234, "Viego", "Assassin"),
    (112, "Viktor", "Mage"),
    (8, "Vladimir", "Mage"),
    (106, "Volibear", "Fighter"),
    (19, "Warwick", "Fighter"),
    (62, "Wukong", "Fighter"),
    (498, "Xayah", "Marksman"),
    (101, "Xerath", "Mage"),
    (5, "Xin Zhao", "Fighter"),
    (157, "Yasuo", "Fighter"),
    (777, "Yone", "Assassin"),
    (83, "Yorick", "Fighter"),
    (350, "Yuumi", "Support"),
    (154, "Zac", "Tank"),
    (238, "Zed", "Assassin"),
    (115, "Ziggs", "Mage"),
    (26, "Zilean", "Support"),
    (142, "Zoe", "Mage"),
    (143, "Zyra", "Mage"),
]


async def seed():
    print("--- Seeding database ---")

    async with engine.begin() as conn:
        print("Dropping and recreating tables...")
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)

    async with AsyncSession(engine) as session:

        # --- Champions ---
        print(f"Inserting {len(CHAMPIONS)} champions...")
        session.add_all(
            [
                Champions(champion_id=cid, name=name, tags=tags)
                for cid, name, tags in CHAMPIONS
            ]
        )

        # --- Users ---
        # cognito_sub format mirrors what AWS Cognito actually returns (UUID v4)
        users = [
            Users(
                cognito_sub="fake-cognito-sub-0001",
                email="testuser1@vantagepoint.dev",
                # created_at=datetime.now(timezone.utc)
                created_at=datetime.utcnow(),  # returns naive UTC datetime
            ),
            Users(
                cognito_sub="fake-cognito-sub-0002",
                email="testuser2@vantagepoint.dev",
                # created_at=datetime.now(timezone.utc)
                created_at=datetime.utcnow(),  # returns naive UTC datetime
            ),
        ]
        session.add_all(users)

        # --- Game Accounts ---
        # PUUIDs are fake but consistent across the seed so FK constraints hold
        game_accounts = [
            GameAccounts(
                puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000001",
                game="league_of_legends",
                game_name="TheFast",
                tag_line="4444",
                account_level=100,
            ),
            GameAccounts(
                puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000002",
                game="league_of_legends",
                game_name="SilverBot",
                tag_line="EUW",
                account_level=42,
            ),
        ]
        session.add_all(game_accounts)

        # --- User <-> Game Account links ---
        # User 1 tracks both accounts — exercises the many-to-many relationship
        session.add_all(
            [
                UserGameAccounts(
                    cognito_sub="fake-cognito-sub-0001",
                    puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000001",
                ),
                UserGameAccounts(
                    cognito_sub="fake-cognito-sub-0002",
                    puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000002",
                ),
                UserGameAccounts(
                    cognito_sub="fake-cognito-sub-0001",
                    puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000002",
                ),
            ]
        )

        # --- Matches ---
        matches = [
            Matches(
                match_id="EUW1_FAKE001",
                game_version="12.1.123",
                game_duration=1820,  # ~30 min
                queue_id=420,  # Ranked Solo/Duo
            ),
            Matches(
                match_id="EUW1_FAKE002",
                game_version="12.1.123",
                game_duration=2100,  # ~35 min
                queue_id=450,  # ARAM
            ),
        ]
        session.add_all(matches)

        # --- Participants ---
        session.add_all(
            [
                Participants(
                    match_id="EUW1_FAKE001",
                    puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000001",
                    champion_id=202,  # Jhin
                    win=True,
                    kills=12,
                    deaths=2,
                    assists=5,
                    individual_position="BOTTOM",
                ),
                Participants(
                    match_id="EUW1_FAKE001",
                    puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000002",
                    champion_id=84,  # Akali
                    win=False,
                    kills=4,
                    deaths=7,
                    assists=3,
                    individual_position="MIDDLE",
                ),
                Participants(
                    match_id="EUW1_FAKE002",
                    puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000001",
                    champion_id=157,  # Yasuo
                    win=False,
                    kills=6,
                    deaths=9,
                    assists=4,
                    individual_position="MIDDLE",
                ),
            ]
        )

        await session.commit()

    print("--- Seed complete ---")
    print(f"  Champions:      {len(CHAMPIONS)}")
    print("  Users:          2")
    print("  Game accounts:  2")
    print("  User-GA links:  3")
    print("  Matches:        2")
    print("  Participants:   3")


if __name__ == "__main__":
    asyncio.run(seed())
