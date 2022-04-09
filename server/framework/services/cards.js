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
const {sendMessage}=require('../socket/socket');

let faces=["2","3","4","5","6","7","8","9","J","Q","K","A"];
let suits=["&spades;","&clubs;","&hearts;","&diamondsuit;"]

class Card{
    face;
    suit;
    player
    constructor(face,suit,player){
        this.face=face;
        this.suit=suit;
        this.player=player;
    }
    
}
async function dealCards(){
    let deck=[];
    let hand=[];
  
    for(let i=0;i<5;i++){
        let card=new Card(faces[Math.floor(Math.random()*12)],suits[Math.floor(Math.random()*4)],"");
        if(!exists(card,deck)){
            hand.push(card);
            deck.push(card);
            console.log(card)
        }
    }
    //console.log(hand);
  //  console.log(deck)

}

function exists(card,deck){
    deck.forEach(el => {
        if(card.face==el.face&&card.suit==el.suit)return true;
    });
    return false;
}


module.exports = {
    dealCards
}