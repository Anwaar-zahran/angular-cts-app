import { Component, Inject, OnInit, EventEmitter, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LookupsService } from '../../../services/lookups.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

interface User {
  firstname: string;
  lastname: string;
}

interface UserStructure {
  user: User;
}

interface AddressUser {
  name: string;
  userStructure?: UserStructure[];
}

@Component({
  selector: 'app-address-book',
  imports: [
    CommonModule, MatDialogModule, NgSelectModule,
    MatInputModule, FormsModule
  ],
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent implements OnInit {
  addressUsers: any[] = [];
  filteredAddressUsers: any[] = [];
  selectedUsers: any[] = [];
  txtSearchStructure: string = '';
  txtSearchUser: string = '';
  showModal: boolean = true;

  expandedRows: Set<any> = new Set();
  pageSize: number = 10;
  currentPage: number = 1;
  totalItems: number = 0;
  totalPages: number = 1;
  pages: number[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private lookupservice: LookupsService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<AddressBookComponent>
  ) { }

  //@Output() selectedUsersChange = new EventEmitter<any[]>();

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.lookupservice.getStructuredUsers(this.authService.getToken()!).subscribe(
      (data) => {
        this.addressUsers = data || [];
        this.addressUsers.forEach(user => user.selected = false);
        this.filteredAddressUsers = [...this.addressUsers];
        this.totalItems = this.filteredAddressUsers.length;
        this.calculatePagination();
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );
  }

  applyFilters(): void {
    const structureSearch = this.txtSearchStructure?.toLowerCase() || '';
    const userSearch = this.txtSearchUser?.toLowerCase() || '';
  
    this.expandedRows.clear();
  
    if (structureSearch && userSearch) {
      this.filteredAddressUsers = this.addressUsers
        .filter((structure: AddressUser) => structure.name.toLowerCase().includes(structureSearch))
        .map((structure: AddressUser) => ({
          ...structure,
          userStructure: structure.userStructure?.filter(userStruct => {
            const fullName = `${userStruct.user.firstname} ${userStruct.user.lastname}`.toLowerCase();
            return fullName.includes(userSearch);
          }) || []
        }))
        .filter(structure => structure.userStructure.length > 0);
      this.filteredAddressUsers.forEach(structure => this.expandedRows.add(structure));
  
    } else if (userSearch) {
      this.filteredAddressUsers = this.addressUsers
        .flatMap((structure: AddressUser) =>
          (structure.userStructure || [])
            .filter((userStruct: UserStructure) => {
              const fullName = `${userStruct.user.firstname} ${userStruct.user.lastname}`.toLowerCase();
              return fullName.includes(userSearch);
            })
            .map((userStruct: UserStructure) => ({
              userStructure: [userStruct],
            }))
        );
  
    } else if (structureSearch) {
      this.filteredAddressUsers = this.addressUsers.filter((structure: AddressUser) =>
        structure.name.toLowerCase().includes(structureSearch)
      );
  
    } else {
      this.filteredAddressUsers = [...this.addressUsers];
    }
  
    this.totalItems = this.filteredAddressUsers.length;
    this.calculatePagination();
  }
  
  resetFilters(): void {
    this.txtSearchStructure = '';
    this.txtSearchUser = '';
    this.filteredAddressUsers = [...this.addressUsers];
    this.totalItems = this.filteredAddressUsers.length;
    this.expandedRows.clear();
    this.calculatePagination();
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
      if (selectedUser.userStructure) {
        this.selectAllUsersUnderStructure(selectedUser, true);
      }
    } else {
      this.selectedUsers = this.selectedUsers.filter(user => user !== selectedUser);
      if (selectedUser.userStructure) {
        this.selectAllUsersUnderStructure(selectedUser, false);
      }
    }
    
    // Emit the updated array of selected users
    //this.selectedUsersChange.emit(this.selectedUsers);
  }

  selectAllUsersUnderStructure(structure: any, isChecked: boolean): void {
    structure.userStructure.forEach((userStruct: any) => {
      const user = userStruct.user;
      user.selected = isChecked;
      if (isChecked) {
        if (!this.selectedUsers.includes(user)) {
          this.selectedUsers.push(user);
        }
      } else {
        this.selectedUsers = this.selectedUsers.filter(selectedUser => selectedUser !== user);
      }
    });
  }

  onSubmit(): void {
 
    //this.selectedUsersChange.emit(this.selectedUsers);
    console.log('Selected Users:', this.selectedUsers);
    this.dialogRef.close(this.selectedUsers);

    //this.onClose(); 
  }

  onClose(): void {
    this.dialogRef.close();
    this.showModal = false;
  }

  toggleRow(row: any): void {
    if (this.expandedRows.has(row)) {
      this.expandedRows.delete(row);
    } else {
      console.log(row)
      this.expandedRows.add(row);
    }
  }

  isRowExpanded(row: any): boolean {
    return this.expandedRows.has(row);
  }
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPageData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  loadPageData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredAddressUsers = [...this.addressUsers].slice(startIndex, endIndex);
  }
}
