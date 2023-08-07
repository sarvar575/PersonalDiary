import { Component, OnInit } from '@angular/core';
import { DiaryFirebaseService } from '../diary-firebase.service';
import { DiaryEntry } from '../diary-entry/diary-entry.model';
import {Router} from "@angular/router";
import {onAuthStateChanged} from "@angular/fire/auth";
@Component({
  selector: 'app-diary-list',
  templateUrl: './diary-list.component.html',
  styleUrls: ['./diary-list.component.scss']
})
export class DiaryListComponent implements OnInit {
  diaryEntries: DiaryEntry[] = [];
  nextEntries: DiaryEntry[] = [];
  batchSize = 10; // Количество записей, загружаемых за один раз
  allLoaded = false; // Флаг для определения, загружены ли все записи
  lastEntry: any; // Последняя загруженная запись для пагинации
  loading = false; // Флаг для отслеживания состояния загрузки следующих записей
  checkEntries = true; //проверка наличия записей


  constructor(private diaryService: DiaryFirebaseService, private router: Router) {
  }



  ngOnInit() {
    //если пользователь авторизовался, то загружаем записи, иначе перенаправляем на страницу авторизации
    if (this.diaryService.isLoggedIn) {
      this.getDiaryEntries();
    } else {
      this.router.navigate(['/sign-in']);
    }
  }
//Вывод записей
  getDiaryEntries() {
    this.diaryService.checkEntries().then((result) => {
      if (result) {
        this.diaryService.getNextEntries(this.lastEntry, this.batchSize).subscribe(entries => {
                 this.diaryEntries = entries;
                this.lastEntry = entries[entries.length - 1].date
               });
      } else {
        this.checkEntries = false
      }
    }).catch((error) => {
      console.error('Error getDiaryEntries:', error);
    });
  }
// Загрузка следующего пакета записей, начиная с последней загруженной записи
  loadNextEntries() {
    if (this.loading || this.allLoaded) {
      return;
    }
    this.loading = true;
    setTimeout(() => {
      this.diaryService.checkEntries().then((result) => {
        if (result) {

        this.diaryService.getNextEntries(this.lastEntry, this.batchSize).subscribe(nextEntries => {
          this.nextEntries = nextEntries;
          this.diaryEntries = this.diaryEntries.concat(nextEntries);
          this.allLoaded = nextEntries.length < this.batchSize;
          if (!this.allLoaded) {
            this.lastEntry = nextEntries[nextEntries.length - 1].date;
          }
          this.loading = false;
        });
        } else {
          this.checkEntries = false
        }
      }).catch((error) => {
        console.error('Error loadNextEntries:', error);
      });
    }, 1000)
  }

  onScroll() {
    // Загружаем следующий пакет записей, когда прокрутка достигает нижней части страницы
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight && !this.allLoaded) {
      this.loadNextEntries();
    }
  }

  deleteEntry(entryId: string) {
    this.diaryService.deleteEntry(entryId);
  }
  // Метод для перехода на форму добавления/редактирования записи
  goToDiaryEntryForm(): void {
    this.router.navigate(['/new-editor']);
  }
  goToEntry(id:string): void {
    this.router.navigate(['/entry', id]);
  }

  // Метод для обрезки текста и игнорирования ссылок
  truncateText(text: string): string {
    const words = text.split(' ');
    const truncatedWords = [];
    let wordCount = 0;

    for (const word of words) {
      // Проверяем, является ли слово ссылкой (начинается с 'http://' или 'https://')
      if (!word.startsWith('https://firebasestorage.googleapis.com') && !word.startsWith('<data>')) {
        truncatedWords.push(word);
        wordCount++;

        if (wordCount === 150) {
          break;
        }
      }
    }

    return truncatedWords.join(' ') + '...';
  }
}
