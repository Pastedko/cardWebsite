import { ApplicationInitStatus, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import{io} from "socket.io-client"

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient,private router:Router,private socket:Socket) { }
  private _createUrl="http://localhost:3000/create";
  private _getGamesUrl="http://localhost:3000/getAll";
  private _getGameUrl="http://localhost:3000/getGame/";
  private _joingGameUrl="http://localhost:3000/join/";
  private _getUsernameUrl="http://localhost:3000/getUser/";
  private _getGuestUrl="http://localhost:3000/getGuest/";
  private _leaveGameUrl="http://localhost:3000/leaveGame/";
  private _changeTeamUrl="http://localhost:3000/change/";

  createLobby(lobby:Object){
    return this.http.post<any>(this._createUrl,lobby,{
      headers:new HttpHeaders({
        "charset":"utf-8"
      })
    })
  }
  getGames(){
    return this.http.get<any>(this._getGamesUrl)
  }
  joinGame(user:any,game:String){
    return this.http.post<any>(`${this._joingGameUrl}${game}`,user,{
      headers:new HttpHeaders({
        "cjarset":"utf-8"
      })
    })
  }
  getGame(game:any){
    return this.http.get<any>(`${this._getGameUrl}${game}`);
  }
  getUsername(id:any){
    return this.http.get<any>(`${this._getUsernameUrl}${id}`);
  }
  getGuest(id:any){
    return this.http.get<any>(`${this._getGuestUrl}${id}`);
  }
  leaveGame(user:any,game:any){
    return this.http.post<any>(`${this._leaveGameUrl}${game}`,user);
  }
  changeTeam(user:any,game:any){
    return this.http.post<any>(`${this._changeTeamUrl}${game}`,user)
  }
}
