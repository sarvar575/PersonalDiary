import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiaryListComponent } from './diary-list/diary-list.component';
import {DiaryEntryComponent} from "./diary-entry/diary-entry.component";
import {EditorComponent} from "./editor-component/editor-component.component";
import {LoginComponent} from "./login/login.component";
import {RegistrationComponent} from "./Registration/registration.component";
import {DashboardComponent} from "./dashboard/dashboard.component";

const routes: Routes = [

  { path: 'entries', component: DiaryListComponent },
  { path: 'new-editor', component: EditorComponent },
  { path: 'edit-editor/:id', component: EditorComponent },
  { path: 'entry/:id', component: DiaryEntryComponent },
  { path: 'sign-in', component: LoginComponent },
  { path: 'sign-up', component: RegistrationComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full'},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
