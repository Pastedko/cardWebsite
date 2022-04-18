const {Router}=require('express');
const { Cookie } = require('express-session');
const { isUser,isGuest } = require('../middleware/guard');
const { register, getUserById } = require('../services/user');
const {login}=require('../services/user');
const mapErrors = require('../util/mappers');
const jwt=require('jsonwebtoken');
const jwt_decode=require("jwt-decode");
const {createLobby,getAllGames,joinGame, findGameById,leaveGame, changeTeam}=require('../services/game');
const {dealCards,allowedCards,findCard}=require("../services/cards")
const { createServer } = require('http');
const Game=require('../models/Games')
const router=Router();

router.get("/dealCards/:id",async()=>{
    console.log('hi')
    dealCards();
});

router.post("/allowed",async(req,res)=>{
    
    console.log(req.body);
    let hand=req.body.hand;
    let game=req.body.game;
    let card=req.body.card
    let myGame = await Game.findById(game._id);
    if(myGame.playedCards.length!=0){
    let allowed=await allowedCards(hand,game);
    let result=findCard(card,allowed)
    res.send(result);
    }
    else
    res.send(true);
})




module.exports=router;