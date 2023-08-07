import {Component, OnInit} from '@angular/core';
import {DiaryFirebaseService} from "../diary-firebase.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  constructor(public diaryFirebaseService: DiaryFirebaseService) {
  }
  ngOnInit(): void {}


}
