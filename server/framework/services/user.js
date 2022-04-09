const User=require('../models/User');
const {compare,hash}=require('bcrypt');
const res = require('express/lib/response');

//TODO add all fields required
async function register(email,password,username){
    const existing=await getUserByEmail(email);
    if(existing){
        throw new Error('Email is already in use');
    }
    const existing2=await getUserByUsername(username);
    if(existing2){
        throw new Error('Username is already in use')
    }
    const hashedPassword=await hash(password,10);
    const user=new User({
        username,
        email,
        hashedPassword
    });
    await user.save();
    return user;
}

async function login(email,password){
    const user=await getUserByEmail(email);
    if(!user){
        throw new Error('Incorrect email or password.');
    }
    const hasMatch=await compare(password,user.hashedPassword);
    if(!hasMatch){
        throw new Error('Incorrect email or password.')
    }
    return user;
}
//TODO change identifier
async function getUserByEmail(email){
    const user=await User.findOne({email:new RegExp(`^${email}$`,'i')});
    return user;
}
async function getUserByUsername(username){
    const user=await User.findOne({username:new RegExp(`^${username}$`,'i')});
    return user
}

async function getUserById(id){
    const user=await User.findById(id);
    return user
}
module.exports={
    login,
    register,
    getUserById
}