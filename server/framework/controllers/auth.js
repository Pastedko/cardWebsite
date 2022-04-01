const {Router}=require('express');
const { isUser,isGuest } = require('../middleware/guard');
const { register } = require('../services/user');
const {login}=require('../services/user');
const mapErrors = require('../util/mappers');

const router=Router();

router.get('/register',isGuest(),(req,res)=>{
    res.render('register');
})

//TODO check form action,method,field names
router.post('/register',async (req,res)=>{
    try{
    if(req.body.password!=req.body.passwordAgain){
        throw new Error('Passwords don\'t match')
    }
    const user=await register(req.body.username,req.body.password);
    req.session.user=user;
    //res.redirect('/');//TODO check redirect requirements
    res.end()
    }
    catch(err){
        const errors=mapErrors(err);
        console.error(err);
        res.render('register',{data:{username:req.body.username},errors})
    }
})

router.get('/login',isGuest(),(req,res)=>{
    res.render('login');
})

router.post('/login',isGuest(),async (req,res)=>{
    try{
        const user=await login(req.body.email,req.body.password);
       // req.session.user=user;
       // res.redirect('/');//TODO check redirect requirements
        }
        catch(err){
            const errors=mapErrors(err);
            console.error(err);
            res.render('login',{data:{username:req.body.username},errors})
        }
})

router.get('/logout',isUser(),(req,res)=>{
    delete req.session.user;
    res.redirect('/');
})

module.exports=router;