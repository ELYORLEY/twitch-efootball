import tmi from "tmi.js";
import fetch from "node-fetch";

const BACKEND = "https://twitch-efootball.onrender.com";

const client = new tmi.Client({
  identity: {
    username: "TU_BOT",
    password: "oauth:TU_TOKEN"
  },
  channels: ["TU_CANAL"]
});

client.connect();

client.on("message", async (channel, tags, message, self) => {
  if (self) return;

  const user = tags.username;
  const msg = message.toLowerCase();

  if (msg === "!compro") {
    const res = await fetch(`${BACKEND}/buy`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ user })
    });

    const data = await res.json();

    if (data.error) client.say(channel, data.error);
    else client.say(channel, `${user} fichó a ${data.player}`);
  }

  if (msg === "!team") {
    const res = await fetch(`${BACKEND}/team-text/${user}`);
    const data = await res.json();

    if (data.error) client.say(channel, data.error);
    else client.say(channel, data.text);
  }

  if (msg.startsWith("!partido")) {
    const rival = msg.split(" ")[1];

    const res = await fetch(`${BACKEND}/match`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ userA: user, userB: rival })
    });

    const data = await res.json();

    if (data.error) {
      client.say(channel, data.error);
    } else {
      let text = `⚽ ${user} ${data.goalsA} - ${data.goalsB} ${rival}`;
      if (data.winner) text += ` | 🏆 Gana ${data.winner}`;
      client.say(channel, text);
    }
  }

  if (msg === "!liga") {
    const res = await fetch(`${BACKEND}/league`);
    const data = await res.json();

    let text = "🏆 TOP 10: ";
    data.forEach((p, i) => {
      text += `${i+1}.${p[0]}(${p[1].wins}) `;
    });

    client.say(channel, text);
  }

  if (msg === "!winner") {
    const res = await fetch(`${BACKEND}/add-win`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ user })
    });

    const data = await res.json();

    client.say(channel, `👑 ${user} suma win (${data.wins})`);
  }
});
