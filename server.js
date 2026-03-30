import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const players = JSON.parse(fs.readFileSync("./players.json"));

let usersTeams = {};
let currentCard = null;

function getRandomCard() {
  return players[Math.floor(Math.random() * players.length)];
}

function rotateCard() {
  currentCard = getRandomCard();
}

setInterval(rotateCard, 15000);
rotateCard();

app.get("/card", (req, res) => {
  res.json(currentCard);
});

app.post("/buy", (req, res) => {
  const { user } = req.body;

  if (!usersTeams[user]) usersTeams[user] = {};

  const pos = currentCard.position;

  if (usersTeams[user][pos]) {
    return res.json({ error: "Posición ocupada" });
  }

  usersTeams[user][pos] = {
    player: currentCard.name
  };

  res.json({ success: true });
});

app.listen(10000);
