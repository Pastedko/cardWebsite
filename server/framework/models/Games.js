const {Schema,model}=require('mongoose');
const User=require('./User')
const gamesSchema=new Schema({
    players:{type:[{}]},
    active:{type:Boolean,required:true},
    score:{type:[Number]},
    teams:{type:Object,default:{team1:{player1:{username:"",announces:[],turn:false,cards:[]},player2:{username:"",announces:[],turn:false,cards:[]}},team2:{player1:{username:"",announces:[],turn:false,cards:[]},player2:{username:"",announces:[],turn:false,cards:[]}}}},
    contract:{type:String},
    password:{type:String},
    name:{type:String}
})

const Game=model('Game',gamesSchema);
module.exports=Game;