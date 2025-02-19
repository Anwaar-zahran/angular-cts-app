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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LookupsService } from '../../../services/lookups.service';
import { MailsService } from '../../../services/mail.service';
import { ToasterService } from '../../../services/toaster.service';
import { AuthService } from '../../auth/auth.service';
import { ToasterComponent } from '../../shared/toaster/toaster.component';
import { AddressBookComponent } from '../address-book/address-book.component';

interface User {
  id: number;
  name: string;
}

interface StructureUsers {
  structureName: string,
  userName: string
}
interface TransferRow {

  purposeId: number | null; // Allow null
  priorityId: number | null;
  dueDate: string | null;
  instruction: string;
  isPrivate: boolean;
  cced: boolean;
  followUp: boolean;
  toStructureId: number | null;
  toUserId: number | null;
  name: string | null;
  PrivateInstruction: boolean;
  FromStructureId: boolean;
  ParentTransferId: number | null;
  IsStructure: true,
  DocumentId: number | null;
  DocumentPrivacyId: number | null;
  showValidationError?: boolean;
  selectedToUsers?: StructureUsers[];
}

@Component({
  selector: 'app-transfer-modal',
  imports: [
    CommonModule, MatDialogModule, NgSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule, FormsModule, ToasterComponent, TranslateModule, AddressBookComponent],
  templateUrl: './transfer-modal.component.html',
  styleUrl: './transfer-modal.component.scss'
})
export class TransferModalComponent implements OnInit {
  receivedData: any; // This will hold the received data
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
  documentId: any;
  documentPrivacyId: any;
  fromStructureId: any;
  selectedToUsers: StructureUsers[] = []
  parentTransferId: any;
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService, private toaster: ToasterService,
    private router: Router, private lookupsService: LookupsService, private dialog: MatDialog, private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<TransferModalComponent>, private mailService: MailsService, private translate: TranslateService) {
    this.receivedData = data; // ✅ Initialize here to ensure it's available everywhere
    this.documentId = this.data.documentId;
    this.documentPrivacyId = this.data.row.privacyId;
    this.parentTransferId = this.data.row.parentTransferId;
    this.fromStructureId = this.data.row.toStructureId;
  }

  ngOnInit(): void {
    //    console.log('Dialog opened with ID:', this.data.id, 'and Reference Number:', this.data.referenceNumber);

    this.accessToken = this.authService.getToken();
    //if (!this.accessToken) {
    //  this.router.navigate(['/login']);
    //  return;
    //}
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

  transformDataTemp(data: Array<{
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
  transformData(data: Array<{
    id: number;
    name: string;
    userStructure?: Array<{
      user?: {
        id: number;
        firstname?: string;
        lastname?: string;
        structureId?: number; // Include structureId
      }
    }>
  }>): Array<{ id: number, name: string, isStructure: boolean, structureId?: number | undefined }> {

    let result: Array<{ id: number, name: string, isStructure: boolean, structureId?: number }> = [];

    data.forEach((structure) => {
      if (structure.name) {
        // Push the structure itself (isStructure: true, no structureId)
        result.push({ id: structure.id, name: structure.name, isStructure: true });

        structure.userStructure?.forEach((userStruct) => {
          if (userStruct?.user?.firstname && userStruct?.user?.lastname) {
            ;
            result.push({
              id: userStruct.user.id,
              name: `${structure.name} / ${userStruct.user.firstname} ${userStruct.user.lastname}`,
              isStructure: false,
              structureId: structure.id ?? undefined, // Use undefined instead of null
            });
          }
        });
      }
    });

    return result;
  }

  //Add a new row when user changes selection

  loadUserStructures(): void {
    this.lookupsService.getStructuredUsers(this.accessToken!).subscribe(
      (users) => {

        var data = users || [];
        this.users = this.transformData(data);

      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );


    this.lookupsService.getPrioritiesWithDays(this.accessToken!).subscribe(
      (reponse) => {

        this.priorities = reponse || [];
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
        this.purposes = [...(reponse || [])].sort((a, b) => a.name.localeCompare(b.name));

      },
      (error) => {
        console.error('Error loading priorities:', error);
      }
    );
  }
  updateDueDate(index: number) {//: Date
    let selectedRow = this.rows[index]; // Assuming 'rows' is your data array
    let selectedPriority = this.priorities.find(p => p.id === selectedRow.selectedPriorityId);
    if (selectedPriority && selectedPriority.numberOfDueDays !== undefined) {
      let daysToAdd = selectedPriority.numberOfDueDays; // Get dynamic days
      let currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + (daysToAdd - 1)); // Add dynamic days
      this.rows = this.rows.map((row, i) =>
        i === index ? { ...row, selectedDueDate: currentDate } : row
      );

    } else {
      console.error("Priority not found or daysToAdd is undefined");
    }

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
      console.log('selected userssssssssssssss')
        console.log(this.selectedUsers)
        this.selectedUsers.forEach((user, index) => {
          if (Array.isArray(user.userStructure)){
            user.userStructure.forEach((u: any )=> {

              let userName = u.user.firstname+ ' '+ u.user.lastname;
              this.selectedToUsers.push({structureName: user.name,userName: userName})

            });
          }
        });
debugger
        console.log('handle the rows')
        if (this.rows.length > 0) {
          this.rows[0] = {
            ...this.rows[0],
            selectedToUsers: [...this.selectedToUsers]
          };
        }
        console.log('loopin in html on this list')
        console.log(this.selectedToUsers)
        this.cdr.detectChanges();
      } else {
        console.log('Address Book dialog was closed without submitting');
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

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
      selectedDueDate: null as Date | null,
      txtInstruction: '',
      isPrivate: false,
      isCCed: false,
      isFollowUp: false,
      isStructure: false, // Default value
      selectedUser: null as { id: number, name: string, structureId: number, isStructure: boolean } | null,
      showValidationError: false,
      selectedToUsers: [] as StructureUsers[] 
    };
  }
  onUserOrPurposeChange(index: number) {
    // Add a new row when user is selected, only if it's the last row
    debugger
    if (this.rows[index].selectedPurposeId == 10) {
      this.rows = this.rows.map((row, i) =>
        i === index ? { ...row, isCCed: true } : row
      );
    }
    if (index === this.rows.length - 1) {
      this.rows.push(this.createEmptyRow());
    }
  }


  Transfer(): void {
    // Validate required fields for each row efficiently
    const rowsToValidate = this.rows.length > 1 ? this.rows.slice(0, -1) : this.rows;
    const isValid = rowsToValidate.every((row) => {
      const isRowValid = row.selectedUser && row.selectedPurposeId && row.selectedPriorityId;
      row.showValidationError = !isRowValid; // Mark row as invalid if required fields are missing
      return isRowValid;
    });

    if (!isValid) {
      this.toaster.showToaster("Please fill all required fields before transferring.");
      return;
    }

    const rowData = this.collectRowData();

    this.mailService.transferMail(this.accessToken!, rowData).subscribe(
      (result) => {
        if (result.length > 0) {
          const message = result[0].updated ? "Sent successfully" : result[0].message;
          this.toaster.showToaster(message);
          this.onClose();
        }
      },
      (error) => {
        this.toaster.showToaster(error.error.text ?? "Something went wrong");
      }
    );
  }

  collectRowData(): TransferRow[] {
    const formattedDate = (date: Date | null) => date ? date.toLocaleDateString('en-GB') : null;

    return this.rows.slice(0, -1).map(({
      selectedUser, selectedPurposeId, selectedPriorityId, selectedDueDate,
      txtInstruction, isPrivate, isCCed, isFollowUp , selectedToUsers
    }) => {
      const isStructure = selectedUser?.isStructure ?? false;
      const userId = selectedUser?.id ?? null;

      return {
        purposeId: selectedPurposeId ?? null,
        priorityId: selectedPriorityId ?? null,
        dueDate: formattedDate(selectedDueDate),
        instruction: txtInstruction ?? '',
        isPrivate: isPrivate ?? false,
        cced: isCCed ?? false,
        followUp: isFollowUp ?? false,
        toStructureId: isStructure ? userId : selectedUser?.structureId,
        toUserId: !isStructure ? userId : null,
        name: selectedUser?.name || '',
        PrivateInstruction: false,
        FromStructureId: this.fromStructureId ?? false,
        ParentTransferId: this.parentTransferId ?? null,
        IsStructure: isStructure,
        DocumentId: this.documentId ?? null,
        DocumentPrivacyId: this.documentPrivacyId ?? null
      } as TransferRow;
    });
  }

}
