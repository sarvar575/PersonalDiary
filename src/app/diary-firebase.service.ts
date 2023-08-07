import {inject, Injectable, NgZone} from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  Firestore, getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where
} from '@angular/fire/firestore';
import {Storage} from '@angular/fire/storage';
import {
  Auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from '@angular/fire/auth';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {DiaryEntry} from './diary-entry/diary-entry.model';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class DiaryFirebaseService {
  diaryEntries: Observable<DiaryEntry[]>;
  private storage: Storage = inject(Storage);
  firestore1: Firestore = inject(Firestore)
  auth: Auth = inject(Auth)
  UserData: any;

  constructor(private router : Router, public ngZone: NgZone) {
    const diaryCollection = query(collection(this.firestore1, 'DiaryEntry'), orderBy("date","desc"));
    // Используем pipe и map для преобразования типа данных
    this.diaryEntries = collectionData(diaryCollection).pipe(
      map((entries: any) => {
        return entries.map((entry: any) => {
          const { entryid } = entry;
          const data = entry as DiaryEntry;
          return { entryid, ...data };
        });
      })
    );


    onAuthStateChanged(this.auth,(user: any)=>{
      if(user){
        this.UserData = user;
        localStorage.setItem('user', JSON.stringify(this.UserData));
        JSON.parse(localStorage.getItem('user')!);
      } else {
        localStorage.setItem('user', 'null');
        JSON.parse(localStorage.getItem('user')!);
      }
    })
  }
  //Проверяем авторизацию пользователя
  get isLoggedIn(): boolean {
    const token = localStorage.getItem('user')
    const user = JSON.parse(token as string);
    return user !== null;
  }
  //Регистрация
  Register(email : string, password : string) {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then((result) => {
        this.UserData = result.user;
        this.ngZone.run(() => {
          this.router.navigate(['/']);
        });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  //Авторизация
  Login(email : string, password : string){
    return signInWithEmailAndPassword(this.auth, email, password)
      .then((result: any) => {
        this.UserData = result.user;
        this.ngZone.run(() => {
          this.router.navigate(['/']);
        });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  //Выход из аккаунта
  Logout() {
    signOut(this.auth).then(()=>this.router.navigate(['/sign-in']))
  }
 //Вывод записи по id
  getEntryById(id: string): Observable<DiaryEntry> {
    const entryRef = doc(this.firestore1, 'DiaryEntry', id);
    return docData(entryRef).pipe(
      map((entry) => {
        const data = entry as DiaryEntry;
        data.date = (data.date as any).toDate(); // Преобразование поля date из Timestamp в Date
        return data;
      })
    );
  }
  //Добавление записей
  async addEntryEditor(entry: DiaryEntry): Promise<void> {
    //const entryRef = doc(this.firestore1, 'DiaryEntry');
    const entryData = {
      text: entry.text,
      date: new Date(),
      uid: entry.uid,
      imageUrl: entry.imageUrl || null,
    };
    const diaryCollection = collection(this.firestore1, 'DiaryEntry');
    const docRef = await addDoc(collection(this.firestore1, 'DiaryEntry'), entryData);
    const UpdatedId = docRef.id;
    await updateDoc(doc(diaryCollection, docRef.id), {id: UpdatedId})
  }

  // Обновление записи без изображения
  updateEntry(id: string, data: Partial<DiaryEntry>): Promise<void> {
    const diaryCollection = collection(this.firestore1, 'DiaryEntry');
    const entryRef = doc(diaryCollection, id);
    return updateDoc(entryRef, data);
  }

  // Удаление записи
  deleteEntry(id: string): Promise<void> {
    const diaryCollection = collection(this.firestore1, 'DiaryEntry');
    const entryRef = doc(diaryCollection, id);
    return deleteDoc(entryRef);
  }
  //проверка наличия записей
  async checkEntries(){
    try {
      const diaryCollections = query(
        collection(this.firestore1, 'DiaryEntry'),
        where('uid', '==', `${this.UserData.uid}`)
      );
      const querySnapshot = await getDocs(diaryCollections);
      return querySnapshot.size > 0;
    } catch (error) {
      console.error('Error checking entries:', error);
      return false; // Вернуть false в случае ошибки
    }
  }
  //Получение записей
  getNextEntries(startAfters: any, limits: number): Observable<DiaryEntry[]> {
    let diaryCollections
    const collections = collection(this.firestore1, 'DiaryEntry')
    if (startAfters) {
      diaryCollections = query(collections, where('uid', '==', `${this.UserData.uid}`), orderBy("date", "desc"), startAfter(startAfters), limit(limits))
    } else {
      diaryCollections = query(collections, where('uid', '==', `${this.UserData.uid}`), orderBy("date", "desc"), limit(limits))
    }

    return collectionData(diaryCollections).pipe(
      map((entries: any) => {
        return entries.map((entry: any) => {
          const { entryid } = entry;
          const data = entry as DiaryEntry;
          return { entryid, ...data };
        });
      })
    );
  }
}
