import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataTablesModule } from 'angular-datatables';

import { FlatTreeControl } from '@angular/cdk/tree';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { environment } from '../../../../environments/environment';
import { AttachmentsApiResponce } from '../../../models/attachments.model';
import { DocAttributesApiResponse } from '../../../models/searchDocAttributes.model';
import { CustomAttributeComponent } from '../../../models/custom.attributes.model';
import { SearchPageService } from '../../../services/search-page.service';
import { AuthService } from '../../auth/auth.service';
import { ReplyToComponent } from '../reply-to/reply-to.component';
import { TransferModalComponent } from '../transfer-modal/transfer-modal.component';

import { LookupsService } from '../../../services/lookups.service';
import { ToasterService } from '../../../services/toaster.service';
import { ToasterComponent } from '../../shared/toaster/toaster.component';
import { DatePipe } from '@angular/common';
import { MailsService } from '../../../services/mail.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


interface Attachment {
  id: string;
  text: string;
  title: string;
  type: number | string; // Adjust based on actual type
  children?: Attachment[]; // Recursive structure
}
interface TreeNode {
  id: string | number;
  name: string;
  children?: TreeNode[];
  expanded?: boolean;
}

interface FlatTreeNode {
  id: string | number;
  expandable: boolean;
  name: string;
  level: number;
  expanded?: boolean;
}

interface BasicAttribute {
  Name: string;
  Enabled: boolean;
  DefaultValue?: string;
  Type?: string;
  UseCurrentStructure?: string;
  DisableField?: boolean;
  MultipleReceivingEntity?: boolean;
  BroadcastReceivingEntity?: boolean;
  RelatedToPriority?: boolean;
}
declare var OrgChart: any;
@Component({
  selector: 'app-mail-details-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    NgbDatepickerModule,
    DataTablesModule,
    MatTreeModule,
    NgSelectModule,
    FormsModule,
    TranslateModule,
    ToasterComponent,

  ],
  providers: [DatePipe],
  templateUrl: './mail-details-dialog.component.html',
  styleUrls: ['./mail-details-dialog.component.scss']

})
export class MailDetailsDialogComponent implements AfterViewChecked, OnInit, OnDestroy {
  @Input() showMyTransferTab: boolean = true;

  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  @ViewChild('tabsContainer', { static: false }) tabsContainer!: ElementRef;
  purposes: any;
  closeDialog() {

    this.dialogRef.close(); // Ensure it only closes the dialog
  }
  accessToken: string | null = null;
  tabs = [
    'MY_TRANSFER',
    'ATTRIBUTES',
    'ATTACHMENTS',
    'NOTES',
    'LINKED_CORRESPONDENCE',
    'NON_ARCHIVED_ATTACHMENT',
    'VISUAL_TRACKING',
    'TRANSACTION_HISTORY',
    'ACTIVITY_LOG'
  ];

  isScrollable: boolean = false;
  activeTabIndex: number = 0;
  selectedNode: any = null;

  dtOptions: any = {};

  treeControl: FlatTreeControl<FlatTreeNode>;
  treeFlattener: MatTreeFlattener<TreeNode, FlatTreeNode>;
  dataSource: MatTreeFlatDataSource<TreeNode, FlatTreeNode>;
  selectedDocumentId!: number;
  documentViewerUrl!: SafeResourceUrl;
  current_Tab!: string;

  // Attachments tree data
  TREE_DATA: TreeNode[] = [];

  // Data fetched from API
  attributes: any;
  nonArchAttachments: any;
  linkedDocs: any;
  activityLogs: any;
  importance: any;
  privacy: any;
  classification: any;
  notes: any;
  transfers: any;
  transHistory: any;
  attachments: any;
  // Visual Tracking data (org chart data)
  visualTracking: any;
  classId: any;
  importanceId: any;
  privacyId: any;
  priorityId: any;
  priority: any;
  carbonUsers: any;
  userId: any[] = [];
  docTypeId: any;
  docTypes: any;
  categories: any;
  isLocKed: boolean = true;
  selectedPriorityText: string = '';
  selectedTransPurposeText: string = '';
  selectedTransPriorityText: string = '';
  selectedPrivacyText: string = '';
  selectedDocTypeText: string = '';
  selectedClassText: string = '';
  selectedCarbonText: string = '';
  selectedImportanceText: string = '';
  ctsTransferId!: number
  ctsDocumentId!: number

  // OrgChart references
  private orgChart: any = null;
  private chartInitialized: boolean = false;

  // Lookup data
  structures: any[] = [];
  users: any[] = [];
  mappedArray: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { row: any, id: string, documentId: string, referenceNumber: string, fromSearch: boolean, showActionButtons: boolean },
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private searchService: SearchPageService,
    private mailService: MailsService,
    private lookupsService: LookupsService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<MailDetailsDialogComponent>,
    private translate: TranslateService,
    private toaster: ToasterService,
    public datePipe: DatePipe,
    private httpclient: HttpClient
  ) {

    this.current_Tab = localStorage.getItem('current_Tab') ?? '';
    // Initialize Angular Material tree for attachments
    this.treeFlattener = new MatTreeFlattener(
      this._transformer,
      (node: FlatTreeNode) => node.level,
      (node: FlatTreeNode) => node.expandable,
      (node: TreeNode) => node.children
    );

    this.treeControl = new FlatTreeControl<FlatTreeNode>(
      (node: FlatTreeNode) => node.level,
      (node: FlatTreeNode) => node.expandable
    );

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = this.TREE_DATA;
    console.log("TREE_DATA:", this.TREE_DATA);
    console.log("dataSource:", this.dataSource);

    // Override the OrgChart's network request function before any initialization
    if (typeof OrgChart !== 'undefined') {
      OrgChart.prototype._ajax = function (url: string, method: string, data: any, callback: Function): void {
        // Simulate successful response without making network call
        if (callback) {
          setTimeout(() => {
            callback({ status: 200, response: JSON.stringify({ result: 'success' }) });
          }, 0);
        }
      };
      OrgChart.OFFLINE = true;
    }

    this.loadLookupData();

  }

  ngOnInit(): void {
    console.log('Dialog opened with ID:', this.data.id, 'and Reference Number:', this.data.referenceNumber);
    this.accessToken = this.authService.getToken();
    //if (!this.accessToken) {
    //   
    //  this.router.navigate(['/login']);
    //  return;
    //}
    this.ctsTransferId = this.data.row.id;
    this.ctsDocumentId = Number(this.data.id);
    this.initDtOptions();
    //this.loadLookupData();
    this.fetchDetails(this.data.id);
    console.log("row", this.data.row);
    console.log("row", this.data.row.id);
    if (!this.showMyTransferTab) {
      this.tabs = this.tabs.filter(tab => tab !== 'MY_TRANSFER');
    }

  }

  lookupPromiseResults: any;
  async loadLookupData(): Promise<void> {
    try {
      const promises = [
        this.toPromise(this.lookupsService.getEntities(), (structures: any) => {
          this.structures = structures || [];
        }),
        this.toPromise(this.lookupsService.getUsers(this.accessToken!), (users: any) => {
          this.users = users || [];
        }),
        this.toPromise(this.lookupsService.getImportanceEn(this.accessToken!), (response: any) => {
          this.importance = response || [];
        }),
        this.toPromise(this.lookupsService.getPurposes(this.accessToken!), (response: any) => {
          this.purposes = response || [];
        }),
        //this.toPromise(this.lookupsService.getClassficationEn(this.accessToken!), (response: any) => {
        //  this.classification = response || [];
        //}),
        this.toPromise(this.lookupsService.getPrioritiesEn(this.accessToken!), (response: any) => {
          this.priority = response || [];
        }),
        this.toPromise(this.lookupsService.getPrivacyEn(this.accessToken!), (response: any) => {
          this.privacy = response || [];
        }),
        //this.toPromise(this.lookupsService.getDocumentTypes(this.accessToken!), (response: any) => {
        //  this.docTypes = response.data || [];
        //}),
        this.toPromise(this.lookupsService.getCarbonUsers(this.accessToken!), (response: any) => {
          this.carbonUsers = response;
        }),
        //this.toPromise(this.lookupsService.getCategoriesByName(undefined), (response: any) => {
        this.toPromise(this.lookupsService.getCategories(undefined), (response: any) => {
          this.categories = response || [];
        }),
      ];

      // Wait for all promises to resolve
      this.lookupPromiseResults = await Promise.all(promises);
    } catch (error) {
      console.error('Error loading lookup data:', error);
    }
  }

  private toPromise<T>(observable: Observable<T>, callback: (data: T) => void): Promise<T> {
    return new Promise((resolve, reject) => {
      observable.subscribe({
        next: (data: any) => {
          callback(data);
          resolve(data);
        },
        error: (err: any) => {
          if (err.status === 401)
            resolve(null as any);
          else {
            console.error('Error in observable:', err);
            reject(err);
          }
        },
      });
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

  showModalTransfer() {
    if (!this.showMyTransferTab) {
      this.toaster.showToaster("Transfer functionality is not available in this context.");
      return;
    }

    this.searchService.CheckDocumentAttachmnentISLocked(this.accessToken!, this.data.documentId).subscribe(
      (isLocked: boolean) => {
        console.log('Document is locked:', isLocked);
        this.isLocKed = isLocked;
        if (isLocked) {
          this.toaster.showToaster("There is a file checked out, please make sure to check in or discard checkout.");
        } else {
          // Perform actions if the document is not locked
          const dialogRef = this.dialog.open(TransferModalComponent, {
            disableClose: true,
            width: '90%',
            height: '90%',
            data: this.data//{ this.data }///* pass any required data here */
          });

          dialogRef.afterClosed().subscribe(result => {
            console.log('Transfer modal closed', result);
            if (result && result.shouldCloseParent) {
              this.dialogRef.close();
            }
          });
        }
      },
      (error) => {
        console.error('Error checking document lock:', error);
      }
    );
  }

  showModalReply() {
    const dialogRef = this.dialog.open(ReplyToComponent, {
      disableClose: true,
      width: '50%',
      data: { data: this.data.row }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Transfer modal closed', result);
      if (result && result.shouldCloseParent) {
        this.dialogRef.close();
      }

    });
  }

  // Add this new method to expand all nodes
  expandAllNodes(): void {
    if (this.treeControl) {
      this.treeControl.expandAll();
    }
  }

  // Update the transformAttachmentsToTree method
  private transformAttachmentsToTree(mailAttachments: any[]): TreeNode[] {
    const nodes = mailAttachments.map(attachment => this.createTreeNode(attachment));
    
    // Function to recursively move the "Original Document" or "older_originalMail" node to the top
    const moveOriginalDocumentToTop = (nodes: TreeNode[]): TreeNode[] => {
      const originalDocumentNodeIndex = nodes.findIndex(
        node => (node.name === this.translate.instant('MAIL_DETAILS.ATTACHMENT.OriginalDoc')) || node.id === 'older_originalMail');

      if (originalDocumentNodeIndex !== -1) {
        // Remove the node from its current position and move it to the top
        const [originalDocumentNode] = nodes.splice(originalDocumentNodeIndex, 1);
        nodes.unshift(originalDocumentNode);
      }

      // Recursively move the original document in children nodes
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          node.children = moveOriginalDocumentToTop(node.children); // Recurse on children
        }
      }); return nodes;
    };

    // Apply the function to the root nodes
    return moveOriginalDocumentToTop(nodes);
  
  }

  // Update the createTreeNode method to set expanded by default
  private createTreeNode(attachment: any): TreeNode {
    const node: TreeNode = {
      id: attachment.id,
      name: this.getAttachmentName(attachment),
      //name: (attachment.text == "Original document") ? this.translate.instant('MAIL_DETAILS.ATTACHMENT.OriginalDoc') : (attachment.text == "Documents") ? this.translate.instant('MAIL_DETAILS.ATTACHMENT.Documents') : attachment.name || attachment.text || 'Unnamed Attachment',
      expanded: true
    };

    if ((attachment.children && attachment.children.length > 0) ||
    (attachment.childAttachments && attachment.childAttachments.length > 0)) {
      const childrenData = attachment.children || attachment.childAttachments;
      node.children = childrenData.map((child: any) => this.createTreeNode(child));
    }
    console.log(node)
    return node;
  }

  getAttachmentName(attachment: any) {

    const { text, name } = attachment;

    // Define constants for hardcoded strings
    const ORIGINAL_DOCUMENT = "Original document";
    const DOCUMENTS = "Documents";
    const Attachment = "Attachments";

    if (text === ORIGINAL_DOCUMENT) {
      return this.translate.instant('MAIL_DETAILS.ATTACHMENT.OriginalDoc');
    } else if (text === DOCUMENTS) {
      return this.translate.instant('MAIL_DETAILS.ATTACHMENT.Documents');
    } else if (text === Attachment) {
      return this.translate.instant('MAIL_DETAILS.TABS.ATTACHMENTS');
    }
    else {
      return name || text || 'Unnamed Attachment';
    }
  };

  // Update the transformer to include expanded state
  private _transformer = (node: TreeNode, level: number): FlatTreeNode => ({
    id: node.id,
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level: level,
    expanded: true
  });

  hasChild = (_: number, node: FlatTreeNode) => node.expandable;

  selectNode(node: any, event: Event): void {
    event.preventDefault();
    this.selectedNode = node;
    if (this.selectedNode.id && this.selectedNode.id.toString().startsWith('file_')) {
      this.selectedDocumentId = parseInt(this.selectedNode.id.toString().split('_')[1], 10);
      this.getViewerUrl();
    }
  }

  ngAfterViewChecked(): void {
    // Check if tab scrolling is needed
    if (this.tabsContainer) {
      const newScrollState = this.checkScroll();
      if (this.isScrollable !== newScrollState) {
        this.isScrollable = newScrollState;
        this.cdr.detectChanges();
      }
    }

  }

  scrollLeft(): void {
    if (this.tabsContainer) {
      this.tabsContainer.nativeElement.scrollBy({ left: -150, behavior: 'smooth' });
    }
  }

  scrollRight(): void {
    if (this.tabsContainer) {
      this.tabsContainer.nativeElement.scrollBy({ left: 150, behavior: 'smooth' });
    }
  }

  checkScroll(): boolean {
    return this.tabsContainer && this.tabsContainer.nativeElement.scrollWidth > this.tabsContainer.nativeElement.clientWidth;
  }

  setActiveTab(index: number): void {
    this.activeTabIndex = index;

    // If switching to Visual Tracking tab
    if (this.visualTracking &&
      this.activeTabIndex === this.tabs.indexOf('VISUAL_TRACKING') &&
      !this.chartInitialized) {
      this.chartInitialized = false; // Reset initialization flag
      // Short delay to ensure container is visible
      setTimeout(() => {
        this.initOrgChart();
      }, 250);
    }
  }

  async fetchDetails(docID: string): Promise<void> {

    try {
      // Create an array of promises for all data fetching operations
      const promises = [
        this.data.fromSearch ? this.getSearchAttributes(docID): this.getAttributes(this.data.row.id),
        this.getNonArchAttachments(docID),
        this.getLinkedDocuments(docID),
      //this.data.fromSearch ? this.getActivityLogs(docID) : this.getActivityLogsByDocId(docID),
        this.getActivityLogs(docID),
        this.getNotes(docID),
        this.getHistory(docID),
        this.getAttachments(docID),
        this.getVisualTracking(docID)
      ];

      if (this.showMyTransferTab && this.data ?.row ?.id) {
        promises.push(this.getTransfer(this.data.row.id));
      }

      const results = await Promise.all(promises);

      this.attributes = results[0];
      this.nonArchAttachments = results[1] ?.data;
      this.linkedDocs = results[2] ?.data;
      //this.activityLogs = this.data.fromSearch ? results[3] : results[3] ?.data;
      this.activityLogs = results[3];
      this.notes = results[4]?.data;
      this.transHistory = results[5] ?.data;
      this.attachments = results[6];
      this.visualTracking = results[7];

      // Only assign transfers if MY_TRANSFER tab is visible
      if (this.showMyTransferTab && results.length > 8) {
        this.transfers = results[8];
      }
      //if (this.attributes) {
      //  this.classId = this.attributes.classificationId ?? '';
      //  this.importanceId = this.attributes.importanceId ?? '';
      //  this.privacyId = this.attributes.privacyId ?? '';
      //  this.priorityId = this.attributes.priorityId ?? '';
      //  this.docTypeId = this.attributes.documentTypeId ?? '';

      //  debugger;
      //  if (this.priorityId) {
      //    this.selectedPriorityText = this.getItemName(this.priorityId, this.priority, true);
      //  }
      //  if (this.privacyId) {
      //    this.selectedPrivacyText = this.getItemName(this.privacyId, this.privacy, true);
      //  }
      //  if (this.importanceId) {
      //    this.selectedImportanceText = this.getItemName(this.importanceId, this.importance, true);
      //  }
      //  if (this.classId) {
      //    this.selectedClassText = this.getItemName(this.classId, this.classification, true);
      //  }
      //  if (this.attributes.carbonCopy ?.length > 0)
      //    this.selectedCarbonText = this.attributes.carbonCopies.map((carbon: any) => carbon.text).join(', ');

      //  if (this.docTypeId) {
      //    this.selectedDocTypeText = this.getItemName(this.docTypeId, this.docTypes, true);
      //  }
      //}

      if (this.linkedDocs ?.length > 0) {
        this.mappedArray = this.linkedDocs.map((doc: any) => {
         // const foundItem = this.categories ?.data.find((cat: any) => cat.id === doc.categoryId);
          const foundItem = this.categories?.find((cat: any) => cat.id === doc.categoryId);
          return {
            id: doc.id,
            linkedDocumentReferenceNumber: doc.linkedDocumentReferenceNumber,
            categoryId: doc.categoryId,
            statusId: doc.statusId,
            linkedBy: doc.linkedBy,
            createdDate: doc.createdDate,
            category: foundItem ? this.getName(foundItem) : '',
          };
        });
      }
      debugger;
      if (this.showMyTransferTab) {

        if (this.transfers ?.purpose && !this.selectedTransPurposeText)
          this.selectedTransPurposeText = this.getItemName(this.transfers.purpose, this.lookupPromiseResults[3], false);
        //this.selectedTransPurposeText = this.getItemName(this.transfers.purpose, this.purposes, false);

        if (this.transfers ?.priorityId && !this.selectedTransPriorityText)
          this.selectedTransPriorityText = this.getItemName(this.transfers.priorityId, this.lookupPromiseResults[5], true);
        // // this.selectedTransPriorityText = this.getItemName(this.transfers.priorityId, this.priority, true);
      }

      // Build attachments tree if available
      if (this.attachments && Array.isArray(this.attachments)) {
        this.TREE_DATA = this.transformAttachmentsToTree(this.attachments);
        this.dataSource.data = this.TREE_DATA;
        console.log("Transformed TREE_DATA:", this.TREE_DATA);
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error("Error loading data", error);
    }
  }

  getItemName(filterText: string, source: any, byId: boolean) {
    const item = byId ? source ?.find((i: any) => i.id == filterText) : source ?.find((i: any) => i.name == filterText);
    return this.getName(item);
  }

  getTransfer(docID: string): any {
    return new Promise((resolve, reject) => {
      this.mailService.getMyTransfer(this.accessToken!, docID).subscribe(
        (response) => {
          debugger;
          this.transfers = response || [];


          if (this.transfers ?.purpose)
            this.selectedTransPurposeText = this.getItemName(this.transfers.purpose, this.lookupPromiseResults[3], false);
          //this.selectedTransPurposeText = this.getItemName(this.transfers.purpose, this.purposes, false);

          if (this.transfers ?.priorityId)
            this.selectedTransPriorityText = this.getItemName(this.transfers.priorityId, this.lookupPromiseResults[5], true);
          resolve(response);
          console.log("Transfer:", response)
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  basicAttributes: any;
  customAttribute: any;
  customFormData: any;
  customAttributes: { components: CustomAttributeComponent[] } = { components: [] };

  getAttributes(docID: string): Promise<DocAttributesApiResponse> {
    return new Promise((resolve, reject) => {
      this.searchService.getDocAttributes(this.accessToken!, docID).subscribe(
        (response: any) => {
          this.attributes = response || [];
          this.basicAttributes = JSON.parse(response ?.basicAttributes);
          //this.customAttribute = JSON.parse(response?.customAttributes);
          this.customAttributes = JSON.parse(response ?.customAttributes);
          this.customFormData = JSON.parse(response ?.formData);

          if (this.attributes) {
            this.classId = this.attributes.classificationId ?? '';
            this.importanceId = this.attributes.importanceId ?? '';
            this.privacyId = this.attributes.privacyId ?? '';
            this.priorityId = this.attributes.priorityId ?? '';
            this.docTypeId = this.attributes.documentTypeId ?? '';

            if (this.priorityId) {
              this.selectedPriorityText = this.getItemName(this.priorityId, this.priority, true);
            }
            if (this.privacyId) {
              this.selectedPrivacyText = this.getItemName(this.privacyId, this.privacy, true);
            }
            if (this.importanceId) {
              this.selectedImportanceText = this.getItemName(this.importanceId, this.importance, true);
            }
            if (this.classId) {
              //this.selectedClassText = this.getItemName(this.classId, this.classification, true);
              this.selectedClassText = this.attributes ?.classification ?.text;

            }
            if (this.attributes.carbonCopy ?.length > 0)
              this.selectedCarbonText = this.attributes.carbonCopies.map((carbon: any) => carbon.text).join(', ');
            debugger;
            if (this.docTypeId) {
              //this.selectedDocTypeText = this.getItemName(this.docTypeId, this.docTypes, true);
              this.selectedDocTypeText = this.attributes ?.documentType ?.text;
            }
          }
          this.getFormDataValue();

          console.log("Attributes:", this.attributes);
          console.log("BasicAttributes:", this.basicAttributes);
          console.log("CustomAttributes:", this.customAttributes);
          console.log("customFormData:", this.customFormData);
          resolve(response);
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  
  getSearchAttributes(docID: string): Promise<DocAttributesApiResponse> {
    return new Promise((resolve, reject) => {
      this.searchService.getSearchDocAttributes(this.accessToken!, docID).subscribe(
        (response: any) => {
          this.attributes = response || [];
          this.basicAttributes = JSON.parse(response ?.basicAttributes);
          this.customAttributes = JSON.parse(response ?.customAttributes);
          this.customFormData = JSON.parse(response ?.formData);

          if (this.attributes) {
            this.classId = this.attributes.classificationId ?? '';
            this.importanceId = this.attributes.importanceId ?? '';
            this.privacyId = this.attributes.privacyId ?? '';
            this.priorityId = this.attributes.priorityId ?? '';
            this.docTypeId = this.attributes.documentTypeId ?? '';

            if (this.priorityId) {
              this.selectedPriorityText = this.getItemName(this.priorityId, this.priority, true);
            }
            if (this.privacyId) {
              this.selectedPrivacyText = this.getItemName(this.privacyId, this.privacy, true);
            }
            if (this.importanceId) {
              this.selectedImportanceText = this.getItemName(this.importanceId, this.importance, true);
            }
            if (this.classId) {
              this.selectedClassText = this.getItemName(this.classId, this.classification, true);
            }
            if (this.attributes.carbonCopy ?.length > 0)
              this.selectedCarbonText = this.attributes.carbonCopies.map((carbon: any) => carbon.text).join(', ');

            if (this.docTypeId) {
              this.selectedDocTypeText = this.getItemName(this.docTypeId, this.docTypes, true);
            }
          }
          this.getFormDataValue();

          console.log("Attributes:", this.attributes);
          console.log("BasicAttributes:", this.basicAttributes);
          console.log("CustomAttributes:", this.customAttributes);
          console.log("customFormData:", this.customFormData);
          resolve(response);
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  showNotes: boolean = true;
  getNotes(docID: string): Promise<any> {

    return new Promise((resolve, reject) => {
      this.searchService.getNotes(this.accessToken!, docID).subscribe(
        (response) => {

          this.notes = response.data || [];
          resolve(response);
        },
        (error: any) => {
          if (error.status === 401) {
            this.showNotes = false;
            this.tabs = this.tabs.filter(tab => tab !== 'NOTES');
            resolve(null as any)
          }
          else {
            console.error(error);
            reject(error);
          }
        }
      );
    });
  }

  showLogs: boolean = true;
  getActivityLogs(docID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.searchService.getActivityLog(this.accessToken!, docID).subscribe(
        (response) => {

          this.activityLogs = response || [];
          resolve(response);
        },
        (error: any) => {
          if (error.status === 401) {
            this.showLogs = false;
            this.tabs = this.tabs.filter(tab => tab !== 'ACTIVITY_LOG');
            resolve(null as any)

          } else {
            console.error(error);
            reject(error);
          }
        }
      );
    });
  }

  getActivityLogsByDocId(docID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.searchService.getActivityLogByDocId(this.accessToken!, docID).subscribe(
        (response) => {

          this.activityLogs = response.data || [];
          resolve(response);
        },
        (error: any) => {
          if (error.status === 401) {
            this.showLogs = false;
            this.tabs = this.tabs.filter(tab => tab !== 'ACTIVITY_LOG');
            resolve(null as any)

          } else {
            console.error(error);
            reject(error);
          }
        }
      );
    });
  }

  showLinkedDoc: boolean = true;
  getLinkedDocuments(docID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.searchService.getLinkedCorrespondence(this.accessToken!, docID).subscribe(
        (response) => {

          this.linkedDocs = response.data || [];
          resolve(response);
        },
        (error: any) => {
          if (error.status === 401) {
            this.showLinkedDoc = false;
            this.tabs = this.tabs.filter(tab => tab !== 'LINKED_CORRESPONDENCE');
            resolve(null as any)

          } else {
            console.error(error);
            reject(error);
          }
        }
      );
    });
  }

  showNonArch: boolean = true;
  getNonArchAttachments(docID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.searchService.getNonArchivedAttachment(this.accessToken!, docID).subscribe(
        (response) => {

          this.nonArchAttachments = response.data || [];
          resolve(response);
        },
        (error: any) => {
          if (error.status === 401) {
            this.showNonArch = false;
            this.tabs = this.tabs.filter(tab => tab !== 'NON_ARCHIVED_ATTACHMENT');
            resolve(null as any)

          } else {
            console.error(error);
            reject(error);
          }
        }
      );
    });
  }

  showHistory: boolean = true;
  getHistory(docID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.searchService.getTransHistory(this.accessToken!, docID).subscribe(
        (response: any) => {

          this.transHistory = response.data || [];
          resolve(response);
        },
        (error: any) => {
          if (error.status === 401) {
            this.showHistory = false;
            this.tabs = this.tabs.filter(tab => tab !== 'TRANSACTION_HISTORY');
            resolve(null as any)

          } else {

            console.error(error);
            reject(error);
          }
        }
      );
    });
  }

  showAttachment: boolean = true;
  getAttachments(docID: string): Promise<AttachmentsApiResponce> {
    debugger
    // this.ctsDocumentId = Number(docID);
    console.log('from attachement service' + this.ctsDocumentId)
    return new Promise((resolve, reject) => {
      this.searchService.getAttachments(this.accessToken!, docID).subscribe(
        (response: any) => {
          debugger
          this.attachments = response || [];
          console.log('55522222')
          this.attachments = this.sortAttachments(response || []);
          console.log(this.attachments)
          this.TREE_DATA = this.transformAttachmentsToTree(this.attachments);
          this.dataSource.data = this.TREE_DATA;
          this.tryFetchOriginalDocument();
          // Expand all tree nodes by default after a short delay
          setTimeout(() => {
            this.expandAllNodes();
          }, 100);
          resolve(response);
        },
        (error: any) => {
          if (error.status === 401) {
            this.showAttachment = false;
            this.tabs = this.tabs.filter(tab => tab !== 'ATTACHMENTS');
            resolve(null as any)

          } else {
            console.error(error);
            reject(error);
          }
        }
      );
    });
  }


  tryFetchOriginalDocument(): void {


    // Recursive function to search for folder_originalMail
    const findOriginalMailFolder = (nodes: any[]): any => {
      for (const node of nodes) {
        if (node.id.toLowerCase() === 'folder_originalmail' && node.name.toLowerCase() === 'original document') {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findOriginalMailFolder(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    // Search recursively starting from root
    const originalMailFolder = findOriginalMailFolder(this.TREE_DATA);

    if (originalMailFolder ?.children ?.[0] ?.id) {
      const firstChild = originalMailFolder.children[0];
      const idParts = firstChild.id.split('_');
      if (idParts.length > 1) {
        this.selectedDocumentId = +idParts[1];
        this.getViewerUrl();
      }
    }
  }

  showVisualTrace: boolean = true;
  getVisualTracking(docID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.searchService.getVisualTracking(docID).subscribe(
        (response) => {
          this.visualTracking = response || [];
          console.log("Visual Tracking Data:", this.visualTracking);
          resolve(response);
        },
        (error: any) => {
          if (error.status === 401) {
            this.showVisualTrace = false;
            this.tabs = this.tabs.filter(tab => tab !== 'VISUAL_TRACKING');
            resolve(null as any)

          } else {
            console.error(error);
            reject(error);
          }
        }
      );
    });
  }

  getViewerUrl(): void {
    //const baseUrl = 'https://java-qatar.d-intalio.com/VIEWER/file?isCustomMode=true';
    const baseUrl = `${environment.viewerUrl}`;
    const token = this.authService.getToken();

    if (!token) {
      console.error("Token is missing or expired.");
      return;
    }

    const loggedInUserId = this.authService.getUserTypeId();
    console.log('Currrrrrent Tab' + this.current_Tab);
    let viewMode = '';

    if (this.current_Tab === 'sent' || this.current_Tab === 'complete' || this.current_Tab === 'search') {
      viewMode = 'view';
    } else if (this.current_Tab === 'new') {
      viewMode = 'edit';
    }



    const currentLang = this.translate.currentLang;

    const params2 = {
      documentId: this.selectedDocumentId,
      language: currentLang,
      token: encodeURIComponent(token),
      version: 'autocheck',
      structId: 1,
      ctsTransferId: this.ctsTransferId,
      ctsDocumentId: this.ctsDocumentId
    };
    const queryString2 = Object.entries(params2)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    this.sanitizer.bypassSecurityTrustResourceUrl(`https://java-qatar.d-intalio.com/VIEWER/api/document/260/version/1.2/details?&structId=1&viewermode=edit&ctsTransferId=320&ctsDocumentId=375&token=${token}`);

    const params = {
      documentId: this.selectedDocumentId,
      language: currentLang,
      token: encodeURIComponent(token),
      version: 'autocheck',
      structId: 1,
      viewermode: viewMode,
      ctsTransferId: this.ctsTransferId,
      ctsDocumentId: this.ctsDocumentId
    };
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');



    console.log('--------------------------------------------------------query string ---------------------------------------')
    console.log(queryString)

    this.documentViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${baseUrl}?${queryString}`);
    console.log("Viewer URL:", this.documentViewerUrl);
  }

  initOrgChart(): void {
    if (!this.chartContainer || !this.visualTracking || !Array.isArray(this.visualTracking)) {
      console.error('Missing required data for OrgChart initialization');
      return;
    }
    const element = this.chartContainer.nativeElement;

    // Transform data using built-in fields
    const orgChartData = this.visualTracking
      .filter(item => item && typeof item === 'object')
      .map((item: any, index: number) => {
        // Get structure name and username from lookup data
        const structure = this.structures.find(s => s.id === item.structureId) || { name: '' };
        const user = this.users.find(u => u.id === item.userId) || { name: '' };

        const isFirstNode = index === 0;
        const categoryKey = item.category.toUpperCase().replace(/\s+/g, "_");
        let categoryTranslation = this.translate.instant(`VISUAL_TRACKING.DETAILS.CATEGORY.${categoryKey}`) || item.category;

        if (categoryTranslation.startsWith('VISUAL_TRACKING')) {
          categoryTranslation = item.category;
        }
        console.log('category')
        console.log(categoryTranslation);

        let maxLength = 25;
        // Trim text to fit
        const trimmedCategory = categoryTranslation;
        const trimmedTitle =
          (isFirstNode ? (item.referenceNumber || '') : `${structure.name || ''} / ${user ?.fullName || ''}`);

        const trimmedCreatedBy =
          (isFirstNode ? (item.createdBy || '') : user ?.fullName || '');

        return {
          id: String(item.id || Math.random()),
          pid: item.parentId ? String(item.parentId) : null,
          category: isFirstNode ? categoryTranslation : categoryTranslation,                                 //(item.category || '') : (item.category || ''),
          title: isFirstNode ? (item.referenceNumber || '') : `${structure.name || ''} / ${user ?.fullName || ''}`,
          createdBy: isFirstNode ? (item.createdBy || '') : user ?.fullName || '',
          date: isFirstNode ? (item.createdDate || '') : (item.transferDate || ''),


        };
      });

    try {
      // Define fields in the template using bracket notation
      OrgChart['templates']['myTemplate'] = Object.assign({}, OrgChart['templates']['ana']);
      OrgChart['templates']['myTemplate']['size'] = [250, 120]; // Reduced height from 140 to 120
      OrgChart['templates']['myTemplate']['defs'] = '<style>.field_0 {font-size: 16px;text-align: center;color: #0095DA;overflow: ellispsis;max-width: 100%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;display: block;}</style>';

      OrgChart['templates']['myTemplate']['node'] = '<rect x="0" y="0" width="250" height="120" fill="white" stroke="black" stroke-width="2"/>'; // White background

      // Define text fields with proper styling and labels - adjusted y positions
      OrgChart['templates']['myTemplate']['field_0'] =
        //'<text class="field_0" style="font-size: 18px;" fill="green" x="125" y="30" text-anchor="middle" title="{fullCategory}">{val}</text>';
        '<foreignObject x="10" y="10" width="230" height="30"><span class="field_0">{val}</span></foreignObject>';
      OrgChart['templates']['myTemplate']['field_1'] =
        '<text class="field_1" style="font-size: 13px;" fill="#454545" x="125" y="55" text-anchor="middle">{val}</text>';
      OrgChart['templates']['myTemplate']['field_2'] =
        '<text class="field_2" style="font-size: 13px;" fill="#454545" x="125" y="80" text-anchor="middle">{val}</text>';
      OrgChart['templates']['myTemplate']['field_3'] =
        '<text class="field_3" style="font-size: 13px;" fill="#454545" x="125" y="105" text-anchor="middle">{val}</text>';

      const config = {
        template: "myTemplate",
        nodes: orgChartData,
        nodeBinding: {
          field_0: 'category',
          field_1: 'title',
          field_2: 'createdBy',
          field_3: 'date',
        },
        enableSearch: false,
        enableDragDrop: false,
        layout: OrgChart.normal,
        orientation: OrgChart.orientation.top,
        levelSeparation: 50, // Reduced from 80 to 50
        siblingSeparation: 30, // Reduced from 40 to 30
        subtreeSeparation: 30, // Reduced from 40 to 30
        padding: 20,
        mouseScrool: OrgChart.action.zoom,
        nodeMouseClick: OrgChart.action.details,
        //nodeMouseClick: (event: Event, data: any) => {
        //  debugger;
        //  // When a node is clicked, hide the trimmedcategory field in the details popup
        //  const trimmedCategoryField = document.querySelector('[data-binding="category"]');
        //  const fullCategoryField = document.querySelector('[data-binding="Category"]');
        //  if (trimmedCategoryField) {
        //    (trimmedCategoryField as HTMLElement).style.display = 'none';
        //  }

        //  if (fullCategoryField) {
        //    (fullCategoryField as HTMLElement).style.display = 'block';
        //  }
        //},
        showXScroll: true,
        showYScroll: true,
        miniMap: false,
        scaleInitial: 1,
        scale: {
          min: 0.4,
          max: 2
        },
        toolbar: {
          layout: false,
          zoom: true,
          fit: true,
          expandAll: false
        },
        nodeMenu: {
          details: {
            text: this.translate.instant('VISUAL_TRACKING.DETAILS.TITLE')
          }
        },
        editForm: {
          readOnly: true,
          buttons: {
            edit: null,
            share: null,
            pdf: null
          },
          elements: [
            { type: 'textbox', label: this.translate.instant('VISUAL_TRACKING.DETAILS.CATEGORY.TITLE'), binding: 'category', readOnly: true },
            { type: 'textbox', label: this.translate.instant('VISUAL_TRACKING.DETAILS.TITLE_STRUCTURE'), binding: 'title', readOnly: true },
            { type: 'textbox', label: this.translate.instant('VISUAL_TRACKING.DETAILS.CREATED_BY_USER'), binding: 'createdBy', readOnly: true },
            { type: 'textbox', label: this.translate.instant('VISUAL_TRACKING.DETAILS.DATE'), binding: 'date', readOnly: true }
          ]
        },
        offline: true,
        licenseKey: 'none',
        enableServerLayout: false,
        useServerLayout: false,
        lazyLoading: false,
        mixedHierarchyNodesSeparation: 0,
        assistantSeparation: 0,
        partnerNodeSeparation: 0
      };

      // Destroy existing instance if it exists
      if (this.orgChart) {
        try {
          this.orgChart.destroy();
        } catch (error) {
          console.warn('Error destroying existing chart:', error);
        }
        this.orgChart = null;
      }

      // Create new instance
      this.orgChart = new OrgChart(element, config as any);
      this.chartInitialized = true;

    } catch (error) {
      console.error('Error setting up OrgChart:', error);
      this.chartInitialized = false;
    }
  }


  isEnabled(name: string): boolean {
    const attribute = this.basicAttributes ?.find((attr: BasicAttribute) => attr.Name === name);
    return attribute ? attribute.Enabled : false;
  }

  controlValues: { [key: string]: string } = {};

  getFormDataValue() {

    this.customAttributes ?.components ?.forEach((component: CustomAttributeComponent) => {
      const key = component.key;
      if (this.customFormData) {
        const value = this.customFormData[key];
        if (value && typeof value === 'object' && Object.keys(value).length === 0) {
          this.controlValues[key] = "";
        }
        else {
          this.controlValues[key] = value || component.defaultValue || "";
        }
      }
      else
        this.controlValues[key] = component.defaultValue;
    });
  }


  ngOnDestroy() {
    if (this.orgChart) {
      try {
        this.orgChart.destroy();
        this.orgChart = null;
      } catch (error) {
        console.error('Error destroying OrgChart:', error);
      }
    }
  }
  currentLang = this.translate.currentLang;

  // To get lookup names based on language
  getName(item: any): string {

    switch (this.currentLang) {
      case 'ar':
        return item ?.nameAr || item ?.name||item?.text;
      case 'fr':
        return item ?.nameFr || item ?.name||item?.text;
      default:
        return item ?.name||item?.text;
    }
  }

  sortAttachments(attachments: Attachment[]): Attachment[] {
    return attachments
      .map((attachment) => ({
        ...attachment,
        children: attachment.children ? this.sortAttachments(attachment.children) : [], // Sort children recursively
      }))
      .sort((a, b) => {
        // First sort by type
        const typeComparison = Number(a.type) - Number(b.type);
        
        // If types are the same, then sort by id
        if (typeComparison === 0) {
          // Special handling for "Original document" to always appear first
          if (a.text === "Original document") return -1;
          if (b.text === "Original document") return 1;
          
          // For other items, compare by id
          return a.id.localeCompare(b.id);
        }
        
        return typeComparison;
      });
  }
}
