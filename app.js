const express = require("express")
const path = require("path")
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())


const dbPath = path.join(__dirname, "cricketMatchDetails.db")
let db = null
const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000,() => {
      console.log("Server is Running at http://localhost:3000")
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}
initializeDb()

///GET Players
app.get("/players/", async (request,response) => {
   const getPlayersQuery = `
   SELECT * FROM player_details`
   const players = await db.all(getPlayersQuery)
   response.send(players.map((eachPlayer) => convertPlayerDBObject(eachPlayer)))
})

//GET Player
app.get("/players/:playerId", async(request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  SELECT * FROM player_details
  WHERE player_id = ${playerId}`
  const player = await db.get(getPlayerQuery)
  response.send(convertPlayerDBObject(player))
})

//PUT Player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;

  const updatePlayerNameQuery = `
    UPDATE player_details
        SET player_name='${playerName}'
    WHERE player_id=${playerId}`;
  const updatePlayerNameResponse = await db.run(updatePlayerNameQuery);
  response.send("Player Details Updated");
});
const convertPlayerDBObject = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
  };
};

const convertMatchDetailsObject = (obj) => {
  return {
    matchId: obj.match_id,
    match: obj.match,
    year: obj.year,
  };
};

//GET Matches
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = ` 
    SELECT * 
        FROM match_details
    WHERE match_id=${matchId}`;
  const getMatchDetailsResponse = await db.get(getMatchDetailsQuery);
  response.send(convertMatchDetailsObject(getMatchDetailsResponse));
});
//GET PLAYER_MATCH 
app.get("/players/:playerId/matches", async(request, response) => {
  const {playerId} = request.params
  const PlayerMatchQuery = `
  SELECT * FROM player_match_score NATURAL JOIN match_details WHERE player_id=${playerId}`
  const player = await db.all(PlayerMatchQuery)
  response.send(player.map((eachPlayer) => convertMatchDetailsObject(eachPlayer)))
})

///GET LIST OF PLAYERS OF SPECIFIC MATCHID
app.get("/matches/:matchId/players", async(request, response) => {
  const {matchId} = request.params
  const MatchQuery =` 
  SELECT player_details.player_id AS playerId,
  player_details.player_name AS playerName
  FROM player_match_score NATURAL JOIN player_details
  WHERE match_id = ${matchId}`
  const details = await db.all(MatchQuery)
  response.send(details)
})

//GET players scores
 app.get("/players/:playerId/playerScores", async(request, response) => {
    const {playerId} = request.params
   const getPlayerScored = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};`;
    const result = await db.get(getPlayerScored)
    response.send(result)
 })
module.exports = app