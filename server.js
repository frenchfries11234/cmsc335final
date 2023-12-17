const express = require("express");
const fetch = require('node-fetch');

const { MongoClient, ServerApiVersion } = require("mongodb");
const PORT = process.env.PORT || 3000;
const app = express();

const path = require("path");
const { range } = require("express/lib/request");
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

process.stdin.setEncoding("utf8");

require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') });

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const db = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;

const uri = `mongodb+srv://${userName}:${password}@cluster0.i9yxbl0.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

app.listen(PORT, (err) => {
  if (err) {
    console.log("Starting server failed.");
  } else {
    console.log(
      `Web server started and running at: http://localhost:${PORT}`
    );
  }
});

let score = 0;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", async (request, response) => {
  response.render("index", { score: request.query.score });
});
app.post("/", async (request, response) => {
  
  score = request.body.score;
  response.render("name", { name: request.query.name});
});

let message = "";
// stuff to get leaderboard
// app.get("/name", async (request, response) => {
//   console.log(request.query.name);
//   response.render("name", { name: request.query.name });
// });
app.post("/name", async (request, response) => {
  tableHTML = "";
  try {
    await client.connect();
    await client.db(db).collection(collection).insertOne({ name: request.body.name, score: Number(score) });
    tableHTML = await get_table(client);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
  response.render("leaderboard", { greeting: message, table: tableHTML });
});

//send score
function sendScoreToServer(score) {
  fetch('/submit-score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ score: score })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

//async function
async function get_table(client, id) {
  let players = await client.db(db).collection(collection).find({});
  
  playersArr = await players.toArray();
  let recent = playersArr[playersArr.length - 1];
  topFive = [];

  for (let i = 0; i < 5; i++) {
    topPlayer = null;
    highestScore = 0;
    highestIndex = 0;
    index = 0;
    if (playersArr.length == 0) {
      break;
    }
    playersArr.forEach((player) => {
      if (player.score > highestScore) {
        topPlayer = player
        highestScore = player.score;
        highestIndex = index;
      }

      index++;
    });

    topFive.push(topPlayer);
    playersArr.splice(highestIndex, 1);
  }


  let tableHTML = `<table border="1"><tr><th>Rankings</th><th>Score</th></tr>`;
  for(i = 1; i <= topFive.length; i++){
    tableHTML += `<tr><td>${i}. ${topFive[i-1].name}</td><td>${topFive[i-1].score}</td></tr>`;
  }
  if(topFive[topFive.length-1].score < score){
    message = "Congrats you made it to the top leaderboard!";
  } 
  else if(topFive[topFive.length-1].score == score && topFive[topFive.length - 1].name == recent.name && topFive[topFive.length - 1].score == recent.score){
    message = "You barely made it!";
  } 
  else {
    message = "you stink!";
  }
  // topFive.forEach((player) => {
  //   console.log(player);
  //   tableHTML += `<tr><td>1. ${player.name}</td><td>${player.score}</td></tr>`;
  // })
  tableHTML += `</table>`;
  return tableHTML;
}