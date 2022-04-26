import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs/internal/observable/interval';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { User } from '../user';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  constructor(public _authService:AuthService,public _user:UserService) { }
  public user:any|User;
  public interval = interval(100);
  subInterval: any;
  routeSub: any;
  async ngOnInit(): Promise<void> {
    
    setTimeout(async() => { this.user=await this.getUser()}, 2000);
  }
  async getUser(){
    let user;
    if (!!localStorage.getItem('token')) {
      user = localStorage.getItem('token')!;
      let res = this._user.getUsername(user).toPromise();
      return res;
    }
    return false;
  }

}
