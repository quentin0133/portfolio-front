import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DropdownSelectComponent } from '../../../shared/components/dropdown-select/dropdown-select.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TextareaComponent } from '../../../shared/components/textarea/textarea.component';
import { Email } from '../../../core/models/email';
import { LoadingStatePipe } from '../../../shared/pipe/loading-state/loading-state.pipe';
import { NgIf } from '@angular/common';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { EmailService } from '../../../core/services/email/email.service';
import { BgContactComponent } from './bg-contact/bg-contact.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    FormsModule,
    DropdownSelectComponent,
    InputTextComponent,
    TextareaComponent,
    NgIf,
    ToastrModule,
    BgContactComponent,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  providers: [LoadingStatePipe],
})
export class ContactComponent {
  private toastr = inject(ToastrService);

  isLoadingEmail: boolean = false;

  email: Email = {
    email: '',
    message: '',
    name: '',
    subject: '',
  };

  constructor(private emailService: EmailService) {}

  onSubmit(event: any, ngForm: NgForm) {
    event.preventDefault();

    if (ngForm.invalid) {
      Object.values(ngForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.isLoadingEmail = true;

    this.emailService.sendEmail(this.email).subscribe({
      next: () => {
        this.isLoadingEmail = false;
        this.toastr.success(
          'Je vous répondrai dès que je pourrais',
          'Email envoyé avec succès !',
        );
      },
      error: (err) => {
        this.isLoadingEmail = false;
        console.error(err);
        this.toastr.error(
          'Veuillez réessayer plus tard.',
          "Une erreur s'est produit !",
        );
      },
    });
  }

  protected readonly console = console;
}
