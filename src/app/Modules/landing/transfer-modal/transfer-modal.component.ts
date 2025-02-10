import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { LookupsService } from '../../../services/lookups.service';
import { MailsService } from '../../../services/mail.service';
import { AuthService } from '../../auth/auth.service';
import { AddressBookComponent } from '../address-book/address-book.component';


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
  rows = [
    this.createEmptyRow() // Initialize with one empty row
  ];
  @ViewChildren('picker') pickerRefs!: QueryList<MatDatepicker<any>>;

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
    this.loadUserStructures();
  }
  
  transformDataWithotSort(data: Array<{ name: string; userStructure?: Array<{ user?: { firstname?: string; lastname?: string } }> }>): string[] {
    let result: string[] = [];
  
    data.forEach((structure) => {
      if (structure.name) {
        result.push(structure.name);
  
        structure.userStructure?.forEach((userStruct) => {
          if (userStruct?.user?.firstname && userStruct?.user?.lastname) {
            result.push(`${structure.name}/${userStruct.user.firstname} ${userStruct.user.lastname}`);
          }
        });
      }
    });
  
    return result;
  }
  transformData(data: Array<{ 
    name: string; 
    userStructure?: Array<{ user?: { firstname?: string; lastname?: string } }> 
  }>): string[] {
    
    let result: string[] = [];
  
    data.forEach((structure) => {
      if (structure.name) {
        result.push(structure.name);
  
        structure.userStructure?.forEach((userStruct) => {
          if (userStruct?.user?.firstname && userStruct?.user?.lastname) {
            result.push(`${structure.name}/${userStruct.user.firstname} ${userStruct.user.lastname}`);
          }
        });
      }
    });
  
    // Sort the result in ascending alphabetical order
    return result.sort((a, b) => a.localeCompare(b));
  }
  
  //Add a new row when user changes selection
  onUserChange1(userId: number) {
    debugger
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.selectedUsers.push({
        selectedUserId: user.id,
        username: user.name,
        purposeId: null,
        priorityId: null,
        dueDate: null,
        instruction: '',
        isPrivate: false,
        isCCed: false,
        isFollowUp: false
      });
    }
  }

  loadUserStructures(): void {
    this.lookupsService.getStructuredUsers(this.accessToken!).subscribe(
      (users) => {
        debugger
       var data= users || [];
      this.users =this.transformData(data);

      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );

    
    this.lookupsService.getPriorities(this.accessToken!).subscribe(
      (reponse) => {
        debugger
        this.priorities = reponse || [];
       // this.priorities=[...(reponse || [])].sort((a, b) => a.text.localeCompare(b.text));
       const defaultPriorityId = this.priorities.length > 0 ? this.priorities[0].id : null;
        this.rows = this.rows.map(row => ({
          ...row,
          selectedPriorityId: row.selectedPriorityId || defaultPriorityId
        }));
      },
      (error) => {
        console.error('Error loading priorities:', error);
      }
    );

    this.lookupsService.getPurposes(this.accessToken!).subscribe(
      (reponse) => {
        debugger
        //this.purposes = reponse || [];
      //  this.purposes = reponse ? reponse.sort((a, b) => a.name.localeCompare(b.name)) : [];
        this.purposes = [...(reponse || [])].sort((a, b) => a.name.localeCompare(b.name));

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

  // removeRow(index: number) {
  //   this.selectedUsers.splice(index, 1);
  // }
  openDatepicker(index: number) {
    const pickersArray = this.pickerRefs.toArray();
    if (pickersArray[index]) {
      pickersArray[index].open();
    }
  }

  ngAfterViewInit() {
    // Ensures the ViewChildren data is available after initialization
  }
  removeRow(index: number) {
    if (this.rows.length > 1) {
      this.rows.splice(index, 1);
    }
  }
  createEmptyRow() {
    return {
      selectedUserId: null,
      selectedPurposeId: null,
      selectedPriorityId: this.priorities.length > 0 ? this.priorities[0].id : null,
      selectedDueDate: null,
      txtInstruction: '',
      isPrivate: false,
      isCCed: false,
      isFollowUp: false
    };
  }
  onUserOrPurposeChange(index: number) {
    debugger
    // Add a new row when user is selected, only if it's the last row
    if (index === this.rows.length - 1) {
      this.rows.push(this.createEmptyRow());
    }
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
