import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface'
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, limit, query, where, onSnapshot } from '@angular/fire/firestore';


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
    this.unsubscribeNotes = this.subNotesList();

    this.unsubscribeTrash = this.subTrashList();
  }

  ngOnDestroy(): void {
    this.subNotesList();
    this.subTrashList();
  }

  /**
   * Returns the appropriate Firebase reference based on the given type.
   * @param type - The type of reference to select. Can be "trash" or any other value.
   * @returns The Firebase reference based on the given type.
   */
  selectRef(type: string) {
    return type === "trash" ? this.getTrashRef() : this.getNotesRef();
  }

  /**
   * Retrieves a reference to the 'trash' collection in Firestore.
   *
   * @returns A reference to the 'trash' collection.
   */
  getTrashRef() {
    return collection(this.firestore, 'trash');

  }

  /**
   * Returns a reference to the 'notes' collection in Firestore.
   * @returns {CollectionReference<DocumentData>} A reference to the 'notes' collection.
   */
  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  /**
   * Retrieves a reference to a single document in a collection.
   *
   * @param colId - The ID of the collection.
   * @param docId - The ID of the document.
   * @returns A reference to the specified document.
   */
  getSingelDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  /**
   * Creates a Note object based on the provided parameters.
   * @param obj - The object containing the properties of the Note.
   * @param id - The ID of the Note.
   * @returns The created Note object.
   */
  setNoteObject(obj: any, id: string): Note {
    return {
      id: id || "",
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false
    }
  }

  /**
   * Subscribes to the notes list and updates the `normalNotes` array whenever there is a change in the data.
   * @returns A function that can be used to unsubscribe from the notes list.
   */
  subNotesList() {
    const q = query(this.getNotesRef(), where("type", "==", "note"), limit(20));
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach((note) => {
        this.normalNotes.push(this.setNoteObject(note.data(), note.id));
      })
    });
  }

  /**
   * Subscribes to the trash list and updates the `trashNotes` array with the retrieved data.
   * @returns A function that can be used to unsubscribe from the snapshot listener.
   */
  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach((trash) => {
        this.trashNotes.push(this.setNoteObject(trash.data(), trash.id));
      });
    });
  }

  /**
   * Adds a note to Firestore.
   * @param note - The note to be added.
   */
  async addNoteToFirestore(note: Note, colId: string = "notes" || "trash") {
    try {
      await addDoc(this.selectRef(colId), note);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  }

  /**
   * Updates a note in Firestore.
   *
   * @param note - The note object to be updated.
   */
  async updateNoteInFirestore(note: Note) {
    if (note.id) {
      try {
        let docRef = this.getSingelDocRef(this.getColIdFromNote(note), note.id);
        await updateDoc(docRef, this.getCleanNotJson(note));
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  }

  /**
   * Returns a clean object representation of the given note, excluding any JSON properties.
   * @param note - The note object to be cleaned.
   * @returns A clean object representation of the note.
   */
  getCleanNotJson(note: Note) {
    return {
      title: note.title,
      content: note.content,
      marked: note.marked,
      type: note.type
    }
  }

  /**
   * Returns the collection ID based on the note type.
   * If the note type is "trash", returns "trash" collection ID.
   * Otherwise, returns "notes" collection ID.
   *
   * @param note - The note object.
   * @returns The collection ID.
   */
  getColIdFromNote(note: Note): string {
    return note.type === "trash" ? "trash" : "notes";
  }

  /**
   * Deletes a note from Firestore.
   *
   * @param colID - The collection ID where the note is stored. It can be either "notes" or "trash".
   * @param docId - The ID of the document to be deleted.
   */
  async deleteNoteFromFirestore(colID: "notes" | "trash", docId: string) {
    try {
      await deleteDoc(this.getSingelDocRef(colID, docId));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  }

}
