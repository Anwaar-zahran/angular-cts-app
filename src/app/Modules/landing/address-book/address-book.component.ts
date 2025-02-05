import { Component, Inject, OnInit, EventEmitter, Output, NgModule } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LookupsService } from '../../../services/lookups.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';




@Component({
  selector: 'app-address-book',
  imports: [
    CommonModule, MatDialogModule, NgSelectModule,
    MatInputModule, FormsModule, DataTablesModule
  ],
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  addressUsers: any[] = [];
  selectedUsers: any[] = [];
  txtSearchStructure: string = '';
  txtSearchUser: string = '';
  showModal: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private lookupservice: LookupsService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<AddressBookComponent>
  ) { }

  //@Output() selectedUsersChange = new EventEmitter<any[]>();

  ngOnInit(): void {
    this.initDtOptions();
    this.getUsers();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  initDtOptions(): void {
    this.dtOptions = {
      pageLength: 10,
      pagingType: 'full_numbers',
      paging: true,
      searching: true,
      autoWidth: true,
      language: {
        paginate: {
          first: "<i class='text-secondary fa fa-angle-left'></i>",
          previous: "<i class='text-secondary fa fa-angle-double-left'></i>",
          next: "<i class='text-secondary fa fa-angle-double-right'></i>",
          last: "<i class='text-secondary fa fa-angle-right'></i>"
        }
      },
      ordering: false
    };
  }

  getUsers(): void {
    this.lookupservice.getStructuredUsers(this.authService.getToken()!).subscribe(
      (data) => {
        this.addressUsers = data || [];
        this.addressUsers.forEach(user => user.selected = false); 
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );
  }

  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    this.addressUsers.forEach(user => user.selected = isChecked);

    // Update the selectedUsers array
    if (isChecked) {
      this.selectedUsers = [...this.addressUsers]; 
    } else {
      this.selectedUsers = []; 
    }

    // Emit the updated array of selected users
    //this.selectedUsersChange.emit(this.selectedUsers);
  }

  isAllSelected(): boolean {
    return this.selectedUsers.length === this.addressUsers.length;
  }

  onUserSelectionChange(selectedUser: any, isChecked: boolean): void {
    if (isChecked) {
      this.selectedUsers.push(selectedUser); 
    } else {
      this.selectedUsers = this.selectedUsers.filter(user => user !== selectedUser); 
    }

    // Emit the updated array of selected users
    //this.selectedUsersChange.emit(this.selectedUsers);
  }

  onSubmit(): void {
 
    //this.selectedUsersChange.emit(this.selectedUsers);
    console.log('Selected Users:', this.selectedUsers);
    this.dialogRef.close(this.selectedUsers); 

    this.onClose(); 
  }

  onClose(): void {
    this.dialogRef.close();
   this.showModal = false;
  }
}
