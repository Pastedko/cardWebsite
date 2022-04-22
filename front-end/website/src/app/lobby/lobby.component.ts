import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { SocketService } from '../services/socket.service';
import { ApplicationInitStatus, Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {

  constructor(private _auth: AuthService, private router: Router, private _user: UserService, private _socket: SocketService) { }

  interval = interval(500);
  subInterval: any;
  routeSub: any;

  public game = {
    _id:0,
    name: "",
    players: []
  };
  public team1: any = [];
  public team2: any = [];

  public players: any = [];
  ngOnDestroy(): void {
    this.subInterval.unsubscribe();
  }
  async ngOnInit(): Promise<void> {
    await this.updateLobby();
    await this._socket.gameHasStarted()
    setTimeout(()=>{this.isLobbyOwner();},100);
    this.subInterval = this.interval.subscribe(() => { if (this._socket.hasUpdated == true) { this.updateLobby(); this._socket.hasUpdated = false; } if(this._socket.hasStarted==true)this.router.navigate([`game/${this.game._id}`])})


  }
  updateLobby() {
    this.players = [];
    this.team1 = [];
    this.team2 = [];
    const game = this.router.parseUrl(this.router.url).root.children['primary'].segments[1].path;
    this._user.getGame(game).subscribe(
      res => {
        this.game = res; res.players.forEach((el: any[]) => {
          if (el[1] == 1) {
            if (typeof el[0] == "number") { this.players.push("Guest " + el[0]); this.team1.push("Guest " + el[0]) }
            else { this.players.push(el[0]); this.team1.push(el[0].username); }
          }
          else {
            if (typeof el[0] == "number") { this.players.push("Guest " + el[0]); this.team2.push("Guest " + el[0]) }
            else { this.players.push(el[0].username); this.team2.push(el[0].username); }
          }
        });
      },
      err => { console.log(err) }
    );

    this._socket.gameLobby();
  }
  leaveLobbyWithUrl(url: any) {
    console.log("hello")
    let user = {
      _id: ""
    };
    if (!!localStorage.getItem('token')) {
      user._id = localStorage.getItem('token')!;
    }
    else user._id = localStorage.getItem('guest')!;
    const game = url
    this._user.leaveGame(user, game).subscribe(
      res => { this._socket.leaveGame(game); this.router.navigate(['/']) },
      err => { console.log(err) }
    );
  }
  public isOwner = false;

  isLobbyOwner() {
    let user = {
      _id: ""
    };
    if (!!localStorage.getItem('token')) {
      user._id = localStorage.getItem('token')!;
      this._user.getUsername(user._id).subscribe(
        res => {console.log(this.players[0]); if (this.players[0].username == res.username) { this.isOwner = true; } },
        err => { console.log(err) }
      )
    }
    else {
      user._id = localStorage.getItem('guest')!;
      this._user.getGuest(user._id).subscribe(
        res => { ; if (this.players[0] == `Guest ${res}`) { this.isOwner = true; } },
        err => { console.log(err) }
      );
    }
  }

  leaveLobby() {
    let user = {
      _id: ""
    };
    if (!!localStorage.getItem('token')) {
      user._id = localStorage.getItem('token')!;
    }
    else user._id = localStorage.getItem('guest')!;
    const game = this.router.parseUrl(this.router.url).root.children['primary'].segments[1].path;
    this._user.leaveGame(user, game).subscribe(
      res => { this._socket.leaveGame(game); this.router.navigate(['/']) },
      err => { console.log(err) }
    );
  }
  changeTeam(team: number) {
    let currentTeam=1;
    let username="";
    let user = {
      _id: ""
    };
    console.log(this.team1);
    console.log(this.team2);
    if ((team == 2 && this.team2.length < 2) || (team == 1 && this.team1.length < 2)) {
      if (!!localStorage.getItem('token')) {
        user._id = localStorage.getItem('token')!;
        this._user.getUsername(user._id).subscribe(
          res => {

             username=res.username
             console.log(this.team1.indexOf(username)!=-1&&team==2)
             if((this.team1.indexOf(username)!=-1&&team==2)||(this.team2.indexOf(username)!=-1&&team==1)){
              const game = this.router.parseUrl(this.router.url).root.children['primary'].segments[1].path;
              this._user.changeTeam(user, game).subscribe(
                res => { this._socket.gameLobbyUpdate(res._id); console.log(res._id) },
                err => { console.log(err); }
              )
              }
            },
          err => { console.log(err) })
      }
      else {
        user._id = localStorage.getItem('guest')!;
        this._user.getGuest(user._id).subscribe(
          res => { 

            username=`Guest ${res}`
            console.log(this.team1.indexOf(username))
            if((this.team1.indexOf(username)!=-1&&team==2)||(this.team2.indexOf(username)!=-1&&team==1)){
              const game = this.router.parseUrl(this.router.url).root.children['primary'].segments[1].path;
              this._user.changeTeam(user, game).subscribe(
                res => { this._socket.gameLobbyUpdate(res._id); console.log(res._id) },
                err => { console.log(err); }
              )
              }
          
          },
          err => { console.log(err) })
      }
      
    }
  }

  confirmChange(){
    
  }
  async startGame() {
   if (this.team1.length + this.team2.length == 4){
    this.router.navigate([`game/${this.game._id}`])
    this._socket.startGame(this.game);
  }
  }
}
