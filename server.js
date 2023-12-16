if (process.argv.length != 3) {
  console.log("Usage server.js port");
  process.exit(1);
}

const express = require("express");
const fetch = require('node-fetch');

const { MongoClient, ServerApiVersion } = require("mongodb");
const portNumber = Number(process.argv[2]);
const app = express();

const path = require("path");
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

process.stdin.setEncoding("utf8");

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const db = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;

const uri = `mongodb+srv://${userName}:${password}@cluster0.wcdf8vh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

app.listen(portNumber, (err) => {
  if (err) {
    console.log("Starting server failed.");
  } else {
    console.log(
      `Web server started and running at: http://localhost:${portNumber}`
    );
    process.stdout.write("Type stop to shutdown the server: ");
  }
});

function input() {
  let dataInput = process.stdin.read();
  if (dataInput !== null) {
    let command = dataInput.trim();
    if (command === "stop") {
      console.log("Shutting down the server");
      process.exit(0);
    } else {
      console.log(`Invalid command: ${command}`);
      process.stdout.write("Type stop to shutdown the server: ");
      input();
    }
  }
}

process.stdin.on("readable", () => {
  input();
});

app.get("/", async (request, response) => {
  response.render("index");
});
