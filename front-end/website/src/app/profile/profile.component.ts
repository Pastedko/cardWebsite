import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '../game';
import { AuthService } from '../services/auth.service';
import { GameSocketService } from '../services/game-socket.service';
import { GameService } from '../services/game.service';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';
import { User } from '../user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private _auth: AuthService, private router: Router, private _user: UserService, private _socket: SocketService, private _game: GameService, private _socketGame: GameSocketService) { }
  public games:Game[]=[];
  public user:any;
  public players:any[]=[[]];
  async ngOnInit(): Promise<void> {
    this.user=await this.getUser();
    console.log(this.user);
    this.games=await this.getGames();
    console.log(this.games)
    this.getGamePlayers();

  }

  getUser(){
    let user;
    if (!!localStorage.getItem('token')) {
      user = localStorage.getItem('token')!;
      let res = this._user.getUsername(user).toPromise();
      return res;
    }
    return false;
  }
  getGames(){
    let res=this._game.getGamesOfUser(this.user).toPromise();
    return res;
  }
  getGamePlayers(){
    this.games.forEach((game:any,index:number)=>{
      //this.players.push([]);
        game.players.forEach((el: any[]) => {
          console.log(this.players[index]);
          console.log(el);
            if (typeof el[0] == "number") {console.log(el[0]); this.players[index].push("Guest " + el[0]);}
            else {console.log(el[0]); this.players[index].push(el[0].username);}
        });
      },
      (err:any) => { console.log(err) }
    );
    console.log(this.players)
  }
  editProfile(){
    this.router.navigate([`edit/${localStorage.getItem('token')}`])
  }
}
