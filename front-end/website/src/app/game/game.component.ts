import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GameService } from '../services/game.service';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor(private _auth:AuthService,private router:Router,private _user:UserService,private _socket:SocketService,private _game:GameService) { }

  ngOnInit(): void {
    this.dealCards();
  }
  dealCards(){
    console.log("hi")
    this._game.dealCards().subscribe(
      res=>{},
      err=>{}
    )
  }

}
