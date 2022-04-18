const {Schema,model}=require('mongoose');
const User=require('./User')
const gamesSchema=new Schema({
    players:{type:[],default:[["",0,false],["",0,false],["",0,false],["",0,false]]},
    active:{type:Boolean,required:true},
    score:{type:[Number],default:[0,0]},
    handScore:{type:[Number],default:[0,0]},
    announces:{type:Object,default:{1:[],2:[]}},
    contract:{type:Number,default:-1},
    teamCalled:{type:Number,default:0},
    password:{type:String},
    name:{type:String},
    startingPlayer:{},
    lastStarted:{type:Number,default:3},
    playedCards:{type:Array,default:[]},
    passCount:{type:Number,default:0}
})

const Game=model('Game',gamesSchema);
module.exports=Game;