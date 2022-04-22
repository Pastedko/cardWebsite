import { Game } from "./game";
export class User{
    username:string="";
    email:string="";
    hashedPassword:string="";
    currentGame:Game;
    constructor(currentGame:Game){
        this.currentGame=currentGame;
    }
}