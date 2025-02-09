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
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-delegation-page',
  templateUrl: './delegation-page.component.html',
  styleUrls: ['./delegation-page.component.scss'],
  standalone: false
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
    private modalService: NgbModal,
    private translate: TranslateService
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
        emptyTable: ""
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
        this.contacts.unshift({ id: 0, fullName: this.translate.instant('DELEGATION.PLACEHOLDERS.SELECT_NAME') });

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
        this.privacy.unshift({ id: 0, text: this.translate.instant('DELEGATION.PLACEHOLDERS.SELECT_PRIVACY') });

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

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
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
            this.translate.get('DELEGATION.UPDATE_SUCCESS').subscribe((msg: string) => {
              this.toaster.showToaster(msg);
            });
          },
          (error: any) => {
            console.error('Error updating:', error);
            this.translate.get('ERRORS.SOMETHING_WRONG').subscribe((msg: string) => {
              this.toaster.showToaster(error?.message || msg);
            });
          }
        );
      } else {
        this.delegationService.updateDelegate(this.accessToken!, itemData).subscribe(
          (response: any) => {
            this.isEdit = false;
            this.clear();
            this.getListData();
            this.translate.get('DELEGATION.ADD_SUCCESS').subscribe((msg: string) => {
              this.toaster.showToaster(msg);
            });
          },
          (error: any) => {
            console.error('Error adding:', error);
            this.translate.get('ERRORS.SOMETHING_WRONG').subscribe((msg: string) => {
              this.toaster.showToaster(error?.message || msg);
            });
          }
        );
      }
    } else {
      this.translate.get('ERRORS.REQUIRED_FIELDS').subscribe((msg: string) => {
        this.toaster.showToaster(msg);
      });
    }
  }

  onDelete(row: any): void {
    if (row) {
      const modalRef = this.modalService.open(ConfirmationmodalComponent);
      this.translate.get('DELEGATION.DELETE_CONFIRMATION').subscribe((msg: string) => {
        modalRef.componentInstance.message = msg;
      });

      modalRef.componentInstance.confirmed.subscribe(() => {
        if (this.accessToken) {
          this.delegationService.deleteDelegate(this.accessToken!, row.id).subscribe(
            (response) => {
              this.clear();
              this.getListData();
              this.translate.get('DELEGATION.DELETE_SUCCESS').subscribe((msg: string) => {
                this.toaster.showToaster(msg);
              });
            },
            (error: any) => {
              console.error('Error deleting item:', error);
              this.translate.get('ERRORS.SOMETHING_WRONG').subscribe((msg: string) => {
                this.toaster.showToaster(error?.message || msg);
              });
            }
          );
        }
      });
    }
  }

  convertToNgbDateStruct(dateStr: string): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  resetDropDowns() {
    this.delegationForm.patchValue({
      userId: this.contacts.length > 0 ? this.contacts[0]?.id : null,
      categoryId: this.categories.length > 0 ? [] : [],
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
