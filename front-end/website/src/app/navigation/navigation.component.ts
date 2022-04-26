import { Component, Injectable, OnInit } from '@angular/core';
import { interval } from 'rxjs/internal/observable/interval';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { User } from '../user';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
@Injectable({
  providedIn: 'root'
})
export class NavigationComponent implements OnInit {

  constructor(public _authService:AuthService,public _user:UserService) { }
  public user:any|User;
  public interval = interval(100);
  subInterval: any;
  routeSub: any;
  async ngOnInit(): Promise<void> {
    
  
    await this.getUser();console.log(this.user);
  }
  async getUser(){
    let user;
      user = localStorage.getItem('token')!;
      let res = await this._user.getUsername(user).toPromise();
      this.user=res;
  }

}
