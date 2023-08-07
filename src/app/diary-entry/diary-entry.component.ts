import { Component, OnInit } from '@angular/core';
import { DiaryFirebaseService } from '../diary-firebase.service';
import {ActivatedRoute, Router} from "@angular/router";
import {take} from "rxjs/operators";
import EditorJS from "@editorjs/editorjs";
import {DiaryEntry} from "./diary-entry.model";

const Paragraph = require('@editorjs/paragraph');
const ImageTool = require('@editorjs/image');
const Underline = require( '@editorjs/underline');

@Component({
  selector: 'app-diary-entry',
  templateUrl: './diary-entry.component.html',
  styleUrls: ['./diary-entry.component.scss']
})

export class DiaryEntryComponent implements OnInit {
  diaryEntry: DiaryEntry = {
    id:'',
    text: '',
    uid: '',
    date: new Date(),

  };
  editor: EditorJS;
  constructor(private diaryService: DiaryFirebaseService, private router: Router, private route: ActivatedRoute) {
    this.editor = new EditorJS({
      holder: 'editorjs',
      tools: {
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        underline: Underline,
        image:ImageTool
      },
      readOnly:true
    });

  }

  // Функция загрузки данных записи
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
      console.log('Editor is rendered.');
    }).catch((error) => {
      // Ошибка рендеринга
      console.error('Error rendering editor:', error);
    });
  }


  ngOnInit(): void {
    if (this.diaryService.isLoggedIn) {
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
    } else {
      this.router.navigate(['/sign-in']);
    }
  }
}
