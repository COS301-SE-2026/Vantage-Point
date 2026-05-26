RIOT API CALL DOCUMENTATION EXAMPLE

API URLs Example:
	Mostly contain the data about which URL used when you Postman to get data back 
	Riot API. Will only show output on payload that is not too big.

	Each of these requires a X-Riot-Token with the API Key as its value.
Example: 
 

Player ID(Needs to be retrieved first, used different API to obtain this)
	Basis: /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
	Example: https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/Sn1per1/NA2	
Output: 
{
    "puuid": "_1Zwg23PL6uCtrHwZ5r-hiswulAY8XqK0T0ni2KrmrgAg5Cbct1loAMQ4QEzkVfTeLy5O4nKeqJ-Aw",
    "gameName": "Sn1per1",
    "tagLine": "NA2"
}



Get Matches Played based on Player ID
Basis: /lol/match/v5/matches/{matchId}
Example: https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/_1Zwg23PL6uCtrHwZ5r-hiswulAY8XqK0T0ni2KrmrgAg5Cbct1loAMQ4QEzkVfTeLy5O4nKeqJ-Aw/ids?start=0&count=5
Output: 
[
    "NA1_5549204828",
    "NA1_5549193077",
    "NA1_5545315584",
    "NA1_5545295750",
    "NA1_5545261585"
]

Get Match Details at the end of match
Basis: /lol/match/v5/matches/{matchId}
Example: https://americas.api.riotgames.com/lol/match/v5/matches/NA1_5549204828?api_key=xxxxx...
Output too big to paste here.




Get match details based on Timeline
Basis: /lol/match/v5/matches/{matchId}/timeline
Example:https://americas.api.riotgames.com/lol/match/v5/matches/NA1_5549204828/timeline
Output too big to paste here
