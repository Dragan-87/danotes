import { Component } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { NoteListService } from '../firebase-services/note-list.service'
import { query } from '@angular/animations';
import { where } from '@angular/fire/firestore';

@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss']
})
export class NoteListComponent {
  noteList: Note[] = [];
  favFilter: "all" | "fav" = "all";
  status: "notes" | "trash" = "notes";

  constructor(private noteService: NoteListService) {
  }

  getNormalNotes(): Note[] {
    return this.noteService.normalNotes;
  }

  getTrashNotes(): Note[] {
    return this.noteService.trashNotes;
  }


  changeFavFilter(filter: "all" | "fav") {
    this.favFilter = filter;
  }

  getNotes() {
    return this.status == "notes" ? this.getNormalNotes() : this.getTrashNotes();
  }

  changeTrashStatus() {
    if (this.status == "trash") {
      this.status = "notes";
    } else {
      this.status = "trash";
      this.favFilter = "all";
    }
  }

  subNotesList() {

  }

}
