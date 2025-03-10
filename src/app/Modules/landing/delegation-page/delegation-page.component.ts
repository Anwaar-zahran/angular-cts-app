import { ChangeDetectorRef, Component, HostListener, model, OnInit, ViewChild } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators, FormControl, NgModel, FormsModule } from '@angular/forms';
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
import { TranslateService } from '@ngx-translate/core';
import { trigger, transition, style, animate } from '@angular/animations';
//import { setTimeout } from 'timers';

@Component({
  selector: 'app-delegation-page',
  templateUrl: './delegation-page.component.html',
  styleUrls: ['./delegation-page.component.scss'],
  standalone: false,
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: '0px', opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('300ms ease-in', style({ height: '0px', opacity: 0 }))
      ])
    ])
  ],
  //imports
})
export class DelegationPageComponent implements OnInit {
  fromModal: NgbDateStruct | undefined;
  tomodel: NgbDateStruct | undefined;

  // Data table options
  dtOptions: DataTables.Settings = {};
  data: Delegation[] = [];
  accessToken: string | null = null;
  minToDate: Date | null = null;

  // Lookup data
  categories: Category[] = [];
  contacts: Partial<User>[] = [];
  privacy: Partial<Privacy>[] = [];

  isEdit = false;
  selectedCategoryId: number | null = null;
  selectedUserId: number | null | undefined = undefined;
  //selectedPrivacyId: number | null = null;
  selectedPrivacyId: any = undefined;// = "";//=null;
  cansign: boolean = false;
  showOldCorrespondance: boolean = false;
  selectedRowId: number | null | undefined = undefined;
  note: string = '';

  selectedCategoryName:string[] = [];
  selectedCategories: any[] = [];
  isAllCategoriesSelecte: boolean = false;
  isCtrlPressed = false;


  // Form group
  delegationForm!: FormGroup;
  formVisible = true;
  placeholder: any;

  today!: string

  //col: any = null;
  //@NgModel({ imports: [FormsModule] })
  //@NgModule({
  //  imports: [FormsModule]
  //})

  constructor(
    private fb: FormBuilder,
    private delegationService: DelegationPageService,
    private router: Router,
    private lookupservice: LookupsService,
    private authService: AuthService,
    private toaster: ToasterService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.accessToken = this.authService.getToken();
    if (!this.accessToken) {
      this.router.navigate(['/login']);
      return;
    }

    const now = new Date();
    this.today = now.toISOString().split('T')[0];

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
    //this.getUsers();
    this.getFromUsers('');
    this.getListData();

    this.delegationForm.get('fromDate')?.valueChanges.subscribe(() => {
      this.updateMinDate();
    });
  }

  setupForm(): void {
    this.delegationForm = this.fb.group({
      userId: [null, Validators.required],
      privacyId: [null, Validators.required],
      categoryId: [[], [Validators.required, this.categoryValidator]], 
      fromDate: [null, Validators.required],
      toDate: [{ value: null, disabled: true }, Validators.required],
      allowSign: [false],
      showOldCorrespondence: [false],
      //draftInbox: [false],
      note: [''],
      startDate: [null],
    }, {
      validators: this.dateRangeValidator
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
          first: "<i class='text-secondary fa fa-angle-double-left'></i>",
          previous: "<i class='text-secondary fa fa-angle-left'></i>",
          next: "<i class='text-secondary fa fa-angle-right'></i>",
          last: "<i class='text-secondary fa fa-angle-double-right'></i>",
        },
      },
      dom: 'tp',
      ordering: false,
      drawCallback: (settings: any) => {
        const api = settings.oInstance.api();
        const pageInfo = api.page.info();
        const pagination = $(api.table().container()).find('.dataTables_paginate');
        pagination.find('input.paginate-input').remove();
        const page = $('<span class="d-inline-flex align-items-center mx-2">' + this.translate.instant('COMMON.PAGE') + '<input type="number" class="paginate-input form-control form-control-sm mx-2" min="1" max="' + pageInfo.pages + '" value="' + (pageInfo.page + 1) + '"> ' + this.translate.instant('COMMON.OF') + ' ' + pageInfo.pages + '</span>');


        let timeout: any;
        page.find('input').on('keyup', function () {
          clearTimeout(timeout);

          timeout = setTimeout(() => {
            const pageNumber = parseInt($(this).val() as string, 10);
            if (pageNumber >= 1 && pageNumber <= pageInfo.pages) {
              api.page(pageNumber - 1).draw('page');
            }
          }, 500);
        });

        const previous = pagination.find('.previous');
        const next = pagination.find('.next');
        page.insertAfter(previous);
        next.insertAfter(page);

        pagination.find('a.paginate_button').on('click', function () {
          page.find('input').val(api.page() + 1);
        });
      }
    };
  }

  categoryValidator(control: FormControl): { [key: string]: boolean } | null {
    if (control.value && control.value.includes(0)) {
      return { 'invalidCategory': true };  // Invalid if 'id = 0' is selected
    }
    return null;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey) {
      this.isCtrlPressed = true;
    }
  }
  
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.isCtrlPressed = false;
  }
  
  onCategorySelect(event: any) {
    if (!this.isCtrlPressed) {
      this.selectedCategories = event ? [event] : [];
    }
    this.cdr.detectChanges();
  }
  
  removeCategory(item: any, event: Event) {
    event.stopPropagation(); 
  
    const categoryControl = this.delegationForm.get('categoryId');
    if (!categoryControl) return;
  
    let currentSelection = categoryControl.value || [];
  
   
    const updatedSelection = currentSelection.filter(
      (selectedId:number) => selectedId !== item.id 
    );
    
    categoryControl.setValue(updatedSelection);
    categoryControl.markAsTouched();
    categoryControl.markAsDirty();
    this.cdr.detectChanges();
  }
    
  dateRangeValidator(group: FormControl): { [key: string]: boolean } | null {
    const fromDate = group.get('fromDate')?.value;
    const toDate = group.get('toDate')?.value;

    if (fromDate && toDate && toDate < fromDate) {
      return { toDateInvalid: true };
    }
    return null;
  }

  updateMinDate(): void {
    const fromDate = this.delegationForm.get('fromDate')?.value;

    if (!fromDate) {
      this.minToDate = null;
      this.delegationForm.get('toDate')?.setValue(null);
      this.delegationForm.get('toDate')?.disable();
    } else {
      let validDate = new Date(fromDate);
      let newDate = new Date(validDate.setDate(validDate.getDate()));
      this.minToDate = fromDate ? newDate : null;
      this.delegationForm.get('toDate')?.enable();
    }
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

  //getUsers(): void {
  //  this.lookupservice.getUsers(this.accessToken!).subscribe(
  //    (response) => {
  //      this.contacts = response || [];
  //      // console.log('Contacts', this.contacts);

  //      this.contacts.unshift({ id: 0, fullName: this.translate.instant('DELEGATION.PLACEHOLDERS.SELECT_NAME') });

  //      let currentExistUser = this.authService.getCurrentUserFullName();
  //      console.log('currentUser:', currentExistUser);
  //      this.contacts = this.contacts.filter(contact => contact.fullName !== currentExistUser);

  //      if (this.contacts.length > 0) {
  //        this.delegationForm.patchValue({
  //          userId: this.contacts[0]?.id,
  //        });
  //      }
  //    },
  //    (error: any) => {
  //      console.error(error);
  //    }
  //  );
  //}

  getCategoriesName(categoriesId: any): string {
    // console.log('categoriesId:', categoriesId);

    if (!categoriesId || categoriesId.length === 0) {
      return " ";
    }

    let categoriesName = categoriesId
      .map((id: number) => {
        const category = this.categories.find(cat => cat.id === id);
        return category ? this.getName(category) : '';
      }).join(' - ');

    return categoriesName;
  }

  getPrivacyName(privacyID: number): string {
    const privacy = this.privacy.find(p => p.id === privacyID);
    return privacy ? this.getName(privacy) : '';
  }

  getCategories(): void {
    this.lookupservice.getCategoriesByName(undefined).subscribe(
      (response: any) => {
        this.categories = response.data || [];
        console.log('Categories:', this.categories);
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  getPrivacyData(): void {
    this.lookupservice.getPrivacy(this.accessToken!).subscribe(
      (response) => {
        const placeholder = {
          id: 0,
          name: this.translate.instant('DELEGATION.PLACEHOLDERS.SELECT_PRIVACY')
          //text: "tesssst"
        };
        this.privacy = response || [];

        // this.placeholder = placeholder;
        this.privacy.unshift(placeholder);


        //if (this.privacy.length > 0) {
        //  this.delegationForm.patchValue({
        //    privacyId: this.privacy[0] ?.id,
        //  });
        //}

        this.selectedPrivacyId = null;

      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    // console.log('Date:', date);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  onEdit(item: Delegation): void {
    if (item) {
      this.isEdit = true;
      this.delegationForm.markAllAsTouched();

      this.selectedRowId = item.id;
      this.selectedUserId = item.toUserValueText.id;
      debugger;
      if (this.contacts && this.contacts.length > 0) {
        this.delegationForm.patchValue({
          userId: this.selectedUserId,
          privacyId: item.privacyId,
          categoryId: item.categoryIds,
          fromDate: this.convertToNgbDateStruct(item.fromDate),
          toDate: this.convertToNgbDateStruct(item.toDate),
          allowSign: item.allowSign,
          showOldCorrespondence: item.showOldCorrespondecne,
          //draftInbox: item.draftInbox,
          draftInbox: false,
          note: item.note,
          startDate: this.convertToNgbDateStruct(item.startDate),
        });

        this.showOldCorrespondance = item.showOldCorrespondecne;

        //this.selectedPrivacyId = item.privacyId;
        this.note = item.note;
        //console.log('note:', item.note);
        //console.log('note:', this.note);
        // Convert fromDate and toDate to NgbDateStruct if they exist
        if (item.fromDate) {
          const [day, month, year] = item.fromDate.split('/');
          this.fromModal = { year: +year, month: +month, day: +day };
        }

        if (item.toDate) {
          const [day, month, year] = item.toDate.split('/');
          this.tomodel = { year: +year, month: +month, day: +day };
        }

        if (item.startDate) {
          const [day, month, year] = item.toDate.split('/');
          this.tomodel = { year: +year, month: +month, day: +day };
        }

        //console.log('Item data: FROM EDDDIT ', item);
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
        //privacyId: formValues.privacyId?.id,
        privacyId: formValues.privacyId,
        //privacyId: this.selectedPrivacyId,
        allowSign: formValues.allowSign || false,
        showOldCorrespondecne: formValues.showOldCorrespondence || false,
        draftInbox:  false, //formValues.draftInbox || false,
        note: formValues.note || '',
        startDate: this.formatDate(formValues.startDate),
        toUser: formValues.userId,
        privacyName: '',
        createdDate: '',
        toUserValueText: { text: null, parentName: null },
      };

      this.note = itemData.note;
      console.log('note:', this.note);
      console.log('Item data:', itemData);

      if (this.isEdit) {
        if (this.selectedRowId !== null && this.selectedRowId !== undefined) {
          itemData.id = this.selectedRowId;
        }

        this.delegationService.updateDelegate(this.accessToken!, itemData).subscribe(
          (response: any) => {
            debugger;
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
              // this.toaster.showToaster(error?.message || msg);
              this.toaster.showToaster(msg, 'danger');
            });
          }
        );
      } else {
        this.delegationService.updateDelegate(this.accessToken!, itemData).subscribe(
          (response: any) => {
            debugger;
            this.isEdit = false;
            this.clear();
            this.getListData();
            if (response.message && response.id==0)
              this.translate.get('DELEGATION.Duplicate_Error').subscribe((msg: string) => {
                this.toaster.showToaster(msg); });
            else
            this.translate.get('DELEGATION.SAVE_SUCCESS').subscribe((msg: string) => {
              this.toaster.showToaster(msg);   });
          },
          (error: any) => {
            console.error('Error adding:', error);
            this.translate.get('ERRORS.SOMETHING_WRONG').subscribe((msg: string) => {
              this.toaster.showToaster(msg, 'danger');
            });
          }
        );
      }
    } else {
      this.translate.get('ERRORS.REQUIRED_FIELDS').subscribe((msg: string) => {
        this.toaster.showToaster(msg, 'danger');
      });
    }
  }

  onDelete(row: any): void {
    if (row) {
      const modalRef = this.modalService.open(ConfirmationmodalComponent);
      this.translate.get('DELEGATION.DELETE_CONFIRMATION').subscribe((msg: string) => {
        modalRef.componentInstance.message = msg;
        // Pass translated button labels for "Cancel" and "Confirm"
        this.translate.get('COMMON.ACTIONS.CANCEL').subscribe((cancelLabel: string) => {
          modalRef.componentInstance.cancelLabel = cancelLabel;
        });
        this.translate.get('COMMON.ACTIONS.CONFIRM').subscribe((confirmLabel: string) => {
          modalRef.componentInstance.confirmLabel = confirmLabel;
        });
        this.translate.get('DELEGATION.CONFIRMMODALDELEGATION.TITLE').subscribe((ConfirmTitle: string) => {
          modalRef.componentInstance.ConfirmTitle = ConfirmTitle;
        });
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
                this.toaster.showToaster(error?.message || msg, 'danger');
              });
            }
          );
        }
      });
    }
  }

  isSearch: boolean = false;

  onSearch(): void {
    const formValues = this.delegationForm.value;

    const itemData: any = {
      fromDate: this.formatDate(formValues.fromDate),
      toDate: this.formatDate(formValues.toDate),
      toUser: formValues.userId
    };

    this.delegationService.searchDelegations(this.accessToken!, itemData).subscribe(
      (response: any) => {
        this.isEdit = false;
        this.isSearch = true;
        //this.clear();
        this.data = response.data || [];

      },
      (error: any) => {
        console.error('Error updating:', error);
        this.translate.get('ERRORS.SOMETHING_WRONG').subscribe((msg: string) => {
          this.toaster.showToaster(error?.message || msg);
        });
      }
    );

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
    this.showOldCorrespondance = false;
    this.isAllCategoriesSelecte = false;
    this.resetDropDowns();
    this.selectedPrivacyId = null;

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
    if (this.isSearch)
      this.getListData();
  }

  cancel(): void {
    this.isEdit = false;
    this.showOldCorrespondance = false;
    this.clear();
  }

  preventPaste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  toggleSearchForm() {
    this.formVisible = !this.formVisible;
  }

  // To get lookup names based on language
  getName(item: any): string {

    const currentLang = this.translate.currentLang;
    switch (currentLang) {
      case 'ar':
        return item?.nameAr || item?.name;
      case 'fr':
        return item?.nameFr || item?.name;
      default:
        return item?.name;
    }
  }

  toggleShowOldCorrespondance() {
    this.showOldCorrespondance = !this.showOldCorrespondance;
  }

  onSearchUsers(event: { term: string; items: any[] }): void {
    const query = event.term;
    if (query.length > 2) {
      //this.loading = true;
      this.getFromUsers(query);
    }else {
      //this.loading = true;
      this.getFromUsers('');
    }
  }

  getFromUsers(searchText: string): void {
    debugger;
    this.lookupservice.getUsersWithSearch(this.accessToken!, searchText).subscribe(
      (response) => {
        debugger;
        this.contacts = response || [];

        let currentExistUser = this.authService.getCurrentUserFullName();
        console.log('currentUser:', currentExistUser);
        this.contacts = this.contacts.filter(contact => contact.fullName !== currentExistUser);

        // console.log('Contacts', this.contacts);
      
        this.contacts.unshift({ id: 0, fullName: this.translate.instant('DELEGATION.PLACEHOLDERS.SELECT_NAME') });

       
      //  this.selectedUserId = null;

        //if (this.contacts.length > 0) {
        //  this.delegationForm.patchValue({
        //    userId: this.contacts[0]?.id,
        //  });
        //}
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  selectAllCategories(): void {
    if (this.categories && this.categories.length > 0) {
      this.delegationForm.controls['categoryId'].setValue(
        this.categories.map((category) => category.id)
      );
      this.isAllCategoriesSelecte = true;
      console.log(this.categories)
      this.selectedCategories = this.categories;
      console.log(this.selectedCategories)
    }
  }
  
}
