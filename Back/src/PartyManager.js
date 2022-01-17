const Party = require("./Party");
const Player = require("./Player");
const Ship = require("./Ship");
const { getRandomString } = require("./additional");

const RECONNECTION_TIMER = 7000;

module.exports = class PartyManager {
  players = [];
  parties = [];

  waitingRandomPlayers = [];
  waitingChallenge = new Map();

  reconnections = new Map();

  connection(socket) {
    // TODO: индентифицировать пользователя
    const sessionId = socket.request.sessionID;
    let player = this.players.find((player) => player.sessionId === sessionId);

    if (player) {
      player.socket.emit("doubleConnection");
      player.socket.disconnect();
      player.socket = socket;

      if (this.reconnections.has(player)) {
        clearTimeout(this.reconnections.get(player));
        this.reconnections.delete(player);

        if (player.party) {
          player.party.reconnection(player);
        }
      }
    } else {
      player = new Player(socket, sessionId);
      this.players.push(player);
    }

    const isFree = () => {
      if (this.waitingRandomPlayers.includes(player)) {
        return false;
      }

      const values = Array.from(this.waitingChallenge.values());

      if (values.includes(player)) {
        return false;
      }

      if (player.party) {
        return false;
      }

      return true;
    };

    socket.on("shipSet", (ships) => {
      if (!isFree()) {
        return;
      }

      player.battlefield.clear();
      for (const { size, direction, x, y } of ships) {
        const ship = new Ship(size, direction);
        player.battlefield.addShip(ship, x, y);
      }
    });

    socket.on("findRandomOpponent", () => {
      if (!isFree()) {
        return;
      }

      this.waitingRandomPlayers.push(player);
      player.emit("statusChange", "randomFinding");

      if (this.waitingRandomPlayers.length >= 2) {
        const [player1, player2] = this.waitingRandomPlayers.splice(0, 2);
        const party = new Party(player1, player2);
        this.parties.push(party);

        const unsubcribe = party.subscribe(() => {
          this.removeParty(party);
          unsubcribe();
        });
      }
    });

    socket.on("challengeOpponent", (key = "") => {
      if (!isFree()) {
        return;
      }

      if (this.waitingChallenge.has(key)) {
        const opponent = this.waitingChallenge.get(key);
        this.waitingChallenge.delete(key);

        const party = new Party(opponent, player);
        this.parties.push(party);
      } else {
        key = getRandomString(20);
        socket.emit("challengeOpponent", key);
        socket.emit("statusChange", "waiting");

        this.waitingChallenge.set(key, player);
      }
    });

    socket.on("gaveup", () => {
      if (player.party) {
        player.party.gaveup(player);
      }

      if (this.waitingRandomPlayers.includes(player)) {
        const index = this.waitingRandomPlayers.indexOf(player);
        this.waitingRandomPlayers.splice(index, 1);
      }

      const values = Array.from(this.waitingChallenge.values());
      if (values.includes(player)) {
        const index = values.indexOf(player);
        const keys = Array.from(this.waitingChallenge.keys());
        const key = keys[index];
        this.waitingChallenge.delete(key);
      }
    });

    socket.on("addShot", (x, y) => {
      if (player.party) {
        player.party.addShot(player, x, y);
      }
    });

    socket.on("message", (message) => {
      if (player.party) {
        player.party.sendMessage(message);
      }
    });
  }

  disconnect(socket) {
    const player = this.players.find((player) => player.socket === socket);

    if (!player) {
      return;
    }

    if (player.party) {
      const flag = setTimeout(() => {
        this.reconnections.delete(player);

        if (player.party) {
          player.party.gaveup(player);
        }

        this.removePlayer(player);
      }, RECONNECTION_TIMER);

      this.reconnections.set(player, flag);
    }

    if (this.waitingRandomPlayers.includes(player)) {
      const index = this.waitingRandomPlayers.indexOf(player);
      this.waitingRandomPlayers.splice(index, 1);
    }

    const values = Array.from(this.waitingChallenge.values());
    if (values.includes(player)) {
      const index = values.indexOf(player);
      const keys = Array.from(this.waitingChallenge.keys());
      const key = keys[index];
      this.waitingChallenge.delete(key);
    }
  }

  addPlayer(player) {
    if (this.players.includes(player)) {
      return false;
    }

    this.players.push(player);

    return true;
  }

  removePlayer(player) {
    if (!this.players.includes(player)) {
      return false;
    }

    const index = this.players.indexOf(player);
    this.players.splice(index, 1);

    if (this.waitingRandomPlayers.includes(player)) {
      const index = this.waitingRandomPlayers.indexOf(player);
      this.waitingRandomPlayers.splice(index, 1);
    }

    return true;
  }

  removeAllPlayers() {
    const players = this.players.slice();

    for (const player of players) {
      this.removePlayer(player);
    }

    return players.length;
  }

  addParty(party) {
    if (this.parties.includes(party)) {
      return false;
    }

    this.parties.push(party);

    return true;
  }

  removeParty(party) {
    if (!this.parties.includes(party)) {
      return false;
    }

    const index = this.parties.indexOf(party);
    this.parties.splice(index, 1);

    return true;
  }

  removeAllparties() {
    const parties = this.parties.slice();

    for (const party of parties) {
      this.removeParty(party);
    }

    return parties.length;
  }

  playRandom(player) {
    if (this.waitingRandomPlayers.includes(player)) {
      return false;
    }

    this.waitingRandomPlayers.push(player);

    if (this.waitingRandomPlayers.length >= 2) {
      const [player1, player2] = this.waitingRandomPlayers.splice(0, 2);
      const party = new Party(player1, player2);
      this.addParty(party);
    }

    return true;
  }
};
