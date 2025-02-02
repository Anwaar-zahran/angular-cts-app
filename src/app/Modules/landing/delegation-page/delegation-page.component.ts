import { Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DelegationPageService } from '../../../services/delegation-page.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { LookupsService } from '../../../services/lookups.service';
import { ToasterService } from '../../../services/toaster.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationmodalComponent } from '../../shared/confirmationmodal/confirmationmodal.component';
import { Delegation } from '../../../models/delegation.model';
import { Privacy } from '../../../models/privacy.model';
import { Category } from '../../../models/category.model';
import { Priority } from '../../../models/priority.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-delegation-page',
  templateUrl: './delegation-page.component.html',
  styleUrls: ['./delegation-page.component.scss']
})
export class DelegationPageComponent implements OnInit {
  fromModal: NgbDateStruct | undefined;
  tomodel: NgbDateStruct | undefined;

  // Data table options
  dtOptions: DataTables.Settings = {};
  data: Delegation[] = [];
  accessToken: string | null = null;

  // Lookup data
  categories: Category[] = [];
  contacts: Partial<User>[] = [];
  privacy: Privacy[] = [];

  isEdit = false;
  selectedCategoryId: number | null = null;
  selectedUserId: number | null | undefined = undefined;
  selectedPrivacyId: number | null = null;
  cansign: boolean = false;
  showOldCorrespondance: boolean = false;
  selectedRowId: number | null | undefined = undefined;

  // Form group
  delegationForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private delegationService: DelegationPageService,
    private router: Router,
    private lookupservice: LookupsService,
    private authService: AuthService,
    private toaster: ToasterService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.accessToken = this.authService.getToken();
    if (!this.accessToken) {
      this.router.navigate(['/login']);
      return;
    }

    this.initDtOptions();
    this.setupForm();

    const today = new Date();
    this.fromModal = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
    this.tomodel = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };

    this.getCategories();
    this.getPrivacyData();
    this.getUsers();
    this.getListData();
  }

  setupForm(): void {
    this.delegationForm = this.fb.group({
      userId: [null, Validators.required],
      privacyId: [null, Validators.required],
      categoryId: [null, [Validators.required, this.categoryValidator]],
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      allowSign: [false],
      showOldCorrespondence: [false],
    });
  }

  initDtOptions(): void {
    this.dtOptions = {
      pageLength: 10,
      pagingType: 'full_numbers',
      paging: true,
      searching: false,
      autoWidth: false,
      language: {
        paginate: {
          first: "<i class='text-secondary fa fa-angle-left'></i>",
          previous: "<i class='text-secondary fa fa-angle-double-left'></i>",
          next: "<i class='text-secondary fa fa-angle-double-right'></i>",
          last: "<i class='text-secondary fa fa-angle-right'></i>",
        },
      },
      dom: 'tp',
      ordering: false,
    };
  }

  categoryValidator(control: FormControl): { [key: string]: boolean } | null {
    if (control.value && control.value.includes(0)) {
      return { 'invalidCategory': true };  // Invalid if 'id = 0' is selected
    }
    return null;
  }


  getListData(): void {
    this.delegationService.getDelegations(this.accessToken!).subscribe(
      (response) => {
        this.data = response.data || [];
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getUsers(): void {
    this.lookupservice.getUsers(this.accessToken!).subscribe(
      (response) => {
        this.contacts = response || [];
        this.contacts.unshift({ id: 0, fullName: 'Select a user' });

        if (this.contacts.length > 0) {
          this.delegationForm.patchValue({
            userId: this.contacts[0]?.id,
          });
        }
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getCategories(): void {
    this.lookupservice.getCategories(undefined).subscribe(
      (response) => {
        this.categories = response || [];
        this.categories.unshift({ id: 0, text: 'Select Category' });

        if (this.categories.length > 0) {
          this.delegationForm.patchValue({
            categoryId: [this.categories[0]?.id],
          });
        }
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getPrivacyData(): void {
    this.lookupservice.getPrivacy(this.accessToken!).subscribe(
      (response) => {
        this.privacy = response || [];
        this.privacy.unshift({ id: 0, text: 'Select Privacy' });

        if (this.privacy.length > 0) {
          this.delegationForm.patchValue({
            privacyId: this.privacy[0]?.id,
          });
        }
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  formatDate(date: NgbDateStruct | undefined): string {
    if (!date) return '';
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    const year = date.year.toString();
    return `${year}/${month}/${day}`;
  }

  onEdit(item: Delegation): void {
    if (item) {
      this.isEdit = true;
      this.selectedRowId = item.id;
      this.selectedUserId = item.toUserValueText.id;

      if (this.contacts && this.contacts.length > 0) {
        this.delegationForm.patchValue({
          userId: this.selectedUserId,
          privacyId: item.privacyId,
          categoryId: item.categoryIds,
          fromDate: this.convertToNgbDateStruct(item.fromDate),
          toDate: this.convertToNgbDateStruct(item.toDate),
          allowSign: item.allowSign,
          showOldCorrespondence: item.showOldCorrespondecne,
        });

        // Convert fromDate and toDate to NgbDateStruct if they exist
        if (item.fromDate) {
          const [day, month, year] = item.fromDate.split('/');
          this.fromModal = { year: +year, month: +month, day: +day };
        }

        if (item.toDate) {
          const [day, month, year] = item.toDate.split('/');
          this.tomodel = { year: +year, month: +month, day: +day };
        }
      }
    }
  }

  onSave(): void {
    if (this.delegationForm.valid) {
      const formValues = this.delegationForm.value;

      const itemData: Delegation = {
        fromDate: this.formatDate(formValues.fromDate),
        toDate: this.formatDate(formValues.toDate),
        categoryIds: formValues.categoryId,
        privacyId: formValues.privacyId,
        allowSign: formValues.allowSign ?? false,
        showOldCorrespondecne: formValues.showOldCorrespondence,
        toUser: formValues.userId,
        privacyName: '',
        createdDate: '',
        toUserValueText: { text: null, parentName: null },
      };

      if (this.isEdit) {
        if (this.selectedRowId !== null && this.selectedRowId !== undefined) {
          itemData.id = this.selectedRowId;
        }

        this.delegationService.updateDelegate(this.accessToken!, itemData).subscribe(
          (response: any) => {
            this.isEdit = false;
            this.clear();
            this.getListData();
            this.toaster.showToaster(response.message ?? "Item updated successfully");
          },
          (error: any) => {
            console.error('Error updating:', error);
            this.toaster.showToaster(error?.message || 'Something went wrong');
          }
        );
      } else {
        this.delegationService.updateDelegate(this.accessToken!, itemData).subscribe(
          (response: any) => {
            this.isEdit = false;
            this.clear();
            this.getListData();
            this.toaster.showToaster(response.message || 'Item added successfully');
          },
          (error: any) => {
            console.error('Error adding:', error);
            this.toaster.showToaster(error?.message || 'Something went wrong');
          }
        );
      }
    }
    else {
      this.toaster.showToaster("Please fill all required fields");
    }
  }

  onDelete(row: any): void {
    if (row) {
      const modalRef = this.modalService.open(ConfirmationmodalComponent);
      modalRef.componentInstance.message = 'Are you sure you want to delete this item?';

      modalRef.componentInstance.confirmed.subscribe(() => {
        if (this.accessToken) {
          this.delegationService.deleteDelegate(this.accessToken!, row.id).subscribe(
            (response) => {
              this.clear();
              this.getListData();
              this.toaster.showToaster("Item deleted successfully");
            },
            (error: any) => {
              console.error('Error deleting item:', error);
              this.toaster.showToaster(error?.message || 'Something went wrong');
            }
          );
        }
      });
    }
  }

  convertToNgbDateStruct(dateStr: string): NgbDateStruct | undefined {
    if (!dateStr) return undefined;
    const [day, month, year] = dateStr.split('/');
    return { year: +year, month: +month, day: +day };
  }

  resetDropDowns() {
    this.delegationForm.patchValue({
      userId: this.contacts.length > 0 ? this.contacts[0]?.id : null,
      categoryId: this.categories.length > 0 ? [0] : [],
      privacyId: this.privacy.length > 0 ? this.privacy[0]?.id : null,
    });
  }

  clear(): void {
    this.delegationForm.reset();
    this.resetDropDowns();
    const today = new Date();
    this.fromModal = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
    this.tomodel = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
  }
}
