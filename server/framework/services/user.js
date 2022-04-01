const User=require('../models/User');
const {compare,hash}=require('bcrypt');

//TODO add all fields required
async function register(username,password){
    const existing=await getUserByUsername(username);
    if(existing){
        throw new Error('Username is taken');
    }
    
    const hashedPassword=await hash(password,10);
    const user=new User({
        username,
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
    const user=await User.findOne({username:new RegExp(`^${email}$`,'i')});
    return user;
}

module.exports={
    login,
    register
}