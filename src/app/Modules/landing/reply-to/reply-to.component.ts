import { Component, Inject, OnInit, EventEmitter, Output, NgModule } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LookupsService } from '../../../services/lookups.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Add this import
import { MailsService } from '../../../services/mail.service';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-reply-to',
  imports: [
    CommonModule, MatDialogModule, NgSelectModule,
    MatDatepickerModule, 
    MatInputModule, ReactiveFormsModule,
    MatNativeDateModule, FormsModule],
  templateUrl: './reply-to.component.html',
  styleUrl: './reply-to.component.scss'
})
export class ReplyToComponent {
  purposes: any[] = [];
  replyForm!: FormGroup;
  accessToken: string | null = null;
  to: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router, private fb: FormBuilder,
    private lookupsService: LookupsService,
    private authService: AuthService, private toaster: ToasterService,
    private dialogRef: MatDialogRef<ReplyToComponent>, private mailService: MailsService
  ) { }

  ngOnInit(): void {
    this.accessToken = this.authService.getToken();
    if (!this.accessToken) {
      this.router.navigate(['/login']);
      return;
    }
    this.setupForm();
    this.loadLookupData();
    this.to = this.data.data.toUser ? this.data.data.toUser : this.data.data.toStructure;
  }


  setupForm(): void {
    this.replyForm = this.fb.group({
      purpose: [null, Validators.required],
      dueDate: [null],
      txtArea: [null],
      
    });
  }

  loadLookupData(): void {
  


    this.lookupsService.getPurposes(this.accessToken!).subscribe(
      (response) => {
        this.purposes = response || [];
      },
      (error) => {
        console.error('Error loading priorities:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.replyForm.valid) {
      const formValues = this.replyForm.value;

      const itemData = {
        id: this.data.data.documentId, 
        transferId: this.data.data.id,
        documentId: this.data.data.documentId,
        dueDate: this.formatDate(formValues.dueDate),
        purposeId: formValues.purpose,
        instruction: formValues.txtArea 
      };

      this.mailService.replyToMail(this.accessToken!, itemData).subscribe(
        (response) => {
         // this.toaster.showToaster(response.message ?? "Sent successfully");
          this.onClose();
        },
        (error) => {
         // this.toaster.showToaster("Something went wrong");
          console.error('Error loading priorities:', error);
        }
      );
      console.log("data", itemData)
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
