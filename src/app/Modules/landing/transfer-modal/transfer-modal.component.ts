import { Component, Inject, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { LookupsService } from '../../../services/lookups.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';  
import { AddressBookComponent } from '../address-book/address-book.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-transfer-modal',
  imports: [
    CommonModule, MatDialogModule, NgSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule, FormsModule, AddressBookComponent ],
  templateUrl: './transfer-modal.component.html',
  styleUrl: './transfer-modal.component.scss'
})
export class TransferModalComponent implements OnInit {

  accessToken: string | null = null;
  priorities: any[] = [];
  purposes: any[] = [];
  users: any[] = [];
  notes: any;
  regmodel: NgbDateStruct | undefined;
  fromModal: NgbDateStruct | undefined;
  tomodel: NgbDateStruct | undefined;
  txtInstruction: any;
  selectedUsers: any[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService,
    private router: Router, private lookupsService: LookupsService, private dialog: MatDialog) { }

  ngOnInit(): void {
    //    console.log('Dialog opened with ID:', this.data.id, 'and Reference Number:', this.data.referenceNumber);
    this.accessToken = this.authService.getToken();
    if (!this.accessToken) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadLookupData();
  }


  loadLookupData(): void {
    this.lookupsService.getStructuredUsers(this.accessToken!).subscribe(
      (users) => {
        this.users = users||[];
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );

    this.lookupsService.getPriorities(this.accessToken!).subscribe(
      (reponse) => {
        this.priorities = reponse||[];
      },
      (error) => {
        console.error('Error loading priorities:', error);
      }
    );

    this.lookupsService.getPurposes(this.accessToken!).subscribe(
      (reponse) => {
        this.purposes = reponse || [];
      },
      (error) => {
        console.error('Error loading priorities:', error);
      }
    );
  }

  convertToNgbDateStruct(dateStr: string): NgbDateStruct | undefined {
    if (!dateStr) return undefined;
    const [day, month, year] = dateStr.split('/');
    return { year: +year, month: +month, day: +day };
  }

  formatDate(date: NgbDateStruct | undefined): string {
    if (!date) return '';
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    const year = date.year.toString();
    return `${year}/${month}/${day}`;
  }

  showAddress() {
    const dialog =   this.dialog.open(AddressBookComponent, {
      width: '90%',
      maxWidth: '1200px',
        data: { /* pass any required data here */ }
  });

    dialog.afterClosed().subscribe(result => {
    console.log('Address modal closed', result);
    });
  }

  onUsersSelected(selectedUsers: any[]): void {

    console.log('selected users from AddressBookComponent:', selectedUsers);
    this.selectedUsers = selectedUsers;
    // You can now handle the selected users here
  }

  Transfer(): void {

  }
}
