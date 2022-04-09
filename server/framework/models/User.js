const { default: mongoose } = require('mongoose');
const {Schema,model,Types:{ObjectId}}=require('mongoose');
const {Game}=require('./Games');


const userSchema=new Schema({
    username:{type:String,required:true},
    email:{type:String,required:true},
    hashedPassword:{type:String,required:true},
    currentGame:{type:ObjectId,ref:"Game",default:null}
})

userSchema.index({email:1},{
    unique:true,
    collation:{
        locale:'en',
        strength:2
    }
})

const User=model('User',userSchema);

module.exports=User;