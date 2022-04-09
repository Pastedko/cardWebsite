import { Component } from '@angular/core';
import { PasswordForLobbyComponent } from './password-for-lobby/password-for-lobby.component';
import { AuthService } from './services/auth.service';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'website';

  constructor(public _authService:AuthService){}

}
