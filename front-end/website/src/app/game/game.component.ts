import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GameService } from '../services/game.service';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';
import { interval, Observable } from 'rxjs';
import { GameSocketService } from '../services/game-socket.service';
import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor(private _auth: AuthService, private router: Router, private _user: UserService, private _socket: SocketService, private _game: GameService, private _socketGame: GameSocketService) { }
  public game: any;
  public player: any;
  public playerNum: any;
  public team:number=0;
  public hand: any[] = [];
  public deck: any[] = [];
  public playedCards:any[]=[];
  public turn:boolean=false;
  public notInGame=true;
  public callActive=this.notInGame&&this.turn;
  public highestCall=-1;
  public clubs:any[]=[];
  public hearts:any[]=[];
  public diams:any[]=[];
  public spades:any[]=[];
  public cardPassed:boolean=true;
  public interval = interval(100);
  subInterval: any;
  routeSub: any;


  async ngOnInit(): Promise<void> {
    
    this.start();
    this.subInterval = this.interval.subscribe(async () => 
    { 
      //cards dealt
      if (this._socketGame.deck.length != 0) {
         this.deck = this._socketGame.deck; 
         this.dealCards();
         this.sortHand();
         this._socketGame.deck = []; 
        } 

      //card played
      if(this._socketGame.playedCard!=null){
        if(this._socketGame.playedCard!="ended"){
        this.playedCards.push(this._socketGame.playedCard);this.game = await this.getGame();this._socketGame.playedCard=null;
        this.isMyTurn();
        }
        else{
          this.game = await this.getGame()
          this._socketGame.playedCard=null;
          this.isMyTurn();
          setTimeout(() => { this.playedCards=[];}, 2000);
          console.log("alo")
          this._socketGame.handEnded();
        }
       
      }

      //call made
      if(this._socketGame.call!=-1){
        if(this._socketGame.call!="pass"){
        this.highestCall=this._socketGame.call;
        }
        this._socketGame.call=-1;
        this._socketGame.callMade();
        this.game = await this.getGame();
        this.isMyTurn();
      }

      //gameStarted
      if(this._socketGame.gameStarted==true){
        this.dealCards();
        this.rankCards();
        //this.sortHand();
        this._socketGame.gameStarted=false;
        this.notInGame=false;
        this.game = await this.getGame();
        this.isMyTurn();
        this._socket.gameHasStarted();
      }

      //?
      if(this._socketGame.isPlayed==false){
        this.cardPassed=false;
        this._socketGame.isPlayed=true;
      }

      //game ended
      if(this._socketGame.hasEnded==true){
        console.log("game ended")
        this.game = await this.getGame()
        this.isMyTurn();
        //show after game message
        this._socketGame.hasEnded=false;
        this.notInGame=true;
        this.deck=[];
        this._socketGame.deck=[];
        console.log(this.hand);
        this._socketGame.startNewGame(this.game);
      }
    })

    this.game = await this.getGame()
    this.player = await this.getUser();
    this.getTeam();
    this.playerNum = this.getPlayerNum();
    this.isMyTurn();

    console.log(this.notInGame);
    console.log(this.turn);
  }

  start(){
    this._socketGame.dealCards();
    this._socketGame.cardPlayed();
    this._socketGame.callMade();
    this._socketGame.startGame();
    this._socketGame.handEnded();
    this._socketGame.gameEnded();
  }

  rankCards(){
    if(this.highestCall==5){
      this.deck.forEach(el=>{
        console.log(el);
        if(el.face=="J"){el.facePower=17;el.points=20;}
        else
        if(el.face=="9"){el.facePower=16;el.points=14;}
        else 
        if(el.face=="10")el.facePower=14;
      })
    }
    else if(this.highestCall==4){
      this.deck.forEach(el=>{
        if(el.face=="10")el.facePower=14;
      })
    }
    this.sortHand();
  }
  async getGame() {
    this.game = this.router.parseUrl(this.router.url).root.children['primary'].segments[1].path;
    let res = this._user.getGame(this.game).toPromise();
    return res;
  }
  async getUser() {
    let user;
    if (!!localStorage.getItem('token')) {
      user = localStorage.getItem('token')!;
      let res = this._user.getUsername(user).toPromise();
      return res;
    }
    else {
      user = localStorage.getItem('guest')!;
      let res = this._user.getGuest(user).toPromise();
      return res;
    }
  }
  async getTeam(){
    let team=0;
    this.game.players.forEach((el:any) => {
      if(JSON.stringify(el[0])==JSON.stringify(this.player))team=el[1];
    });
    this.team=team;
  }
  getPlayerNum() {
    let num = -1;
    for (let i = 0; i < this.game.players.length; i++) {
      if ((this.game.players[i][0]._id == this.player._id&&!!this.player._id) || this.game.players[i][0] == this.player) num = i;
    }
    return num;
  }
  isMyTurn(){
    console.log("checked")
    let playerInGame=this.game.players[0];
    this.game.players.forEach((el:any) => {
      if(el[0]==this.player||(el[0].username==this.player.username&&this.player.username!=null)){
        playerInGame=el;
      }
    });
    this.turn=playerInGame[2];
    this.callActive=this.notInGame&&this.turn;
  }
  dealCards() {
    this.playerNum = this.getPlayerNum();
    console.log(this.deck)
    if(this.hand.length==5)
    {
      console.log(1)
      for (let i =20+ this.playerNum * 3; i <20+ this.playerNum*3 + 3; i++) {
        this.deck[i].player=this.player
        this.deck[i].team=this.team;
        switch(this.deck[i].name){
          case "spades":{this.spades.push(this.deck[i]);break;}
          case "clubs":{this.clubs.push(this.deck[i]);break;}
          case "hearts":{this.hearts.push(this.deck[i]);break;}
          case "diams":{this.diams.push(this.deck[i]);break;}
          default:console.log("ERROR!");
        }
      }
    }
    else{
      this.hand.length=0;
      console.log(2);
      console.log(this.hand.length)
      this.notInGame=true;
    for (let i = this.playerNum * 5; i < this.playerNum*5 + 5; i++) {
      this.deck[i].player=this.player
      this.deck[i].team=this.team;
      switch(this.deck[i].name){
        case "spades":{this.spades.push(this.deck[i]);break;}
        case "clubs":{this.clubs.push(this.deck[i]);break;}
        case "hearts":{this.hearts.push(this.deck[i]);break;}
        case "diams":{this.diams.push(this.deck[i]);break;}
        default:console.log("ERROR!");
      }
    }}
    
  }
  async playCard(index:number){
    console.log(this.turn)
    if(this.turn){
      let card=this.hand[index];
      let res=await this._game.isAllowed(card,this.hand,this.game).toPromise();
      if(res){
        this._socketGame.playCard(card,this.hand,this.game);
    this.hand.splice(index,1)
    this.cardPassed=true;
    }}
  }
  sortHand(){
    console.log(this.hand)
    this.spades.sort((a:any,b:any)=>{
      return a.facePower-b.facePower;
    })
    this.clubs.sort((a:any,b:any)=>{
      return a.facePower-b.facePower;
    })
    this.hearts.sort((a:any,b:any)=>{
      return a.facePower-b.facePower;
    })
    this.diams.sort((a:any,b:any)=>{
      return a.facePower-b.facePower;
    })
    this.hand.splice(0,this.hand.length);
    if(this.clubs.length==0){
      this.diams.forEach((el)=>this.hand.push(el))
      this.spades.forEach((el)=>this.hand.push(el))
      this.hearts.forEach((el)=>this.hand.push(el))
    }
    else if(this.hearts.length==0){
      this.clubs.forEach((el)=>this.hand.push(el))
      this.diams.forEach((el)=>this.hand.push(el))
      this.spades.forEach((el)=>this.hand.push(el))
    }else{
      this.diams.forEach((el)=>this.hand.push(el))
      this.clubs.forEach((el)=>this.hand.push(el))
      this.hearts.forEach((el)=>this.hand.push(el))
      this.spades.forEach((el)=>this.hand.push(el))
    }
    console.log(this.hand);
  }
  makeCall(index:number){
    console.log(this.highestCall);
    if(index>this.highestCall){
      this._socketGame.makeCall(index,this.team,this.game);
      console.log(index);
    }
  }
}
