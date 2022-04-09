const {Router}=require('express');
const { Cookie } = require('express-session');
const { isUser,isGuest } = require('../middleware/guard');
const { register, getUserById } = require('../services/user');
const {login}=require('../services/user');
const mapErrors = require('../util/mappers');
const jwt=require('jsonwebtoken');
const jwt_decode=require("jwt-decode");
const {createLobby,getAllGames,joinGame, findGameById,leaveGame, changeTeam}=require('../services/game');
const {dealCards}=require("../services/cards")
const { createServer } = require('http');
const router=Router();

router.get("/dealCards/:id",async()=>{
    console.log('hi')
    dealCards();
});




module.exports=router;