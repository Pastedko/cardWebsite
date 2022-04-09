import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { GameComponent } from './game/game.component';
import { IsNotLoggedGuard } from './guards/is-not-logged.guard';
import { HomeComponent } from './home/home.component';
import { LobbyComponent } from './lobby/lobby.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  {path:"register",component:RegisterComponent,canActivate:[IsNotLoggedGuard]},
  {path:"",component:HomeComponent},
  {path:"login",component:LoginComponent,canActivate:[IsNotLoggedGuard]},
  {path:"create",component:CreateComponent},
  {path:"lobby/:id",component:LobbyComponent},
  {path:"game",component:GameComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
