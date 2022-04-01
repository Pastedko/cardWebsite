const express = require('express');

const databaseConfig = require('./config/database');
const epxressConfig=require('./config/express');
const routesConfig=require('./config/routes')


const app=express();
start();

async function start(){
    const app=express();
    app.use(express.json())
    epxressConfig(app);
    await databaseConfig();
    routesConfig(app)

    app.get('/',(req,res)=>{
        console.log(req.session);
        res.render('home',{layout:false})

    })
    app.listen(3000,()=>console.log('Server running on port 3000.'))
}