import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Student } from '../../shared/models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  constructor(private firestore: Firestore) {}

  getParentStudents(parentId: string): Observable<Student[]> {
    const q = query(collection(this.firestore, 'students'), where('parentId', '==', parentId));
    return collectionData(q, { idField: 'id' }) as Observable<Student[]>;
  }
}
