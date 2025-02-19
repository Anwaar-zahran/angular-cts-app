import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
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
// Import OrgChart from @balkangraph/orgchart.js
import OrgChart from '@balkangraph/orgchart.js';
import { LookupsService } from '../../../services/lookups.service';
import { ToasterService } from '../../../services/toaster.service';
import { ToasterComponent } from '../../shared/toaster/toaster.component';
import { DatePipe } from '@angular/common';

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

  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  @ViewChild('tabsContainer', { static: false }) tabsContainer!: ElementRef;
  closeDialog() {
    debugger
    this.dialogRef.close(); // Ensure it only closes the dialog
  }
  accessToken: string | null = null;
  tabs = [
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
    private lookupsService: LookupsService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<MailDetailsDialogComponent>,
    private translate: TranslateService,
    private toaster: ToasterService,
    public datePipe: DatePipe
  ) {
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
  }

  ngOnInit(): void {
    console.log('Dialog opened with ID:', this.data.id, 'and Reference Number:', this.data.referenceNumber);
    this.accessToken = this.authService.getToken();
    //if (!this.accessToken) {
    //  debugger
    //  this.router.navigate(['/login']);
    //  return;
    //}
    this.initDtOptions();
    this.loadLookupData();
    this.fetchDetails(this.data.id);
    console.log("row", this.data.row);


  }

  loadLookupData(): void {
    this.lookupsService.getEntities().subscribe(
      (structures) => {
        this.structures = structures;
      },
      (error) => {
        console.error('Error loading structures:', error);
      }
    );

    this.lookupsService.getUsers(this.accessToken!).subscribe(
      (users) => {
        this.users = users;
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );

    this.lookupsService.getImportance(this.accessToken!).subscribe(
      (response) => {
        this.importance = response;
        console.log(this.importance)
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );

    this.lookupsService.getClassfication(this.accessToken!).subscribe(
      (response) => {
        this.classification = response;
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );

    this.lookupsService.getPriorities(this.accessToken!).subscribe(
      (response) => {
        this.priority = response;
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );

    this.lookupsService.getPrivacy(this.accessToken!).subscribe(
      (response) => {
        this.privacy = response;
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );

    this.lookupsService.getDocumentTypes(this.accessToken!).subscribe(
      (response) => {
        this.docTypes = response.data || [];
      },
      (error) => {
        console.error('Error loading structures:', error);
      }
    );

    this.lookupsService.getCarbonUsers(this.accessToken!).subscribe(
      (response) => {

        this.carbonUsers = response;
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );

    this.lookupsService.getCategories(undefined).subscribe(
      (response) => {
        this.categories = response || [];
      },
      (error: any) => {
        console.error(error);
      }
    );
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
      drawCallback: (settings: any) => {
        const api = settings.oInstance.api();
        const pageInfo = api.page.info();
        const pagination = $(api.table().container()).find('.dataTables_paginate');
        pagination.find('input.paginate-input').remove();
        const page = $('<span class="d-inline-flex align-items-center mx-2">' + this.translate.instant('COMMON.PAGE') + '<input type="number" class="paginate-input form-control form-control-sm mx-2" min="1" max="' + pageInfo.pages + '" value="' + (pageInfo.page + 1) + '"> ' + this.translate.instant('COMMON.FROM') + ' ' + pageInfo.pages + '</span>');


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
    debugger
    this.searchService.CheckDocumentAttachmnentISLocked(this.accessToken!, this.data.documentId).subscribe(
      (isLocked: boolean) => {
        console.log('Document is locked:', isLocked);
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
           // this.dialogRef.close();
          });
        }
      },
      (error) => {
        console.error('Error checking document lock:', error);
      }
    );
    debugger

  }

  showModalReply() {
    const dialogRef = this.dialog.open(ReplyToComponent, {
      disableClose: true,
      width: '50%',
      data: { data: this.data.row }
    });

    dialogRef.afterClosed().subscribe(result => {
      debugger
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
    return nodes;
  }

  // Update the createTreeNode method to set expanded by default
  private createTreeNode(attachment: any): TreeNode {
    const node: TreeNode = {
      id: attachment.id,
      name: attachment.name || attachment.text || 'Unnamed Attachment',
      expanded: true
    };

    if ((attachment.children && attachment.children.length > 0) ||
      (attachment.childAttachments && attachment.childAttachments.length > 0)) {
      const childrenData = attachment.children || attachment.childAttachments;
      node.children = childrenData.map((child: any) => this.createTreeNode(child));
    }
    return node;
  }

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
    // If the Visual Tracking tab is active (index 5) and org chart data is ready, initialize OrgChart
    if (this.activeTabIndex === 5 && this.visualTracking && !this.chartInitialized) {
      this.initOrgChart();
      this.chartInitialized = true;
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

    // If switching to Visual Tracking tab (index 5)
    if (index === 5 && this.visualTracking) {
      this.chartInitialized = false; // Reset initialization flag
      // Short delay to ensure container is visible
      setTimeout(() => {
        this.initOrgChart();
      }, 250);
    }
  }

  async fetchDetails(docID: string): Promise<void> {
    try {
      const [
        attributes,
        nonArchAttachments,
        linkedDocs,
        activityLogs,
        notes,
        transHistory,
        attachments,
        visualTracking
      ] = await Promise.all([
        this.getAttributes(docID),
        this.getNonArchAttachments(docID),
        this.getLinkedDocuments(docID),
        this.data.fromSearch ? this.getActivityLogs(docID) : this.getActivityLogsByDocId(docID),
        this.getNotes(docID),
        this.getHistory(docID),
        this.getAttachments(docID),
        this.getVisualTracking(docID)
      ]);

      this.attributes = attributes;
      this.nonArchAttachments = nonArchAttachments.data;
      this.linkedDocs = linkedDocs.data;
      this.activityLogs = this.data.fromSearch ? activityLogs : activityLogs.data;

      this.notes = notes.data;
      this.transHistory = transHistory.data;
      this.attachments = attachments;
      this.visualTracking = visualTracking;
      this.classId = this.attributes.classificationId ?? '';
      this.importanceId = this.attributes.importanceId ?? '';
      this.privacyId = this.attributes.privacyId ?? '';
      this.priorityId = this.attributes.priorityId ?? '';
      this.docTypeId = this.attributes.documentTypeId ?? '';

      debugger;
      if (this.linkedDocs.length > 0) {
        this.mappedArray = this.linkedDocs.map((doc: any) => {
          const foundItem = this.categories.find((cat: any) => cat.id === doc.categoryId);
          return {
            id: doc.id,
            linkedDocumentReferenceNumber: doc.linkedDocumentReferenceNumber,
            categoryId: doc.categoryId,
            statusId: doc.statusId,
            linkedBy: doc.linkedBy,
            createdDate: doc.createdDate,
            category: foundItem ? foundItem.text : '',
          };
        });
      }


      if (this.attributes.carbonCopy ?.length > 0)
        this.userId = this.attributes.carbonCopy;
      else
        this.userId = [];

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
          this.customAttribute = JSON.parse(response ?.customAttributes);
          this.customAttributes = JSON.parse(response ?.customAttributes);
          this.customFormData = JSON.parse(response ?.formData);

          this.getFormDataValue();

          console.log("Attributes:", this.attributes);
          console.log("BasicAttributes:", this.basicAttributes);
          console.log("CustomAttributes:", this.customAttribute);
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

  getNotes(docID: string): Promise<any> {

    return new Promise((resolve, reject) => {
      this.searchService.getNotes(this.accessToken!, docID).subscribe(
        (response) => {
          this.notes = response.data || [];
          resolve(response);
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  getActivityLogs(docID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.searchService.getActivityLog(this.accessToken!, docID).subscribe(
        (response) => {
          this.activityLogs = response || [];
          resolve(response);
        },
        (error: any) => {
          console.error(error);
          reject(error);
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
          console.error(error);
          reject(error);
        }
      );
    });
  }

  getLinkedDocuments(docID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.searchService.getLinkedCorrespondence(this.accessToken!, docID).subscribe(
        (response) => {
          this.linkedDocs = response.data || [];
          resolve(response);
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  getNonArchAttachments(docID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.searchService.getNonArchivedAttachment(this.accessToken!, docID).subscribe(
        (response) => {
          this.nonArchAttachments = response.data || [];
          resolve(response);
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  getHistory(docID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.searchService.getTransHistory(this.accessToken!, docID).subscribe(
        (response: any) => {
          this.transHistory = response.data || [];
          resolve(response);
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  getAttachments(docID: string): Promise<AttachmentsApiResponce> {
    return new Promise((resolve, reject) => {
      this.searchService.getAttachments(this.accessToken!, docID).subscribe(
        (response: any) => {
          this.attachments = response || [];
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
          console.error(error);
          reject(error);
        }
      );
    });
  }


  tryFetchOriginalDocument(): void {


    // Recursive function to search for folder_originalMail
    const findOriginalMailFolder = (nodes: any[]): any => {
      for (const node of nodes) {
        if (node.id === 'folder_originalMail' && node.name === 'Original document') {
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
    debugger
    if (originalMailFolder ?.children ?.[0] ?.id) {
      const firstChild = originalMailFolder.children[0];
      const idParts = firstChild.id.split('_');
      if (idParts.length > 1) {
        this.selectedDocumentId = +idParts[1];
        this.getViewerUrl();
      }
    }
  }

  getVisualTracking(docID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.searchService.getVisualTracking(docID).subscribe(
        (response) => {
          this.visualTracking = response || [];
          console.log("Visual Tracking Data:", this.visualTracking);
          resolve(response);
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  getViewerUrl(): void {
    debugger
    //const baseUrl = 'https://java-qatar.d-intalio.com/VIEWER/file?isCustomMode=true';
    const baseUrl = `${environment.viewerUrl}`;
    const token = this.authService.getToken();

    if (!token) {
      console.error("Token is missing or expired.");
      return;
    }

    const params = {
      documentId: this.selectedDocumentId,
      language: 'en',
      token: encodeURIComponent(token),
      version: 'autocheck',
      structId: 1,
      viewermode: 'view'
    };

    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    this.documentViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${baseUrl}?${queryString}`);
    console.log("Viewer URL:", this.documentViewerUrl);
  }

  initOrgChart(): void {
    debugger
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
        return {
          id: String(item.id || Math.random()),
          pid: item.parentId ? String(item.parentId) : null,
          category: isFirstNode ? (item.category || '') : (item.category || ''),
          title: isFirstNode ? (item.referenceNumber || '') : `${structure.name || ''} / ${user ?.fullName || ''}`,
          createdBy: isFirstNode ? (item.createdBy || '') : user ?.fullName || '',
          date: isFirstNode ? (item.createdDate || '') : (item.transferDate || '')
        };
      });

    try {
      // Define fields in the template using bracket notation
      OrgChart['templates']['myTemplate'] = Object.assign({}, OrgChart['templates']['ana']);
      OrgChart['templates']['myTemplate']['size'] = [250, 120]; // Reduced height from 140 to 120

      // Define text fields with proper styling and labels - adjusted y positions
      OrgChart['templates']['myTemplate']['field_0'] =
        '<text class="field_0" style="font-size: 18px;" fill="#454545" x="125" y="30" text-anchor="middle">{val}</text>';
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
          field_0: "category",
          field_1: "title",
          field_2: "createdBy",
          field_3: "date"
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
          details: { text: "Details" }
        },
        editForm: {
          readOnly: true,
          buttons: {
            edit: null,
            share: null,
            pdf: null
          },
          elements: [
            { type: 'textbox', label: 'Category', binding: 'category', readOnly: true },
            { type: 'textbox', label: 'Title/Structure', binding: 'title', readOnly: true },
            { type: 'textbox', label: 'Created By/User', binding: 'createdBy', readOnly: true },
            { type: 'textbox', label: 'Date', binding: 'date', readOnly: true }
          ]
        }
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

  // To get lookup names based on language
  getName(item: any): string {

    const currentLang = this.translate.currentLang;
    switch (currentLang) {
      case 'ar':
        return item ?.nameAr || item ?.name;
      case 'fr':
        return item ?.nameFr || item ?.name;
      default:
        return item ?.name;
    }
  }
}
