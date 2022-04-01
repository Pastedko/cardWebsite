import { ApplicationInitStatus, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _registerUrl="http://localhost:3000/register";
  private _loginUrl="http://localhost:3000/login"
  constructor(private http:HttpClient) { }
  registerUser(user:object){
    console.log(user)
    return this.http.post<any>(this._registerUrl,user,{
      headers:new HttpHeaders({
        'Content-Type':'application/json',
        "charset":"utf-8"
      })
    })
  }
  loginUser(user:object){
    console.log(user)
    return this.http.post<any>(this._loginUrl,user,{
      headers:new HttpHeaders({
        'Content-Type':'application/json',
        "charset":"utf-8"
      })
    })
  }
}
