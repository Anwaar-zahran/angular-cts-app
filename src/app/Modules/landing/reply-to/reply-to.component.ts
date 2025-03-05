import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { LookupsService } from '../../../services/lookups.service';
import { MailsService } from '../../../services/mail.service';
import { ToasterService } from '../../../services/toaster.service';
import { AuthService } from '../../auth/auth.service';
import { ToasterComponent } from '../../shared/toaster/toaster.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-reply-to',
  imports: [
    CommonModule, MatDialogModule, NgSelectModule,
    MatDatepickerModule,
    MatInputModule, ReactiveFormsModule,
    MatNativeDateModule, FormsModule, ToasterComponent, TranslateModule],
  templateUrl: './reply-to.component.html',
  styleUrl: './reply-to.component.scss',
})

export class ReplyToComponent {
  purposes: any[] = [];
  replyForm!: FormGroup;
  accessToken: string | null = null;
  to: string | null = null;
  minDate: Date = new Date();
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router, private fb: FormBuilder,
    private lookupsService: LookupsService,
    private authService: AuthService, private toaster: ToasterService,
    private dialogRef: MatDialogRef<ReplyToComponent>, private mailService: MailsService,
    private translate: TranslateService

  ) { }

  ngOnInit(): void {
    this.accessToken = this.authService.getToken();
    //if (!this.accessToken) {
    //  this.router.navigate(['/login']);
    //  return;
    //}
    this.setupForm();
    this.loadLookupData();
    this.to = this.data.data.fromUser
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
          this.translate.get('REPLY_DIALOG.SENT').subscribe((msg: string) => {
            this.toaster.showToaster(response ?? msg);
          });
          //  this.toaster.showToaster(response??"Sent successfully");
          this.onClose(true);
        },
        (error) => {
          //this.toaster.showToaster(error.error.text??"Something went wrong");
          this.translate.get('REPLY_DIALOG.ERROR').subscribe((msg: string) => {
            if (error.error.text == "FileInUse")
              this.translate.get('REPLY_DIALOG.FILEINUSEERROR').subscribe((msg: string) => { this.toaster.showToaster(msg) });
            else
              this.toaster.showToaster(error.error.text ?? msg);
          });
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

  onClose(shouldCloseParent: boolean = false): void {
    this.dialogRef.close({ shouldCloseParent });
  }
  
  preventPaste(event:ClipboardEvent){
    event.preventDefault();
  }

  preventInput(event: KeyboardEvent): void {
    event.preventDefault();
  }

}
