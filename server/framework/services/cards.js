const Game = require('../models/Games');
const { Router } = require('express');
const { Cookie } = require('express-session');
const { isUser, isGuest } = require('../middleware/guard');
const { register, getUserById } = require('../services/user');
const { login } = require('../services/user');
const mapErrors = require('../util/mappers');
const jwt = require('jsonwebtoken');
const jwt_decode = require("jwt-decode");
const { default: mongoose, Types, ObjectId } = require('mongoose');
const socket  = require('../socket/socket');
const { findGameById } = require("../services/game")

let faces = ["7", "8", "9", "10", "J", "Q", "K", "A"];
let facePowers = [1,3, 5, 7, 9, 11, 13, 15];
let points=[0,0,0,10,2,3,4,11];
let suits = ["♠", "♣", "♥", "♦"];
let names = ["spades", "clubs", "hearts", "diams"];
let suitPowers = [1, 1, 1, 1];

class Card {
    face;
    suit;
    player;
    name;
    facePower;
    suitPower;
    points;
    team;
    constructor(face, suit, player, name, facePower, suitPower, points,team) {
        this.face = face;
        this.suit = suit;
        this.player = player;
        this.name = name;
        this.facePower = facePower;
        this.suitPower = suitPower;
        this.points=points;
        this.team=team
    }

}

async function gameStart(game) {
    let myGame = await Game.findById(game._id);
    if(myGame.score[0]==0&&myGame.score[1]==0){

    myGame.players[0].push(true);
    for (let i = 1; i < myGame.players.length; i++) {
        myGame.players[i].push(false);
    }
    myGame.players.sort((a, b) => {
        return a[1] - b[1];
    })
    myGame.startingPlayer=myGame.players[0];
    myGame.lastStarted=0;
}
else{

    switch(myGame.lastStarted){
        case 0:{myGame.startingPlayer = myGame.players[2];break}
        case 1:{myGame.startingPlayer = myGame.players[3];break}
        case 2:{myGame.startingPlayer = myGame.players[1];break}
        case 3:{myGame.startingPlayer = myGame.players[0];break}
    }
    for(let i=0;i<myGame.players.length;i++){
        if(JSON.stringify(myGame.players[i][0])==JSON.stringify(myGame.startingPlayer[0])){
            myGame.players[i][2]=true;
            myGame.lastStarted=i;
        }
        else {
            myGame.players[i][2]=false;
        }
    }
}
    let filter={_id:myGame._id}
    let updates={players:myGame.players,startingPlayer:myGame.startingPlayer,lastStarted:myGame.lastStarted}
    await Game.findByIdAndUpdate(filter,updates);
}
function dealCards() {
    let deck = [];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
            card = new Card(faces[j], suits[i], "", names[i], facePowers[j], suitPowers[i],points[j],0);
            deck.push(card);
        }
    }
    let shuffled = shuffle(deck);
    shuffled = shuffle(shuffled);
    shuffled = shuffle(shuffled);
    shuffled = shuffle(shuffled);
    return shuffled;

}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

async function playCard(card,hand, game) {
    let myGame = await Game.findById(game._id);
    let currentHand=myGame.playedCards;
    myGame.playedCards.push(card);
    // console.log(myGame.playedCards)
    
    myGame.markModified("playedCards")
    await myGame.save()
    if(currentHand.length==4&&hand.length==1){
        console.log("ama alo")
        return "gameEnded"
    }
    return 1
}
function findCard(card,hand){
    let result=false;
    hand.forEach(el=>{

        if(JSON.stringify(el)==JSON.stringify(card)){
            result=true;}
    })
    return result;
}
async function setFirstPlayer(player,game){
    let myGame = await Game.findById(game._id);
    myGame.startingPlayer=player;
    let filter={_id:game._id}
    let update={startingPlayer:player}
    await Game.findOneAndUpdate(filter,update)
  //  myGame.markModified("startingPlayer");
   // myGame.save()
}

async function getPlayerIndex(player,game){
    let myGame = await Game.findById(game._id);
    for(let i=0;i<myGame.players.length;i++){
        if(JSON.stringify(myGame.players[i][0])==JSON.stringify(player[0])){
            return i;
        }
    }
    return "notFound"
}
async function changeTurn(game) {
    let myGame = await Game.findById(game._id);
    if(myGame.playedCards.length!=4){
    let currentTurn;
    let currentTurnIndex;
    for (let i = 0; i < myGame.players.length; i++) {
        if (myGame.players[i][2] == true) {
            currentTurn = myGame.players[i];
            currentTurnIndex = i;
            break;
        }
    }
    
    let currentTeamTurn = currentTurn[1];
    myGame.players[myGame.players.indexOf(currentTurn)][2] = false;
    //change indexes!
    if (currentTeamTurn == 1) {
        myGame.players[currentTurnIndex + 2][2] = true;
        myGame.markModified("players")

        myGame.save()
        return false;
    }
    else {
        if (currentTurnIndex == 3) {
            myGame.markModified("players")
            myGame.save()
            myGame.players[0][2] = true;

            return false;
        }
        else {
            myGame.markModified("players")
            myGame.save()

            myGame.players[currentTurnIndex - 1][2] = true;

            return false;
        }
    }
}
else{
    let winningCard=await handWinner(game);
    await setFirstPlayer([winningCard.player],game);
    await calculateHand(winningCard,game);
    myGame.playedCards=[];
    myGame.markModified("playedCards");
    await myGame.save()
    setTimeout(async () => { await beginHand(game);}, 10);
    return true;
}
}

//TODO
async function calculateHand(card,game){
    let myGame=await Game.findById(game._id);
    let teamWinner=card.team;
    let hand=myGame.playedCards;
    let points=0;
    hand.forEach(el=>{
        points+=el.points;
    })
    myGame.handScore[teamWinner-1]+=points;
    let update={handScore:[myGame.handScore[0],myGame.handScore[1]]}
    let filter={_id:game._id}
    await Game.findOneAndUpdate(filter,update);
}
//!!!!!!!!!!!!!!!!!!!

async function beginHand(game){
    let myGame=await Game.findById(game._id);
    let firstPlayer=myGame.startingPlayer;
    for(let i=0;i<myGame.players.length;i++){
        if(JSON.stringify(myGame.players[i][0])==JSON.stringify(firstPlayer[0])){
            myGame.players[i][2]=true;
        }
        else
        myGame.players[i][2]=false;
    }
    myGame.markModified("players");
    
    myGame.save()
}
async function makeCall(call,team, game) {
    let myGame = await Game.findById(game._id);
    if (call != 7) {
        myGame.teamCalled=team;
        myGame.contract = call;
        myGame.passCount = 0;
    }
    else {
        myGame.passCount++;
    }
    myGame.markModified("contract");
    myGame.save();
    if ((myGame.passCount == 3 && myGame.contract != -1)) {
        beginHand(game);
        return "gameStart"
    }
    else if(myGame.passCount==4){
        let newFirst=myGame.players[await getPlayerIndex(myGame.startingPlayer,game)];
        myGame.passCount=0;
        myGame.markModified("passCount");
        myGame.save();
        setFirstPlayer(newFirst,game);
        return "newCalls"
    }
    else {
        await changeTurn(game);
        return "makeCall";
    }
}

async function handWinner(game){
    let myGame = await Game.findById(game._id);
    let hand=myGame.playedCards;
    let contract=myGame.contract;
    let firstColor=hand[0];
    hand.forEach(el=>{
        if(el.name==firstColor.name){el.suitPower=2}
    })
    if(contract==5){
        hand=hand.sort((a,b)=>{
            if(b.suitPower>a.suitPower)return 1;
            else return b.facePower-a.facePower
        })
        return hand[0];
    }
    else if(contract==5){
        hand=hand.sort((a,b)=>{
            if(b.suitPower>a.suitPower)return 1;
            else return b.facePower-a.facePower
        })
        return hand[0];
    }
    else if(contract==4){
        hand.forEach(el=>{
            if(el.name=="spades"){el.suitPower=3}
        })
        hand=hand.sort((a,b)=>{
            if(b.suitPower>a.suitPower)return 1;
            else return b.facePower-a.facePower
        })
        return hand[0];
    }
    else if(contract==3){
        hand.forEach(el=>{
            if(el.name=="hearts"){el.suitPower=3}
        })
        hand=hand.sort((a,b)=>{
            if(b.suitPower>a.suitPower)return 1;
            else return b.facePower-a.facePower
        })
        return hand[0];
    }
    else if(contract==2){
        hand.forEach(el=>{
            if(el.name=="diams"){el.suitPower=3}
        })
        hand=hand.sort((a,b)=>{
            if(b.suitPower>a.suitPower)return 1;
            else return b.facePower-a.facePower
        })
        return hand[0];
    }
    else if(contract==1){
        hand.forEach(el=>{
            if(el.name=="clubs"){el.suitPower=3}
        })
        hand=hand.sort((a,b)=>{
            if(b.suitPower>a.suitPower)return 1;
            else return b.facePower-a.facePower
        })
        return hand[0];
    }
}

async function gameEnd(game){

    //recalculate point additions etc!
    let myGame = await Game.findById(game._id);
    let caller=myGame.teamCalled;
    let team1Points=myGame.handScore[0];
    let team2Points=myGame.handScore[1];
    if(team1Points>team2Points&&caller==1){
        if(team2Points==0){
            myGame.score[0]+=team1Points+9;

            //change based on game
            myGame.score[1]-=10;
        }
        else{
        myGame.score[0]+=team1Points;
        myGame.score[1]+=team2Points;
        }
    }
    else if(team1Points>team2Points&&caller==2){
        if(team2Points==0){
            myGame.score[1]+=team2Points+team1Points+9;

            //change based on game
            myGame.score[0]-=10;
        }
        myGame.score[1]+=team2Points+team1Points;
    }
    else if(team1Points<team2Points&&caller==2){
        if(team1Points==0){
            myGame.score[1]+=team1Points+9;

            //change based on game
            myGame.score[1]-=10;
        }
        myGame.score[0]+=team1Points;
        myGame.score[1]+=team2Points;
    }
    else if(team1Points<team2Points&&caller==1){
        if(team1Points==0){
            myGame.score[1]+=team1Points+team2Points;
        

            //change based on game
            myGame.score[0]-=10;
        }
        myGame.score[0]+=team2Points+team1Points;
    }
    let filter={_id:game._id};
    let changes={points:[myGame.score[0],myGame.score[1]],handScore:[0,0]}
    console.log()
    console.log(myGame.score)
    Game.findByIdAndUpdate(filter,changes)
}

async function allowedCards(hand,game){
    let myGame = await Game.findById(game._id);
    let currentHand=myGame.playedCards;
    let highestPower=0;
  
    for(let i=0;i<currentHand.length;i++)
    {
        if(highestPower<currentHand[i].facePower)highestPower=currentHand[i].facePower
    }
    let contract=myGame.contract;
    if(contract==5){
        let sameColor=[]
        hand.forEach(el=>{
            if(el.suit==currentHand[0].suit)sameColor.push(el);
        })
        if(sameColor.length!=0){
            let higherPower=[]
            sameColor.forEach(el=>{
                if(el.facePower>highestPower)higherPower.push(el);
            })
            if(higherPower.length!=0){
                return higherPower;
            }
            else return sameColor;
        }
        else return hand;
    }
    else if(contract==4){
        let sameColor=[];
        hand.forEach(el=>{
            if(el.suit==currentHand[0].suit)sameColor.push(el);
        })
        if(sameColor.length!=0){
            return sameColor;
        }
        else return hand;
    }
    else{
        //igra na cvqt
        console.log("rip")
    }
    
}
module.exports = {
    dealCards,
    playCard,
    gameStart,
    changeTurn,
    makeCall,
    allowedCards,
    findCard,
    gameEnd
}