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
  // selectedUserId: number | null;
  purposeId: number | null; // Allow null
  priorityId: number | null;
  dueDate: string | null;
  instruction: string;
  isPrivate: boolean;
  cced: boolean;
  followUp: boolean;
  toStructureId:number|null;
  toUserId:number|null;
  name: string | null;
  PrivateInstruction: boolean;
  FromStructureId: boolean;
  ParentTransferId:number|null;
  IsStructure: true,
  DocumentId: number|null;
  DocumentPrivacyId:number|null;
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
  documentId:any;
  documentPrivacyId:any;
  fromStructureId:any;
  parentTransferId:any;
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
    private dialogRef: MatDialogRef<TransferModalComponent>, private mailService: MailsService) { 
      this.receivedData = data; // ✅ Initialize here to ensure it's available everywhere
      this.documentId=this.data.documentId;
      this.documentPrivacyId=this.data.row.privacyId;
      this.parentTransferId=this.data.row.parentTransferId;
      this.fromStructureId=this.data.row.toStructureId;
    }

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
}>) : Array<{ id: number, name: string, isStructure: boolean, structureId?: number | undefined }> {
    
    let result: Array<{ id: number, name: string, isStructure: boolean, structureId?: number }> = [];

    data.forEach((structure) => {
        if (structure.name) {
            // Push the structure itself (isStructure: true, no structureId)
            result.push({ id: structure.id, name: structure.name, isStructure: true });

            structure.userStructure?.forEach((userStruct) => {
                if (userStruct?.user?.firstname && userStruct?.user?.lastname) {
                     debugger;
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
        debugger
       var data= users || [];
      this.users =this.transformData(data);

      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );

    
    this.lookupsService.getPrioritiesWithDays(this.accessToken!).subscribe(
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
  updateDueDate(index: number) {//: Date
    debugger;
    let selectedRow = this.rows[index]; // Assuming 'rows' is your data array
    let selectedPriority = this.priorities.find(p => p.id === selectedRow.selectedPriorityId);
    if (selectedPriority && selectedPriority.numberOfDueDays !== undefined) {
      let daysToAdd = selectedPriority.numberOfDueDays; // Get dynamic days
      let currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + (daysToAdd-1)); // Add dynamic days
     // selectedRow.selectedDueDate = currentDate as Date | null;
      // Ensure only the selected row updates its date
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
      selectedDueDate: null as Date |null,
      txtInstruction: '',
      isPrivate: false,
      isCCed: false,
      isFollowUp: false,
      isStructure: false, // Default value
      selectedUser: null as { id: number, name: string,structureId:number, isStructure: boolean } | null,
    };
  }
  // onUserOrPurposeChange(index: number) {
  //   debugger
  //   // Add a new row when user is selected, only if it's the last row
  //   if (index === this.rows.length - 1) {
  //     this.rows.push(this.createEmptyRow());
  //   }
  // }
  onUserOrPurposeChange(index: number) {
    const selectedUserId = this.rows[index].selectedUserId;

    // Find the selected user in the users list
    const selectedUser = this.users.find(user => user.id === selectedUserId);

    if (selectedUser) {
        console.log('Selected User:', selectedUser);
        console.log('Is Structure:', selectedUser.isStructure);

        // Store the extracted isStructure value in the row
        this.rows[index].isStructure = selectedUser.isStructure;
    }
    if (index === this.rows.length - 1) {
          this.rows.push(this.createEmptyRow());
        }
}


  collectRowData(): TransferRow[] {
    const rowsData: TransferRow[] = [];
    this.rows.slice(0, -1).forEach((row) => {
      const { selectedUser, selectedPurposeId, selectedPriorityId, selectedDueDate, txtInstruction, isPrivate, isCCed, isFollowUp } = row;
  
      const isStructure = selectedUser?.isStructure ?? false;
      const userId = selectedUser?.id ?? null;
      const formattedDate = (date: Date | null) => date ? date.toLocaleDateString('en-US') : null;
      rowsData.push({
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
      } as TransferRow);
  });
  return rowsData; // ✅ Returns all rows except the last one

    return rowsData;
  }


  Transfer(): void {

    const model: any = [];
    const rowData = this.collectRowData();
    this.mailService.transferMail(this.accessToken!, rowData).subscribe(
      (result) => {
        debugger
        //
      },
      (error) => {
        debugger
        console.error('Error sending mail:', error);
      }
    );
  }
}
