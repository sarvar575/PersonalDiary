import {Component, OnInit} from '@angular/core';
import {DiaryFirebaseService} from "../diary-firebase.service";


@Component({
  selector: 'app-Registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  constructor(public diaryFirebaseService: DiaryFirebaseService) { }

  ngOnInit(): void {}
}
