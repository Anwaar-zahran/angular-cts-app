import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LookupsService } from '../../../services/lookups.service';
import { MailsService } from '../../../services/mail.service';
import { ToasterService } from '../../../services/toaster.service';
import { AuthService } from '../../auth/auth.service';
import { ToasterComponent } from '../../shared/toaster/toaster.component';
import { AddressBookComponent } from '../address-book/address-book.component';
import { LanguageService } from '../../../services/language.service';
import { ConfirmationmodalComponent } from '../../shared/confirmationmodal/confirmationmodal.component';
import { SharedModule } from '../../shared/shared.module';

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
}

@Component({
  selector: 'app-transfer-modal',
  imports: [
    CommonModule, MatDialogModule, NgSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    FormsModule,
    ToasterComponent,
    TranslateModule,
    SharedModule],
  templateUrl: './transfer-modal.component.html',
  styleUrl: './transfer-modal.component.scss',
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
  minDate: Date = new Date();
  txtInstruction: any;
  selectedUsers: any[] = [];
  showAddressBook: boolean = false;
  selectedUserId: any;
  maxUsers = 50;
  documentId: any;
  documentPrivacyId: any;
  fromStructureId: any;
  parentTransferId: any;
  selectedToUsers: StructureUsers[] = []
  rows = [
    this.createEmptyRow() // Initialize with one empty row
  ];
  @ViewChildren('picker') pickerRefs!: QueryList<MatDatepicker<any>>;

  @ViewChildren('rowForm') rowForms: QueryList<NgForm> | null = null;

  selectedPurposeId: number | null = null;
  selectedDueDate: any;
  selectedPriorityId: any;
  isCCed: any;
  isPrivate: any;
  isFollowUp: boolean = false;
  isFollowUpRequired: boolean = false;
  isTransferring: boolean = false;
  isCCedClicked: any;


  currentLanguage!: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService, private toaster: ToasterService,
    private router: Router, private lookupsService: LookupsService, private dialog: MatDialog, private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<TransferModalComponent>, private mailService: MailsService, private translate: TranslateService,
    private languageService: LanguageService, private cdRef: ChangeDetectorRef,private modalService: NgbModal,
    ) {

    this.receivedData = data;
    this.documentId = this.data.documentId;
    this.documentPrivacyId = this.data.row.privacyId;
    this.parentTransferId = this.data.row.id;
    this.fromStructureId = this.data.row.toStructureId;
    this.currentLanguage = this.languageService.getCurrentLang();
    console.log(this.currentLanguage);
  }

  ngOnInit(): void {
    //    console.log('Dialog opened with ID:', this.data.id, 'and Reference Number:', this.data.referenceNumber);

    this.updateHeaderState();

    this.rows.forEach((row, index) => {
      if (row.selectedPriorityId) {
        this.updateDueDate(index);
      }
    });

    this.accessToken = this.authService.getToken();
    if (!this.accessToken) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserStructures();
  }

  getRowDueDate(index: number): Date {
    return this.rows[index].selectedDueDate || this.selectedDueDate;
  }

  setRowDueDate(index: number, value: Date): void {
    this.rows[index].selectedDueDate = value;
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
  transformDatawithoutLang(data: Array<{
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
  transformData(
    data: Array<{
      id: number;
      name: string;
      nameAr?: string; // Added Arabic name
      userStructure?: Array<{
        user?: {
          id: number;
          firstname?: string;
          lastname?: string;
          firstnameAr?: string; // Added Arabic firstname
          lastnameAr?: string; // Added Arabic lastname
          structureId?: number;
        };
      }>;
    }>
  ): Array<{ id: number; name: string; isStructure: boolean; structureId?: number | undefined }> {
    
    let result: Array<{ id: number; name: string; isStructure: boolean; structureId?: number }> = [];
    const isArabic = this.translate.currentLang === 'ar'; // Check language
  
    data.forEach((structure) => {
      if (structure.name) {
        const structureName = isArabic ? structure.nameAr || structure.name : structure.name;
  
        // Push the structure itself (isStructure: true, no structureId)
        result.push({ id: structure.id, name: structureName, isStructure: true });
  
        structure.userStructure?.forEach((userStruct) => {
          if (userStruct?.user) {
            const user = userStruct.user;
  
            // Select user first & last name based on language
            const firstname = isArabic ? user.firstnameAr || user.firstname : user.firstname;
            const lastname = isArabic ? user.lastnameAr || user.lastname : user.lastname;
  
            if (firstname && lastname) {
              result.push({
                id: user.id,
                name: `${structureName} / ${firstname} ${lastname}`,
                isStructure: false,
                structureId: structure.id ?? undefined, // Use undefined instead of null
              });
            }
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

        console.log('Priorities loaded:', reponse);
        this.priorities = reponse || [];
        this.selectedPriorityId = this.priorities[0].id;

        this.priorities.forEach(p => {
          console.log(`Priority ${p.id} (${p.name}) has numberOfDueDays: ${p.numberOfDueDays}`);
        });

        let defaultDueDate: Date | null = null;

        const defaultPriorityId = this.priorities.length > 0 ? this.priorities[0].id : null;
        // Find the selected priority object based on the ID
        if (defaultPriorityId !== null) {
          const selectedPriority = this.priorities.find(p => p.id === defaultPriorityId);

          if (selectedPriority && selectedPriority.numberOfDueDays !== undefined) {
            let currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + (selectedPriority.numberOfDueDays - 1));
            defaultDueDate = currentDate;
            this.selectedDueDate = currentDate;
          }
        }

        this.rows = this.rows.map(row => ({
          ...row,
          selectedPriorityId: row.selectedPriorityId || defaultPriorityId,
          selectedDueDate: row.selectedDueDate || defaultDueDate
        }));
      },
      (error) => {
        console.error('Error loading priorities:', error);
      }
    );

    this.lookupsService.getPurposes(this.accessToken!).subscribe(
      (reponse) => {

        console.log(reponse)
        this.purposes = [...(reponse || [])].sort((a, b) => a.name.localeCompare(b.name));
        console.log(this.purposes)

      },
      (error) => {
        console.error('Error loading priorities:', error);
      }
    );
  }

  updateDueDate(index: number) {
    console.log('Updating due date for row', index);
    let selectedRow = this.rows[index];
    console.log('Selected priority ID:', selectedRow.selectedPriorityId);

    if (!selectedRow.selectedPriorityId) return;

    let selectedPriority = this.priorities.find(p => p.id === selectedRow.selectedPriorityId);
    console.log('Found priority:', selectedPriority);

    if (selectedPriority && selectedPriority.numberOfDueDays !== undefined) {
      let daysToAdd = selectedPriority.numberOfDueDays;
      let currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + (daysToAdd - 1));
      console.log('New due date:', currentDate);

      this.selectedDueDate = currentDate;
      this.rows[index] = { ...selectedRow, selectedDueDate: currentDate };
      console.log('Updated row:', this.rows[index]);
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

  showAddress1() {

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

  // onClose(): void {
  //   this.dialogRef.close();
  // }
  onClose(shouldCloseParent: boolean = false): void {
    this.dialogRef.close({ shouldCloseParent });
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
    let defaultPriorityId = this.priorities.length > 0 ? this.priorities[0].id : null;
    let defaultDueDate: Date | null = null;

    // Find the selected priority object based on the ID
    if (defaultPriorityId !== null) {
      const selectedPriority = this.priorities.find(p => p.id === defaultPriorityId);

      if (selectedPriority && selectedPriority.numberOfDueDays !== undefined) {
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + (selectedPriority.numberOfDueDays - 1));
        defaultDueDate = currentDate;
      }
    }

    return {
      selectedUserId: null,
      selectedPurposeId: null as number | null,
      selectedPriorityId: defaultPriorityId,
      selectedDueDate: defaultDueDate,
      txtInstruction: '',
      isPrivate: false,
      isCCed: false,
      isFollowUp: false,
      isStructure: false,
      selectedUser: null as { id: number, name: string, structureId: number, isStructure: boolean } | null,
      showValidationError: false
    };
  }


  onUserOrPurposeChange(index: number) {
    // Add a new row when user is selected, only if it's the last row
    if (this.rows[index].selectedPurposeId == 10) {
      this.rows = this.rows.map((row, i) =>
        i === index ? { ...row, isCCed: true } : row
      );
    }
    else {
      this.rows = this.rows.map((row, i) =>
        i === index ? { ...row, isCCed: false } : row
      );
    }

    if (index === this.rows.length - 1) {

      this.rows.push(this.createEmptyRow());
    }
  }

  onCCedClick(event: MouseEvent, index: number): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const row = this.rows[index];
    row.isCCed = isChecked;
    this.isCCedClicked = isChecked;
    if (isChecked) {
      this.rows[index].selectedPurposeId = 10;

    }
    else
      row.selectedPurposeId = null;
  }


  Transfer(): void {
    debugger
    if (this.isTransferring) {
      return;
    }

    this.isTransferring = true;

    try {
      // Validate required fields for each row efficiently
      const rowsToValidate = this.rows.length > 1 ? this.rows.slice(0, -1) : this.rows;

      const isValid = rowsToValidate.every((row) => {
        let isRowValid = row.selectedUser && row.selectedPurposeId && row.selectedPriorityId;

        if (row.isFollowUp) {
          isRowValid = isRowValid && Boolean(row.txtInstruction); // Include txtInstruction if isFollowUp is true
        }

        row.showValidationError = !isRowValid; // Mark row as invalid if required fields are missing
        return isRowValid;
      });

      if (!isValid) {
        this.toaster.showToaster("Please fill all required fields before transferring.");
        this.isTransferring = false;
        return;
      }

      if (this.isCCedClicked) {
        const confirmed = this.modalService.open(ConfirmationmodalComponent);
        this.translate.get('TRANSFER_DIALOG.CCED_CONFIRMATION').subscribe((msg: string) => {
          confirmed.componentInstance.message = msg;
          this.translate.get("TRANSFER_DIALOG.BUTTONS.CLOSE").subscribe((cancelLabel)=>{
            confirmed.componentInstance.cancelLabel = cancelLabel;
            this.isTransferring = false;
            console.log('transfering trune into true ',this.isTransferring);
          });
          this.translate.get("TRANSFER_DIALOG.BUTTONS.TRANSFER_CLOSE").subscribe((confirmLabel)=>{
            confirmed.componentInstance.confirmLabel = confirmLabel;
          })
        });

        confirmed.componentInstance.confirmed.subscribe(()=>{
          this.executeTransfer();
        })
      }
    }catch(error){
      this.isTransferring = false;
      this.toaster.showToaster("An error occurred while transferring the mail.");
    }

  }

  collectRowData(): TransferRow[] {
    const formattedDate = (date: Date | null) => date ? date.toLocaleDateString('en-GB') : null;

    return this.rows.slice(0, -1).map(({
      selectedUser, selectedPurposeId, selectedPriorityId, selectedDueDate,
      txtInstruction, isPrivate, isCCed, isFollowUp
    }) => {
      const isStructure = selectedUser?.isStructure ?? false;
      const userId = selectedUser?.id ?? null;

      this.cdRef.detectChanges();
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

  showAddress() {
    const dialog = this.dialog.open(AddressBookComponent, {
      width: '80%',
      data: {}
    });

    dialog.afterClosed().subscribe((result: User[]) => {
      if (result && result.length > 0) {
        console.log('Address Book result:', result);

        // Transform selected users
        this.selectedUsers = result.map(user => ({
          ...user,
          selectedUserId: user.id
        }));

        this.selectedToUsers = [];

        this.selectedUsers.forEach(user => {
          if (Array.isArray(user.userStructure)) {
            user.userStructure.forEach((u: { user: { firstname: string; lastname: string } }) => {
              let userName = u.user.firstname + ' ' + u.user.lastname;
              this.selectedToUsers.push({
                structureName: user.name,
                userName: userName
              });
            });
          }
        });

        console.log('Updating rows...');

        // Clear existing rows and add new ones for each selected user
        this.rows = this.selectedToUsers.map(user => ({
          ...this.createEmptyRow(),
          selectedToUsers: [user] // Assigning the user to the row
        }));

        console.log('Updated rows:', this.rows);
        this.cdr.detectChanges();
      } else {
        console.log('Address Book dialog was closed without submitting');
      }
    });
  }

  preventPaste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  onFollowUpChange(row: any): void {
    // Optional: You can add additional logic here if needed when Follow Up is toggled
    // For example, clear instruction if Follow Up is unchecked
    if (!row.isFollowUp) {
      row.showValidationError = false; // Reset validation error when unchecked
    }
    this.updateHeaderState();
  }

  updateHeaderState(): void {
    // Show the asterisk in the header if any row has Follow Up checked
    this.isFollowUpRequired = this.rows.some(row => row.isFollowUp);
  }

  initializeDueDates() {
    this.rows.forEach((row, index) => {
      console.log('rooooooooooooo', row.selectedPriorityId)
      if (row.selectedPriorityId) {
        this.updateDueDate(index);
      }
    });
  }

  private executeTransfer():void{
    const rowData = this.collectRowData();

      this.mailService.transferMail(this.accessToken!, rowData).subscribe(
        (result) => {
          if (result.length > 0) {
            const message = result[0].updated ? "Sent successfully" : result[0].message;
            this.toaster.showToaster(message);
            this.onClose(true);
          }
          this.isTransferring = false;
        },
        (error) => {
          this.toaster.showToaster(error.error.text ?? "Something went wrong");
          this.isTransferring = false;
        }
      );
    }
  }
