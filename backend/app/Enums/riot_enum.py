from enum import Enum

#this is all in the attempt to make the application more flexible when it comes to regions and players in different areas.
#
class RiotRegion(str, Enum):
    americas = "americas"
    europe = "europe"
    asia = "asia"
    sea = "sea"


RegionPlatforms = {
    "americas": ["na1", "br1", "la1", "la2"],
    "europe": ["euw1", "eun1", "tr1", "ru"],
    "asia": ["kr", "jp1"],
    "sea": ["oc1", "ph2", "sg2", "th2", "tw2", "vn2"]
}