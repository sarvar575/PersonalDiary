import {Component, ViewChild, ElementRef, AfterViewInit, inject, OnInit} from '@angular/core';
import EditorJS, {OutputData} from '@editorjs/editorjs';
import {DiaryFirebaseService} from "../diary-firebase.service";
import {getDownloadURL, ref, Storage, uploadBytesResumable} from "@angular/fire/storage";
import {finalize, take} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {DiaryEntry} from "../diary-entry/diary-entry.model";


const Paragraph = require('@editorjs/paragraph');
const ImageTool = require('@editorjs/image');
const Underline = require( '@editorjs/underline');
@Component({
  selector: 'app-editor-component',
  templateUrl: './editor-component.component.html',
  styleUrls: ['./editor-component.component.scss']
})
export class EditorComponent implements OnInit{
  diaryEntry: DiaryEntry = {
    id:'',
    text: '',
    uid:'',
    date: new Date(),

  };
  editor: EditorJS;
  private storage: Storage = inject(Storage);
  selectedImageEditor: File | null = null;
  constructor(private diaryService: DiaryFirebaseService, private router: Router, private route: ActivatedRoute) {
    this.editor = new EditorJS({
      holder: 'editorjs',
      tools: {
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        underline: Underline,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (file: File) => {
                // Вызываем метод для загрузки изображения в Firebase Storage
                const imageUrl = await this.uploadImage(file);
                if (imageUrl) {
                  return {success: 1, file: {url: imageUrl}};
                } else {
                  return {success: 0, file: null};
                }
              }
            }
          },
        }
      },
      autofocus: true
    });

  }
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.diaryService.getEntryById(id).pipe(take(1)).subscribe((entry) => {
        this.diaryEntry = entry;
        //код проверки готовности редактора после его создания
        this.editor.isReady
          .then(() => {
            console.log('Editor.js is ready to work!');
            this.loadEntry(entry);
          })
          .catch((reason) => {
            console.log(`Editor.js initialization failed because of ${reason}`);
          });
      });
    }
  }
  async uploadImage(file: File): Promise<string | null> {
    try {
      // Указываем путь для сохранения изображения в Firebase Storage
      const storagePath = `${file.name}`;
      const storageRef = ref(this.storage, storagePath);

      // Загружаем изображение в Firebase Storage
      const task = await uploadBytesResumable(storageRef, file);

      // Получаем публичный URL загруженного изображения
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      return null;
    }
  }
  // Функция загрузки данных записи в редактор для редактирования
  loadEntry(entry: DiaryEntry) {
    if (!this.editor) {
      console.error('EditorJS instance is not created.');
      return;
    }
    // Получаем текст записи и изображение, если есть
    const blocks: ({ type: 'paragraph', data: { text: string } } | { type: 'image', data: { file: { url: string }, caption:string,withBorder:string, withBackground:string,stretched:string } })[] = [];
    if (entry.text && !entry.imageUrl) {
      const text = entry.text.split('<br>')
      text.forEach(br_text=>{
        // Проверяем, что текст абзаца не пустой, прежде чем добавить его в массив
        if (br_text.trim() !== '') {
          blocks.push({ type: 'paragraph', data: { text: br_text } });
        }
      })
    } else if (entry.text && entry.imageUrl) {
      const text = entry.text.split('<br>')
      const imageUrls = entry.imageUrl.split(' ')
      text.forEach(br_text=>{
        // Проверяем, что текст абзаца не пустой, прежде чем добавить его в массив
        if (br_text.trim() !== '') {
          let urlimg:string[]=[]
          let dataimg:string[]=[]
          let matchedImageUrl:string | undefined
          if (br_text.startsWith(' https://firebasestorage.googleapis.com') || br_text.startsWith('https://firebasestorage.googleapis.com')) {
            urlimg = br_text.split(' <data>')
            dataimg = urlimg[1].split('<data>')
            matchedImageUrl = imageUrls.find((url) => urlimg[0].trim() === url);
          }

          if (matchedImageUrl) {
            blocks.push({type: 'image', data: {file: {url: matchedImageUrl}, caption: dataimg[0], withBorder: dataimg[1], withBackground: dataimg[2], stretched: dataimg[3]} });
          } else {
            blocks.push({type: 'paragraph', data: {text: br_text}});
          }
        }
      })
    }

    // Восстанавливаем редактор с загруженными данными записи
    this.editor.render({ blocks }).then(() => {
      // Editor has finished rendering
      console.log('Editor is rendered.');
    }).catch((error) => {
      // Handle any errors that occurred during rendering
      console.error('Error rendering editor:', error);
    });
  }
  // Метод для сохранения контента редактора
  async onSave() {
    try {
      const savedData: OutputData = await this.editor.save();

      // Парсинг сохраненных данных для формирования объекта записи
      let entryText = ''
      const images = savedData.blocks.filter(block => block.type === 'image').map(block => block.data.file.url)
      const imageUrl = images ? images.join(' ') : null;
      for (let i = 0; i < savedData.blocks.length; i++) {
        const block = savedData.blocks[i];
        if (block.type === 'image') {
          entryText += block.data.file.url + ` <data>${block.data.caption}<data>${block.data.withBorder}<data>${block.data.withBackground}<data>${block.data.stretched}`;
        } else {
          entryText += block.data.text;
        }

        // Проверяем, является ли текущий блок последним
        if (i < savedData.blocks.length - 1) {
          entryText += ' <br> ';
        }
      }
      if (this.diaryService.isLoggedIn) {
        // Вызов метода добавления записи в Firebase, включая изображение (если есть)
        if (!this.diaryEntry.id) {
          if (imageUrl) {
            await this.diaryService.addEntryEditor({id: '', text: entryText, uid: this.diaryService.UserData.uid, date: new Date(), imageUrl: imageUrl});
          } else {
            await this.diaryService.addEntryEditor({id: '', text: entryText, uid: this.diaryService.UserData.uid, date: new Date()});
          }
        } else {
          if (imageUrl) {
            const {id, ...entryData} = {id: this.diaryEntry.id, text: entryText, uid: this.diaryService.UserData.uid, date: new Date(), imageUrl: imageUrl};
            await this.diaryService.updateEntry(id, entryData);
          } else {
            // Если изображение не выбрано, обновить запись без него
            const {id, ...entryData} = {id: this.diaryEntry.id, text: entryText, uid: this.diaryService.UserData.uid, date: new Date()};
            await this.diaryService.updateEntry(id, entryData);
          }
        }
      }

      console.log('Запись успешно добавлена в Firebase.');
      await this.router.navigateByUrl('/entries');
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
    }
  }


}
