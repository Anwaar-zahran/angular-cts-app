import { Component, Inject, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';

import { MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AuthService } from '../../auth/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SearchPageService } from '../../../services/search-page.service';
import { Router } from '@angular/router';
import { AttachmentsApiResponce } from '../../../models/attachments.model';
import { DocAttributesApiResponse } from '../../../models/searchDocAttributes.model';


// Import OrgChart from @balkangraph/orgchart.js
import OrgChart from '@balkangraph/orgchart.js';
import { LookupsService } from '../../../services/lookups.service';

interface TreeNode {
  id: number;
  name: string;
  children?: TreeNode[];
}

interface FlatTreeNode {
  id: number;
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
    selector: 'app-mail-details-dialog',
    imports: [
        CommonModule,
        MatDialogModule,
        NgbDatepickerModule,
        DataTablesModule,
        MatTreeModule
    ],
    templateUrl: './mail-details-dialog.component.html',
    styleUrls: ['./mail-details-dialog.component.scss']
})
export class MailDetailsDialogComponent implements AfterViewChecked, OnInit, OnDestroy {

  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  @ViewChild('tabsContainer', { static: false }) tabsContainer!: ElementRef;

  accessToken: string | null = null;
  tabs = [
    'Attributes',
    'Attachments',
    'Notes',
    'Linked correspondence',
    'NonArchivedAttachment',
    'Visual tracking',
    'Transfers history',
    'Activity log'
  ];
  isScrollable: boolean = false;
  activeTabIndex: number = 0;
  selectedNode: any = null;

  dtOptions: DataTables.Settings = {};

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
  notes: any;
  transHistory: any;
  attachments: any;
  // Visual Tracking data (org chart data)
  visualTracking: any;

  // OrgChart references
  private orgChart: any = null;
  private chartInitialized: boolean = false;

  // Lookup data
  structures: any[] = [];
  users: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { row: any, id: string, referenceNumber: string, fromSearch:boolean },
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private searchService: SearchPageService,
    private lookupsService: LookupsService
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
  }

  ngOnInit(): void {
    console.log('Dialog opened with ID:', this.data.id, 'and Reference Number:', this.data.referenceNumber);
    this.accessToken = this.authService.getToken();
    if (!this.accessToken) {
      this.router.navigate(['/login']);
      return;
    }
    this.initDtOptions();
    this.loadLookupData();
    this.fetchDetails(this.data.id);
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
  }

  initDtOptions(): void {
    this.dtOptions = {
      pageLength: 10,
      search: false,
      order: [],
      pagingType: 'full_numbers',
      paging: true,
      searching: false,
      displayStart: 0,
      autoWidth: false,
      language: {
        paginate: {
          first: "<i class='text-secondary fa fa-angle-left'></i>",
          previous: "<i class='text-secondary fa fa-angle-double-left'></i>",
          next: "<i class='text-secondary fa fa-angle-double-right'></i>",
          last: "<i class='text-secondary fa fa-angle-right'></i>"
        }
      },
      dom: "tp",
      ordering: false
    };
  }

  // Recursively transform attachments into a tree structure
  private transformAttachmentsToTree(mailAttachments: any[]): TreeNode[] {
    return mailAttachments.map(attachment => this.createTreeNode(attachment));
  }

  private createTreeNode(attachment: any): TreeNode {
    const node: TreeNode = {
      id: attachment.id,
      name: attachment.name || attachment.text || 'Unnamed Attachment'
    };

    if ((attachment.children && attachment.children.length > 0) ||
      (attachment.childAttachments && attachment.childAttachments.length > 0)) {
      const childrenData = attachment.children || attachment.childAttachments;
      node.children = childrenData.map((child: any) => this.createTreeNode(child));
    }
    return node;
  }

  // Transformer for the Angular Material tree
  private _transformer = (node: TreeNode, level: number): FlatTreeNode => ({
    id: node.id,
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level: level
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
      debugger;
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

  getAttributes(docID: string): Promise<DocAttributesApiResponse> {
    return new Promise((resolve, reject) => {
      this.searchService.getDocAttributes(this.accessToken!, docID).subscribe(
        (response: any) => {
          this.attributes = response || [];
          console.log("Attributes:", this.attributes);
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
          debugger;
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
          resolve(response);
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
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
    const baseUrl = 'https://java-qatar.d-intalio.com/VIEWER/file';
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
          title: isFirstNode ? (item.referenceNumber || '') : `${structure.name || ''} / ${user?.fullName || ''}`,
          createdBy: isFirstNode ? (item.createdBy || '') : user?.fullName || '',
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
}
