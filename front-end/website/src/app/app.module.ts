import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import {CookieService} from 'ngx-cookie-service';
import { AuthGuard } from './guards/auth.guard';
import { IsNotLoggedGuard } from './guards/is-not-logged.guard';
import { TokenInterceptorService } from './services/token-interceptor.service';
import { CreateComponent } from './create/create.component';
import { UserService } from './services/user.service';
import { LobbyComponent } from './lobby/lobby.component';
import { SocketIoModule,SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
import { SocketService } from './services/socket.service';
import { PasswordForLobbyComponent } from './password-for-lobby/password-for-lobby.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameComponent } from './game/game.component';
import { GameService } from './services/game.service';
import { GameSocketService } from './services/game-socket.service';
import { CallsPopupComponent } from './calls-popup/calls-popup.component';
import {MatListModule} from '@angular/material/list';

const config:SocketIoConfig={
  url:environment.socketUrl,
  options:{
    transports:['websocket']
  }
}
@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    HomeComponent,
    LoginComponent,
    CreateComponent,
    LobbyComponent,
    PasswordForLobbyComponent,
    GameComponent,
    CallsPopupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    SocketIoModule.forRoot(config),
    MatDialogModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatListModule,
  ],
  providers: [AuthService,AuthGuard,IsNotLoggedGuard,UserService,SocketService,GameService,GameSocketService,
  {
    provide:HTTP_INTERCEPTORS,
    useClass:TokenInterceptorService,
    multi:true
  }],
  bootstrap: [AppComponent]
})
export class AppModule {}
