import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LookupsService } from '../../../services/lookups.service';
import { SearchPageService } from '../../../services/search-page.service';
import { AuthService } from '../../auth/auth.service';

declare var OrgChart: any;

@Component({
  selector: 'app-visual-tracking',
  templateUrl: './visual-tracking.component.html',
  styleUrls: ['./visual-tracking.component.css'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, TranslateModule]
})
export class VisualTrackingComponent implements OnInit, OnDestroy {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  private orgChart: any = null;
  private chartInitialized: boolean = false;

  // Lookup data
  structures: any[] = [];
  users: any[] = [];
  visualTracking: any;

  constructor(
    private authService: AuthService,
    private searchService: SearchPageService,
    private lookupsService: LookupsService,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: { documentId: string, referenceNumber: string }
  ) {
    console.log("Data:", this.data);

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
  }

  ngOnInit() {

    this.loadLookupData();
    if (this.data.documentId) {
      this.getVisualTracking(this.data.documentId);
    }
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

    const token = this.authService.getToken();
    if (token) {
      this.lookupsService.getUsers(token).subscribe(
        (users) => {
          this.users = users;
        },
        (error) => {
          console.error('Error loading users:', error);
        }
      );
    }
  }

  getVisualTracking(docID: string): void {
    this.searchService.getVisualTracking(docID).subscribe(
      (response) => {
        this.visualTracking = response || [];
        console.log("Visual Tracking Data:", this.visualTracking);

        setTimeout(() => {
          this.initOrgChart();
        }, 250);
      },
      (error) => {
        console.error('Error loading visual tracking:', error);
      }
    );
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
        const categoryKey = item.category.toUpperCase().replace(/\s+/g, "_");
        let categoryTranslation = this.translateService.instant(`VISUAL_TRACKING.DETAILS.CATEGORY.${categoryKey}`) || item.category;

        if(categoryTranslation.startsWith('VISUAL_TRACKING')){
          categoryTranslation = item.category;
        }
        console.log('category')
        console.log(categoryTranslation);


        let maxLength = 25;
        const trimmedCategory = categoryTranslation;
        const trimmedTitle =
          (isFirstNode ? (item.referenceNumber || '') : `${structure.name || ''} / ${user ?.fullName || ''}`);

        const trimmedCreatedBy =
          (isFirstNode ? (item.createdBy || '') : user ?.fullName || '');

        return {
          id: String(item.id || Math.random()),
          pid: item.parentId ? String(item.parentId) : null,
          //category: isFirstNode ? categoryTranslation : categoryTranslation,                                 //(item.category || '') : (item.category || ''),
          //title: isFirstNode ? (item.referenceNumber || '') : `${structure.name || ''} / ${user?.fullName || ''}`,
          //createdBy: isFirstNode ? (item.createdBy || '') : user?.fullName || '',
          category: isFirstNode ? trimmedCategory : trimmedCategory,
          title: isFirstNode ? trimmedTitle : trimmedTitle,
          createdBy: isFirstNode ? trimmedCreatedBy : trimmedCreatedBy,
          date: isFirstNode ? (item.createdDate || '') : (item.transferDate || '')
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
        //'<text class="field_0" style="font-size: 18px;" fill="green" x="125" y="30" text-anchor="middle">{val}</text>';
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
        mouseScrool: OrgChart.action.scroll,
        nodeMouseClick: OrgChart.action.details,
        showXScroll: true,
        showYScroll: true,
        miniMap: false,
        scaleInitial: 0.8,
        scale: {
          min: 0.4,
          max: 2
        },
        toolbar: {
          layout: false,
          zoom: true,
          fit: true,
          expandAll: false,
          zoomIn: this.translateService.instant('VISUAL_TRACKING.TOOLBAR.ZOOM'),
          zoomOut: this.translateService.instant('VISUAL_TRACKING.TOOLBAR.ZOOM'),
        },
        nodeMenu: {
          details: { text: this.translateService.instant('VISUAL_TRACKING.DETAILS.TITLE') }
        },
        editForm: {
          readOnly: true,
          buttons: {
            edit: null,
            share: null,
            pdf: null
          },
          elements: [
            { type: 'textbox', label: this.translateService.instant('VISUAL_TRACKING.DETAILS.CATEGORY.TITLE'), binding: 'category', readOnly: true },
            { type: 'textbox', label: this.translateService.instant('VISUAL_TRACKING.DETAILS.TITLE_STRUCTURE'), binding: 'title', readOnly: true },
            { type: 'textbox', label: this.translateService.instant('VISUAL_TRACKING.DETAILS.CREATED_BY_USER'), binding: 'createdBy', readOnly: true },
            { type: 'textbox', label: this.translateService.instant('VISUAL_TRACKING.DETAILS.DATE'), binding: 'date', readOnly: true }
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
