import { Component, Inject, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy, QueryList, ViewChildren } from '@angular/core';
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
import { FormsModule, NgForm } from '@angular/forms';
import { AddressBookComponent } from '../address-book/address-book.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MailsService } from '../../../services/mail.service';
import { ChangeDetectorRef } from '@angular/core';


interface User {
  id: number;
  name: string;
}

interface TransferRow {
  selectedUserId: number;
  purposeId: number;
  priorityId: number;
  dueDate: string;
  instruction: string;
  isPrivate: boolean;
  isCCed: boolean;
  isFollowUp: boolean;
}

@Component({
  selector: 'app-transfer-modal',
  imports: [
    CommonModule, MatDialogModule, NgSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule, FormsModule],
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
  showAddressBook: boolean = false;
  selectedUserId: any;
  maxUsers = 50;

  @ViewChildren('rowForm') rowForms: QueryList<NgForm> | null = null;

  selectedPurposeId: any;
  selectedDueDate: any;
  selectedPriorityId: any;
  isCCed: any;
  isPrivate: any;
  isFollowUp: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService,
    private router: Router, private lookupsService: LookupsService, private dialog: MatDialog, private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<TransferModalComponent>, private mailService: MailsService) { }

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
        this.users = users || [];
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );

    this.lookupsService.getPriorities(this.accessToken!).subscribe(
      (reponse) => {
        this.priorities = reponse || [];
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

    //this.showAddressBook = !this.showAddressBook;
    const dialog = this.dialog.open(AddressBookComponent, {
      width: '80%',

      data: { /* pass any required data here */ }
    });

    dialog.afterClosed().subscribe((result: User[]) => {
      if (result) {
        console.log('Address Book result:', result);

        this.selectedUsers = result.map((user: User) => ({
          ...user,
          selectedUserId: user.id
        }));
        this.cdr.detectChanges();
      } else {
        console.log('Address Book dialog was closed without submitting');
      }
    });
  }

  //onUsersSelected(selectedUsers: any[]): void {

  //  console.log('selected users from AddressBookComponent:', selectedUsers);
  //  this.selectedUsers = selectedUsers;
  //  // You can now handle the selected users here
  //}

  onClose(): void {
    this.dialogRef.close();
  }

  removeRow(index: number) {
    this.selectedUsers.splice(index, 1);
  }


  collectRowData(): TransferRow[] {
    const rowsData: TransferRow[] = [];

    const firstRow: TransferRow = {
      selectedUserId: this.selectedUserId,
      purposeId: this.selectedPurposeId,
      priorityId: this.selectedPriorityId,
      dueDate: this.selectedDueDate,
      instruction: this.txtInstruction,
      isPrivate: this.isPrivate,
      isCCed: this.isCCed,
      isFollowUp: this.isFollowUp,
    };
    rowsData.push(firstRow);

    // Collect data from dynamically added rows
    this.selectedUsers.forEach((row) => {
      rowsData.push(row);
    });

    return rowsData;
  }


  Transfer(): void {

    const model: any = [];
    const rowData = this.collectRowData();
    this.mailService.transferMail(this.accessToken!, model).subscribe(
      (result) => {
        //
      },
      (error) => {
        console.error('Error sending mail:', error);
      }
    );
  }
}
