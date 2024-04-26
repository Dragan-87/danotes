import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface'
import { Firestore, collection, doc, collectionData } from '@angular/fire/firestore';
import { onSnapshot } from '@firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class NoteListService {
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  unsubscribeNotes;
  unsubscribeTrash;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubscribeNotes = onSnapshot(this.getNotesRef(), (list) => {
      list.forEach((note) => {
        this.normalNotes.push(this.setNoteObject(note.data(), note.id));
      })
    });

    this.unsubscribeTrash = onSnapshot(this.getTrashRef(), (list) => {
      list.forEach((trash) => {
        this.trashNotes.push(this.setNoteObject(trash.data(), trash.id));
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeNotes();
    this.unsubscribeTrash();
  }



  logout() {
    console.log(this.firestore);
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');

  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getSingelDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id || "",
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false
    }
  }
}
