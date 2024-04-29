import { Component, Output, EventEmitter } from '@angular/core';
import { NoteListService } from '../firebase-services/note-list.service'

@Component({
  selector: 'app-add-note-dialog',
  templateUrl: './add-note-dialog.component.html',
  styleUrls: ['./add-note-dialog.component.scss']
})
export class AddNoteDialogComponent {
  @Output() addDialogClosed: EventEmitter<boolean> = new EventEmitter();
  title = "";
  description = "";

  constructor(private noteService: NoteListService){}

  closeDialog() {
    this.title = "";
    this.description = "";
    this.addDialogClosed.emit(false);
  }

  /**
   * Adds a note to the Firestore database.
   */
  addNote() {
    this.noteService.addNoteToFirestore({
      title: this.title,
      content: this.description,
      marked: false,
      type: "note"
    })
    this.closeDialog();
  }
}
