import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  private toasterSubject = new Subject<{ message: string, className: string }>();
  toasterMessage$ = this.toasterSubject.asObservable();

  constructor() { }

  showToaster(message: string, className: string = ''): void {
    this.toasterSubject.next({ message, className });
  }
}
