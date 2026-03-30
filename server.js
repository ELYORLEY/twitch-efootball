import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const players = JSON.parse(fs.readFileSync("./players.json"));

let usersTeams = {};
let usersStats = {};
let currentCard = null;

// carta random
function getRandomCard() {
  return players[Math.floor(Math.random() * players.length)];
}

// rotación
function rotateCard() {
  currentCard = getRandomCard();
}

setInterval(rotateCard, 720000);
rotateCard();

// obtener carta
app.get("/card", (req, res) => {
  res.json(currentCard);
});

// comprar
app.post("/buy", (req, res) => {
  const { user } = req.body;

  if (!usersTeams[user]) usersTeams[user] = {};

  let pos = currentCard.position;
  let finalPos = pos;

  if (pos === "CB") {
    if (!usersTeams[user]["CB1"]) finalPos = "CB1";
    else if (!usersTeams[user]["CB2"]) finalPos = "CB2";
    else return res.json({ error: "Defensa completa" });
  }

  if (pos === "CM") {
    if (!usersTeams[user]["CM1"]) finalPos = "CM1";
    else if (!usersTeams[user]["CM2"]) finalPos = "CM2";
    else if (!usersTeams[user]["CM3"]) finalPos = "CM3";
    else return res.json({ error: "Mediocampo lleno" });
  }

  if (usersTeams[user][finalPos]) {
    return res.json({ error: "Posición ocupada" });
  }

  usersTeams[user][finalPos] = {
    player: currentCard.name
  };

  res.json({ success: true, player: currentCard.name });
});

// ver equipo
app.get("/team-text/:user", (req, res) => {
  const team = usersTeams[req.params.user];

  if (!team) return res.json({ error: "No tiene equipo" });

  let text = `${req.params.user} XI: `;

  for (const pos in team) {
    text += `${pos}:${team[pos].player} | `;
  }

  res.json({ text });
});

// simular partido
function simulateMatch(teamA, teamB) {
  const calc = (team) => {
    let score = 0;
    Object.values(team).forEach(() => {
      score += Math.floor(Math.random() * 10);
    });
    return score;
  };

  const A = calc(teamA);
  const B = calc(teamB);

  return {
    goalsA: Math.floor(A / 20),
    goalsB: Math.floor(B / 20)
  };
}

// partido
app.post("/match", (req, res) => {
  const { userA, userB } = req.body;

  const teamA = usersTeams[userA];
  const teamB = usersTeams[userB];

  if (!teamA || !teamB) {
    return res.json({ error: "Ambos necesitan equipo" });
  }

  const result = simulateMatch(teamA, teamB);

  if (!usersStats[userA]) usersStats[userA] = { wins: 0, matches: 0 };
  if (!usersStats[userB]) usersStats[userB] = { wins: 0, matches: 0 };

  usersStats[userA].matches++;
  usersStats[userB].matches++;

  let winner = null;

  if (result.goalsA > result.goalsB) {
    usersStats[userA].wins++;
    winner = userA;
  } else if (result.goalsB > result.goalsA) {
    usersStats[userB].wins++;
    winner = userB;
  }

  res.json({
    goalsA: result.goalsA,
    goalsB: result.goalsB,
    winner
  });
});

// liga top 10
app.get("/league", (req, res) => {
  const ranking = Object.entries(usersStats)
    .sort((a, b) => b[1].wins - a[1].wins)
    .slice(0, 10);

  res.json(ranking);
});

// sumar win manual
app.post("/add-win", (req, res) => {
  const { user } = req.body;

  if (!usersStats[user]) usersStats[user] = { wins: 0, matches: 0 };

  usersStats[user].wins++;

  res.json({ success: true, wins: usersStats[user].wins });
});

app.listen(10000);
