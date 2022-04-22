import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import {CookieService} from 'ngx-cookie-service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private _auth:AuthService,private router:Router,private cookieService:CookieService) { }
  loginUserData={
    email:"",
    password:""
  }
  ngOnInit(): void {
  }
  login(){
    console.log(this.loginUserData)
    this._auth.loginUser(this.loginUserData).subscribe(
      res=>{localStorage.clear();localStorage.setItem('token',res.token);this.router.navigate(['/']);},
      err=>console.log(err.error)
    )
  }

}
