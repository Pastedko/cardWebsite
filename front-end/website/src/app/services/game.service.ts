import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';


@Injectable({
  providedIn: 'root'
})
export class GameService {

  _checkCardsUrl="http://localhost:3000/allowed";
  constructor(private http:HttpClient,private router:Router,private socket:Socket) { }

  isAllowed(card:any,hand:any[],game:any){
    return this.http.post<any>(this._checkCardsUrl,{card:card,hand:hand,game:game})
  }
}
