import { Component, Inject, OnInit, EventEmitter, Output, NgModule } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LookupsService } from '../../../services/lookups.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';




@Component({
  selector: 'app-reply-to',
  imports: [],
  templateUrl: './reply-to.component.html',
  styleUrl: './reply-to.component.scss'
})
export class ReplyToComponent {
  purposes: any[] = [];
  replyForm!: FormGroup;
  accessToken: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private lookupsService: LookupsService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<ReplyToComponent>
  ) { }

  loadLookupData(): void {
  


    this.lookupsService.getPurposes(this.accessToken!).subscribe(
      (reponse) => {
        this.purposes = reponse || [];
      },
      (error) => {
        console.error('Error loading priorities:', error);
      }
    );
  }


  onClose(): void {
    this.dialogRef.close();
  }
}
