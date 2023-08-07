import { TestBed } from '@angular/core/testing';

import { DiaryFirebaseService } from './diary-firebase.service';

describe('DiaryFirebaseService', () => {
  let service: DiaryFirebaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiaryFirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
