import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class GameSocketService {

  constructor(private http: HttpClient, private router: Router, private socket: Socket, private _user: UserService) { }

  public deck:any[]=[];
  public playedCard:any=null;
  public playerTurn:number=1;
  public call:any=-1;
  public gameStarted:boolean=false;
  public isPlayed:boolean=true;
  public hasEnded:boolean=false;

  dealCards(){
    this.socket.on("dealCards",async(cards:any[])=>{
      console.log("hello from socket dealCards")
      this.deck=cards;
      console.log(this.deck)
    })
  }
  playCard(card:any,hand:any,game:any){
    this.socket.emit("cardPlayed",{card:card,hand:hand,game:game});
  }
  cardPlayed(){
    this.socket.on("cardPlayed",(card:any)=>{
      this.playedCard=card;
    })
  }
  reqCard(){
    this.socket.on("playCard",async(id:number)=>{
      this.playerTurn=id;
    })
  }
  handEnded(){
    this.socket.on("handEnded",()=>{
      this.playedCard="ended";
    })
  }
  makeCall(call:number,team:number,game:any){
    this.socket.emit("callMade",{call:call,team:team,game:game});
  }
  callMade(){
    this.socket.on("callMade",(call:number)=>{
      if(call==7){
        this.call="pass"
      }
      else
      this.call=call;
    })
  }
  startGame(){
    this.socket.on("startGame",()=>{
      console.log("hello my dudes the game has started")
      this.gameStarted=true;
    })
  }
  wrongCard(){
    this.socket.on("wrongCard",()=>{
      console.log("wrong card");
      this.isPlayed=false;
    })
  }
  gameEnded(){
    this.socket.on("gameEnded",()=>{ 
      this.hasEnded=true;
    })
  }
  startNewGame(game:any){
    this.socket.emit("gameStarted",game);
  }

}
