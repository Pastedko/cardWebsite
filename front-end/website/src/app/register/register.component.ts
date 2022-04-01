import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerUserData={
    "username":"",
    "email":"",
    "password":"",
    "passwordAgain":""
  };
  constructor(private _auth:AuthService,private router:Router) { }
  register(){
    console.log(this.registerUserData)
    this._auth.registerUser(this.registerUserData).subscribe(
      res=>this.router.navigate(['/']),
      err=>console.log(err)
    )
  }
  ngOnInit(): void {
  }

}
