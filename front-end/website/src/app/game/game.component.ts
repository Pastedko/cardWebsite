import { Component, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GameService } from '../services/game.service';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';
import { exhaustAll, interval, Observable } from 'rxjs';
import { GameSocketService } from '../services/game-socket.service';
import { Card } from './card';
import { Game } from '../game';
import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})


export class GameComponent implements OnInit {
  
  constructor(private _auth: AuthService, private router: Router, private _user: UserService, private _socket: SocketService, private _game: GameService, private _socketGame: GameSocketService) { }
  public game:any
  public player: any;
  public playerNum: number=0;
  public team:number=0;
  public hand: Card[] = [];
  public deck: Card[] = [];
  public playedCards:Card[]=[];
  public turn:boolean=false;
  public notInGame=true;
  public callActive=this.notInGame&&this.turn;
  public highestCall=-1;
  public clubs:Card[]=[];
  public hearts:Card[]=[];
  public diams:Card[]=[];
  public spades:Card[]=[];
  public team1Score:number=0;
  public team2Score:number=0;
  public cardPassed:boolean=true;
  public premiumsAllowed:boolean=false;
  public interval = interval(100);
  public call:number=-1;
  public belot:any=false;
  public positions:any[]=[];
  public callPlayer1:any;
  public premiums:any={0:"Tierce",1:"Quarte",2:"Quint",3:"Sqare"}
  public premiumsCalled:any[]=[];
  public usedCards:Card[]=[];
  subInterval: any;
  routeSub: any;


  async ngOnInit(): Promise<void> {
    
    this.start();
    this.game = await this.getGame()
    this.player = await this.getUser();
    this.getTeam();
    this.playerNum = this.getPlayerNum();
    await this.isMyTurn();
    this.subInterval = this.interval.subscribe(async () => 
    { 
      //cards dealt
      if (this._socketGame.deck.length != 0) {
        this.highestCall=-1;
        this.hand=[];
        this.deck=[];
         this.deck = this._socketGame.deck; 
         this.dealCards();
         this.sortHand();
         this._socketGame.deck = []; 
         this.game = await this.getGame();
         await this.isMyTurn();
         await this.getPlayerPositions();
        } 

      //card played
      if(this._socketGame.playedCard!=null){
        if(this._socketGame.playedCard!="ended"){
        this.playedCards.push(this._socketGame.playedCard);this.game = await this.getGame();this._socketGame.playedCard=null;
        await this.isMyTurn();
        await this.getPlayerPositions();
        }
        else{
          this.game = await this.getGame()
          this._socketGame.playedCard=null;
          this.isMyTurn();
          await this.getPlayerPositions();
          setTimeout(() => { this.playedCards.splice(0,4);}, 2000);
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
        await this.isMyTurn();
        await this.getPlayerPositions();
      }

      //gameStarted
      if(this._socketGame.gameStarted==true){
        
        this.dealCards();
        this.rankCards();
        //this.sortHand();
        this._socketGame.gameStarted=false;
        this.notInGame=false;
        this.game = await this.getGame();
        await this.isMyTurn();
        await this.getPlayerPositions();
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
        await this.getPlayerPositions();
        this.team1Score=this.game.score[0];
        this.team2Score=this.game.score[1];
        //show after game message
        this._socketGame.hasEnded=false;
        this.notInGame=true;
        this._socketGame.deck=[];
        console.log(this.hand);
        this._socketGame.startNewGame(this.game);
      }

      //premiums
      if(this.game.handScore[0]==0&&this.game.handScore[1]==0&&this.turn==true&&this.notInGame==false){
        this.premiumsAllowed=true;
      }
      else this.premiumsAllowed=false;

      if(this._socketGame.premium!=-1){
        let index=-1;
        console.log(this._socketGame.premium)
        let player=this._socketGame.premium.player;
        for(let i=0;i<this.positions.length;i++){
          if(JSON.stringify(player)==JSON.stringify(this.positions[i][0])){
            index=i;
          }
        }
        if(index!=-1){
          this.premiumsCalled[index]=this.premiums[this._socketGame.premium.call];
        }
        console.log(this.premiumsCalled);
        this._socketGame.premium=-1;
        setTimeout(() => { this.premiumsCalled[index]=null;}, 3000);
      }


      //belot
      if(this._socketGame.belot!=false){
        this._socketGame.belotCalled();
        this.belot=this._socketGame.belot;
        this._socketGame.belot=false;
        let player=this.belot.player;
        console.log(player)
        let index=-1;
        for(let i=0;i<this.positions.length;i++){
          console.log(JSON.stringify(player));
          console.log(JSON.stringify(this.positions[i][0]));
          if(JSON.stringify(player)==JSON.stringify(this.positions[i][0])){
            index=i;
          }
        }
        console.log(index);
        if(index!=-1){
          this.premiumsCalled[index]="Belot";
        }
        setTimeout(() => { this.premiumsCalled[index]=null;this.belot=false;}, 3000);
      }
    })

   
   // await this.reconnect();
   this.getPlayerPositions();
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
    this._socketGame.premiumCalled();
    this._socketGame.belotCalled();
  }

  rankCards(){
    if(this.highestCall==5){
      this.deck.forEach(el=>{
        console.log(el);
        if(el.face=="J"){el.facePower=17;el.points=20;}
        else
        if(el.face=="9"){el.facePower=16;el.points=14;}
      })
    }
    else if(this.highestCall==3){
      this.deck.forEach(el=>{
        console.log(el);
        if(el.face=="J" && el.name=="spades"){el.facePower=17;el.points=20;el.suitPower=3;}
        else
        if(el.face=="9"&& el.name=="spades"){el.facePower=16;el.points=14;el.suitPower=3;}
      })
    }
    else if(this.highestCall==2){
      this.deck.forEach(el=>{
        console.log(el);
        if(el.face=="J" && el.name=="hearts"){el.facePower=17;el.points=20;el.suitPower=3;}
        else
        if(el.face=="9"&& el.name=="hearts"){el.facePower=16;el.points=14;el.suitPower=3;}
      })
    }
    else if(this.highestCall==1){
      this.deck.forEach(el=>{
        console.log(el);
        if(el.face=="J" && el.name=="diams"){el.facePower=17;el.points=20;el.suitPower=3;}
        else
        if(el.face=="9"&& el.name=="diams"){el.facePower=16;el.points=14;el.suitPower=3;}
      })
    }
    else if(this.highestCall==0){
      this.deck.forEach(el=>{
        console.log(el);
        if(el.face=="J" && el.name=="clubs"){el.facePower=17;el.points=20;el.suitPower=3;}
        else
        if(el.face=="9"&& el.name=="clubs"){el.facePower=16;el.points=14;el.suitPower=3;}
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
    this.playedCards=[];
    console.log(this.deck)
    if(this.hand.length==5)
    {
      console.log(1);
      console.log(this.hand);
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
      this.spades.length=0;
      this.clubs.length=0;
      this.hearts.length=0;
      this.diams.length=0;
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

   checkBelot(card:Card){
     console.log(card)
    if(card.face=="Q"){
      let found=this.hand.filter((el:Card)=>{
       return  el.face=="K"&&el.name==card.name
      })
      if(found.length!=0)return true;
      return false
    }
    else if(card.face=="K"){
      let found=this.hand.filter((el:Card)=>{
        return el.face=="Q"&&el.name==card.name
      })
      if(found.length!=0)return true;
      return false
    }
    else return false;
  }
  async playCard(index:number){
    if(this.turn){
      let card=this.hand[index];
      let res=await this._game.isAllowed(card,this.hand,this.game).toPromise();
      if(res){
        if(this.checkBelot(card)==true){
          card.belot=true;
        }
        this._socketGame.playCard(card,this.hand,this.game);
    this.hand.splice(index,1)
    this.cardPassed=true;
    }}
  }
  sortHand(){
    this.spades.sort((a:Card,b:Card)=>{
      return a.facePower-b.facePower;
    })
    this.clubs.sort((a:Card,b:Card)=>{
      return a.facePower-b.facePower;
    })
    this.hearts.sort((a:Card,b:Card)=>{
      return a.facePower-b.facePower;
    })
    this.diams.sort((a:Card,b:Card)=>{
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
  }
  makeCall(index:number){
    if(index>this.highestCall){
      this._socketGame.makeCall(index,this.team,this.game);
    }
  }
  callPremium(index:number){
    let result=this.canCallPremium(index);
    if(result!=false){
      this._socketGame.callPremium(index,result,this.game);
    }
  }
  canCallPremium(index:number){
    let clubs2;
    let diams2;
    let hearts2;
    let spades2;
    console.log(this.usedCards);
    this.clubs.sort((a,b)=>{
      return a.cardOrder-b.cardOrder
    })
    this.diams.sort((a,b)=>{
      return a.cardOrder-b.cardOrder
    })
    this.hearts.sort((a,b)=>{
      return a.cardOrder-b.cardOrder
    })
    this.spades.sort((a,b)=>{
      return a.cardOrder-b.cardOrder
    })


    this.clubs=this.clubs.filter((el:Card)=>{
      return !this.usedCards.includes(el)
    })
    this.diams=this.diams.filter((el:Card)=>{
      return !this.usedCards.includes(el)
    })
    this.spades=this.spades.filter((el:Card)=>{
      return !this.usedCards.includes(el)
    })
    this.hearts=this.hearts.filter((el:Card)=>{
      return !this.usedCards.includes(el)
    })


    if(index==0){
      for(let i=1;i<this.clubs.length-1;i++){
        if(this.clubs[i].cardOrder==this.clubs[i-1].cardOrder+1&&this.clubs[i].cardOrder+1==this.clubs[i+1].cardOrder){
          console.log(this.clubs[i+1]);
          this.usedCards.push(this.clubs[i]);
          this.usedCards.push(this.clubs[i-1]);
          this.usedCards.push(this.clubs[i+1]);
          return this.clubs[i+1];
        }
      }
      for(let i=1;i<this.diams.length-1;i++){
        if(this.diams[i].cardOrder==this.diams[i-1].cardOrder+1&&this.diams[i].cardOrder+1==this.diams[i+1].cardOrder){
          this.usedCards.push(this.diams[i]);
          this.usedCards.push(this.diams[i-1]);
          this.usedCards.push(this.diams[i+1]);
         return this.diams[i+1]
        }
      }
      for(let i=1;i<this.hearts.length-1;i++){
        if(this.hearts[i].cardOrder==this.hearts[i-1].cardOrder+1&&this.hearts[i].cardOrder+1==this.hearts[i+1].cardOrder){
          this.usedCards.push(this.hearts[i]);
          this.usedCards.push(this.hearts[i-1]);
          this.usedCards.push(this.hearts[i+1]);
          return this.hearts[i+1]
        }
      }
      for(let i=1;i<this.spades.length-1;i++){
        if(this.spades[i].cardOrder==this.spades[i-1].cardOrder+1&&this.spades[i].cardOrder+1==this.spades[i+1].cardOrder){
          this.usedCards.push(this.spades[i]);
          this.usedCards.push(this.spades[i-1]);
          this.usedCards.push(this.spades[i+1]);
          return this.spades[i+1]
        }
      }
      return false;
      //terca
    }
    else if(index==1){
      //50

      for(let i=1;i<this.clubs.length-2;i++){
        if(this.clubs[i].cardOrder==this.clubs[i-1].cardOrder+1&&this.clubs[i].cardOrder+1==this.clubs[i+1].cardOrder&&this.clubs[i+1].cardOrder+1==this.clubs[i+2].cardOrder){
          this.usedCards.push(this.clubs[i]);
          this.usedCards.push(this.clubs[i-1]);
          this.usedCards.push(this.clubs[i+1]);
          this.usedCards.push(this.clubs[i+2]);
          return this.clubs[i+2]
        }
      }
      for(let i=1;i<this.diams.length-2;i++){
        if(this.diams[i].cardOrder==this.diams[i-1].cardOrder+1&&this.diams[i].cardOrder+1==this.diams[i+1].cardOrder&&this.diams[i+1].cardOrder+1==this.diams[i+2].cardOrder){
          this.usedCards.push(this.diams[i]);
          this.usedCards.push(this.diams[i-1]);
          this.usedCards.push(this.diams[i+1]);
          this.usedCards.push(this.diams[i+2]);
          return this.diams[i+2]
        }
      }
      for(let i=1;i<this.hearts.length-2;i++){
        if(this.hearts[i].cardOrder==this.hearts[i-1].cardOrder+1&&this.hearts[i].cardOrder+1==this.hearts[i+1].cardOrder&&this.hearts[i+1].cardOrder+1==this.hearts[i+2].cardOrder){
          this.usedCards.push(this.hearts[i]);
          this.usedCards.push(this.hearts[i-1]);
          this.usedCards.push(this.hearts[i+1]);
          this.usedCards.push(this.hearts[i+2]);
          return this.hearts[i+2]
        }
      }
      for(let i=1;i<this.spades.length-1;i++){
        if(this.spades[i].cardOrder==this.spades[i-1].cardOrder+1&&this.spades[i].cardOrder+1==this.spades[i+1].cardOrder&&this.hearts[i+1].cardOrder+1==this.hearts[i+2].cardOrder){
          this.usedCards.push(this.spades[i]);
          this.usedCards.push(this.spades[i-1]);
          this.usedCards.push(this.spades[i+1]);
          this.usedCards.push(this.spades[i+2]);
          return this.spades[i+2]
        }
      }

      return false;
    }
    else if(index==2){
      //100

      for(let i=1;i<this.clubs.length-3;i++){
        if(this.clubs[i].cardOrder==this.clubs[i-1].cardOrder+1&&this.clubs[i].cardOrder+1==this.clubs[i+1].cardOrder&&this.clubs[i+1].cardOrder+1==this.clubs[i+2].cardOrder
          &&this.clubs[i+2].cardOrder+1==this.clubs[i+3].cardOrder){
            this.usedCards.push(this.clubs[i]);
            this.usedCards.push(this.clubs[i-1]);
            this.usedCards.push(this.clubs[i+1]);
            this.usedCards.push(this.clubs[i+2]);
            this.usedCards.push(this.clubs[i+3]);
          return this.clubs[i+3];
        }
      }
      for(let i=1;i<this.diams.length-3;i++){
        if(this.diams[i].cardOrder==this.diams[i-1].cardOrder+1&&this.diams[i].cardOrder+1==this.diams[i+1].cardOrder&&this.diams[i+1].cardOrder+1==this.diams[i+2].cardOrder
          &&this.diams[i+2].cardOrder+1==this.diams[i+3].cardOrder){
            this.usedCards.push(this.diams[i]);
            this.usedCards.push(this.diams[i-1]);
            this.usedCards.push(this.diams[i+1]);
            this.usedCards.push(this.diams[i+2]);
            this.usedCards.push(this.diams[i+3]);
         return this.diams[i+3];
        }
      }
      for(let i=1;i<this.hearts.length-3;i++){
        if(this.hearts[i].cardOrder==this.hearts[i-1].cardOrder+1&&this.hearts[i].cardOrder+1==this.hearts[i+1].cardOrder&&this.hearts[i+1].cardOrder+1==this.hearts[i+2].cardOrder
          &&this.hearts[i+2].cardOrder+1==this.hearts[i+3].cardOrder){
            this.usedCards.push(this.hearts[i]);
            this.usedCards.push(this.hearts[i-1]);
            this.usedCards.push(this.hearts[i+1]);
            this.usedCards.push(this.hearts[i+2]);
            this.usedCards.push(this.hearts[i+3]);
          return this.hearts[i+3];
        }
      }
      for(let i=1;i<this.spades.length-3;i++){

        if(this.spades[i].cardOrder==this.spades[i-1].cardOrder+1&&this.spades[i].cardOrder+1==this.spades[i+1].cardOrder&&this.hearts[i+1].cardOrder+1==this.hearts[i+2].cardOrder
          &&this.spades[i+2].cardOrder+1==this.spades[i+3].cardOrder){
            this.usedCards.push(this.spades[i]);
            this.usedCards.push(this.spades[i-1]);
            this.usedCards.push(this.spades[i+1]);
            this.usedCards.push(this.spades[i+2]);
            this.usedCards.push(this.spades[i+3]);
          return this.spades[i+3];
        }
      }
      return false;
    }
    else if(index==3){
      //4 ednakvi

      if(this.spades.length==0||this.hearts.length==0||this.clubs.length==0||this.diams.length==0){
        return false
      }else{
        let result=false;
        let card;
        this.spades.forEach(el=>{
          console.log(el)
          console.log(this.hearts.filter(elem=>elem.face==el.face))
          console.log(this.diams.filter(elem=>elem.face==el.face))
          console.log(this.clubs.filter(elem=>elem.face==el.face))
          if(this.hearts.filter(elem=>elem.face==el.face).length!=0
          &&this.diams.filter(elem=>elem.face==el.face).length!=0
          &&this.clubs.filter(elem=>elem.face==el.face).length!=0){result=true;card=el;}
        })
        if(result==false){
          return false
        }
        else return card;
      }
    }
    return false;
  }
  getPlayerPositions(){

    this.positions=[];
    this.positions.push([this.player])
    let index=this.playerNum;
    let team=this.team;
    for(let i=1;i<4;i++){
    if (team == 1) {
      this.positions.push(this.game.players[ index+ 2])
      index=index+2;
      team=this.game.players[index][1];
  }
  else {
      if (index == 3) {
        this.positions.push(this.game.players[ index-3])
        index=index-3;
        team=this.game.players[index][1];
      }
      else {
        this.positions.push(this.game.players[ index-1])
        index=index-1;
        team=this.game.players[index][1];
      }
  }
  }
  console.log(this.positions)
}
  async reconnect(){
    this.game=await this.getGame();
    this._socketGame.reconnect(this.game);
    this.deck=this.game.deck
  }

}
