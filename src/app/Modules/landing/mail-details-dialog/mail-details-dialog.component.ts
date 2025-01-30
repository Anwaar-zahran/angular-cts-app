import { Component, Inject, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';

@Component({
  selector: 'app-mail-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, NgbDatepickerModule, DataTablesModule],
  templateUrl: './mail-details-dialog.component.html',
  styleUrls: ['./mail-details-dialog.component.scss']
})

export class MailDetailsDialogComponent implements AfterViewChecked {

  @ViewChild('tabsContainer', { static: false }) tabsContainer!: ElementRef;
  tabs = ['Transfer', 'Attributes', 'Attachments', 'Notes', 'Linked correspondence', 'NonArchivedAttachment', 'Visual tracking', 'Transfers history', 'Activity log'];
  isScrollable: boolean = false;
  activeTabIndex: number = 0;

  dtOptions: DataTables.Settings = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.initDtOptions();
  }
  initDtOptions() {
    this.dtOptions = {
      pageLength: 10,
      search: false,
      order: [],
      pagingType: 'full_numbers',
      paging: true,
      searching: false,
      displayStart: 0,
      // search:{search:""},
      autoWidth: false,
      // ordering: true,
      language: {
        paginate: {
          first: "<i class='text-secondary fa fa-angle-left'></i>",
          previous: "<i class='text-secondary fa fa-angle-double-left'></i>",
          next: "<i class='text-secondary fa fa-angle-double-right'></i>",
          last: "<i class='text-secondary fa fa-angle-right'></i>",
        },
      },
      dom: "tp",
      ordering: false
    };
  }

  ngAfterViewChecked() {
    if (this.tabsContainer) {
      const newScrollState = this.checkScroll();

      if (this.isScrollable !== newScrollState) {
        this.isScrollable = newScrollState;
        this.cdr.detectChanges();
      }
    }
  }

  scrollLeft() {
    if (this.tabsContainer) {
      this.tabsContainer.nativeElement.scrollBy({ left: -150, behavior: 'smooth' });
    }
  }

  scrollRight() {
    if (this.tabsContainer) {
      this.tabsContainer.nativeElement.scrollBy({ left: 150, behavior: 'smooth' });
    }
  }

  checkScroll(): boolean {
    return this.tabsContainer && this.tabsContainer.nativeElement.scrollWidth > this.tabsContainer.nativeElement.clientWidth;
  }

  setActiveTab(index: number): void {
    this.activeTabIndex = index;
  }



  Items = [
    {
      subject: 'Boeing 777F aircraft emergency equipment layout',
      date: '10/08/2020 1:54pm',
      ref: '2020/Out/04777/AS',
    },
    {
      subject: 'Boeing 777F aircraft emergency equipment layout',
      date: '10/08/2020 1:54pm',
      ref: '2020/Out/04777/AS',
    },
    {
      subject: 'Boeing 777F aircraft emergency equipment layout',
      date: '10/08/2020 1:54pm',
      ref: '2020/Out/04777/AS',
    },
  ];
}
