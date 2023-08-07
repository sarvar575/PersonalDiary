import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//import { AngularFireModule } from '@angular/fire/compat';
//import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
//import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import {DiaryListComponent} from "./diary-list/diary-list.component";
import {DiaryEntryComponent} from "./diary-entry/diary-entry.component";
import {FormsModule} from "@angular/forms";
import {AppRoutingModule} from "./app-routing.module";
import { EditorComponent } from './editor-component/editor-component.component';
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './Registration/registration.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import {DiaryFirebaseService} from "./diary-firebase.service";
import {Auth, getAuth, provideAuth} from "@angular/fire/auth";

@NgModule({
  declarations: [
    AppComponent,
    DiaryListComponent,
    DiaryEntryComponent,
    EditorComponent,
    LoginComponent,
    RegistrationComponent,
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideAuth(() => getAuth()),
    InfiniteScrollModule
  ],
  providers: [DiaryFirebaseService],
  bootstrap: [AppComponent]
})
export class AppModule { }
