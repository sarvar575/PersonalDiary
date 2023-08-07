import {Component, OnInit} from '@angular/core';
import {DiaryFirebaseService} from "../diary-firebase.service";


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit{
  constructor(public diaryFirebaseService: DiaryFirebaseService) {
  }
  ngOnInit(): void {}


}
