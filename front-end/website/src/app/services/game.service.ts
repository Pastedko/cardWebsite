import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';


@Injectable({
  providedIn: 'root'
})
export class GameService {

  _dealCardsUrl="http://localhost:3000/dealCards/12321";
  constructor(private http:HttpClient,private router:Router,private socket:Socket) { }

  dealCards(){
    return this.http.get<any>(this._dealCardsUrl)
  }
}
