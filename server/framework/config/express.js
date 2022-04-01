const express = require('express');
const {create:handlebars}=require('express-handlebars');
const session=require('express-session');
const cors=require('cors')

module.exports=(app)=>{
    app.engine('.hbs',handlebars({
        extname:'.hbs'
    }).engine)
    app.set('view engine','.hbs');

    app.use('/static',express.static('static'));
    app.use(session({
        secret:'secret',
        resave:false,
        saveUninitialized:true,
        cookie:{
            secure:'auto'
        }
    }))
    app.use(cors())
    app.use(express.urlencoded({extended:true}));
}