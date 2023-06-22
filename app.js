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
   response.send(players)
})

//GET Player
app.get("/players/:playerId", async(request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  SELECT * FROM player_details
  WHERE player_id = ${playerId}`
  const player = await db.get(getPlayerQuery)
  response.send(player)
})

//PUT Player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const {
    playerName
  } = playerDetails;
  const updateBookQuery = `
    UPDATE
      player_details
    SET
     player_name=${playerName}
    WHERE
      player_id = ${playerId};`;
  await db.run(updateBookQuery);
  response.send("Book Updated Successfully");
});
module.exports = app