import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private _auth:AuthService,private router:Router) { }
  loginUserData={
    email:"",
    password:""
  }
  ngOnInit(): void {
  }
  login(){
    console.log(this.loginUserData)
    this._auth.loginUser(this.loginUserData).subscribe(
      res=>this.router.navigate(['/']),
      err=>console.log(err)
    )
  }

}
