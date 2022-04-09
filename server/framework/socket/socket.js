const {Router}=require('express');
const { Cookie } = require('express-session');
const { isUser,isGuest } = require('../middleware/guard');
const { register } = require('../services/user');
const {login}=require('../services/user');
const mapErrors = require('../util/mappers');
const jwt=require('jsonwebtoken');
const Game = require('../models/Games');
let io;

exports.socketConnection = (server) => {
    io=require('socket.io')(server,{
        cors:{
            origin:"http://localhost:3000",
            methods:["GET","POST"],
            allowedHeaders:["my-custom-header"],
            credentials:true
        }})
    io.on('connection', socket => {
        console.log('new connection'); 
		socket.on('disconnect', () => console.log('disconnected')); 
        socket.on("gameLobbyJoin",async (game)=>{
            const lobby=await Game.findById(game);
            io.to(String(game)).emit("gameLobby",lobby);
            socket.join(String(game));
       })
       socket.on("gameLobby",async(game)=>{
           console.log(game)
        io.to(String(game)).emit("gameLobby",game);
       })
       socket.on("gameLobbyLeft",async(game)=>{
           socket.leave(String(game));
           const lobby=await Game.findById(game);
           io.to(String(game)).emit("gameLobby",lobby);
       })
       socket.on("gameCreated",async(game)=>{
        socket.join(String(game));
        io.emit("homeGames");
       })
       socket.on("gameStarted",async(game)=>{
           io.to(String(game)).emit("gameStarted");
       })
	})
}

exports.sendMessage=(room,key,message)=>io.to(room).emit(key,message);