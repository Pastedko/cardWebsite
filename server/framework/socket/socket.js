
const { dealCards, playCard, changeTurn, gameStart, makeCall, gameEnd } = require('../services/cards')
const jwt = require('jsonwebtoken');
const Game = require('../models/Games');
let io;

exports.socketConnection = (server) => {
    io = require('socket.io')(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: true
        }
    })
    io.on('connection', socket => {
        console.log('new connection');
        socket.on('disconnect', () => console.log('disconnected'));
        socket.on("gameLobbyJoin", async (game) => {
            console.log("gameLobbyJoin")
            const lobby = await Game.findById(game);
            io.to(String(game)).emit("gameLobby", lobby);
            socket.join(String(game));
        })
        socket.on("gameLobby", async (game) => {
            console.log("gameLobby")
            io.to(String(game)).emit("gameLobby", game);
        })
        socket.on("gameLobbyLeft", async (game) => {
            socket.leave(String(game));
            const lobby = await Game.findById(game);
            io.to(String(game)).emit("gameLobby", lobby);
        })
        socket.on("gameCreated", async (game) => {
            console.log("gameCreated")
            socket.join(String(game));
            io.emit("homeGames");
        })

        socket.on("gameStarted", async (game) => {
            io.to(String(game._id)).emit("gameStarted");
            let deck = dealCards()
            console.log(deck)
            gameStart(game)
            setTimeout(() => { io.to(String(game._id)).emit("dealCards", deck) }, 2000);
        })

        //actual Game

        //socket.on("dealCards",async())
        socket.on("cardPlayed", async (input) => {
            let card = input.card;
            let game = input.game;
            let hand = input.hand;
            let result2 = await playCard(card, hand, game);
            io.to(String(game._id)).emit("cardPlayed", card);
            let result = await changeTurn(game)
            if (result) {
                console.log("handEnded")
                setTimeout(() => { io.to(String(game._id)).emit('handEnded'); }, 2000);
               
            }
            if (result2 == "gameEnded") {
                console.log("gameEnded")
                socket.emit("gameEnded")
                gameEnd(game);
            }
        })

        socket.on("callMade", async (input) => {
            console.log("callMade")
            let call = input.call;
            let team = input.team
            console.log(call);
            let game = input.game;
            let result = await makeCall(call, team, game);
            if (result == "gameStart") {
                io.to(String(game._id)).emit("startGame");
            }
            io.to(String(game._id)).emit("callMade", call);
        })

    })
}

exports.sendMessage = (room, key, message) => io.to(room).emit(key, message);