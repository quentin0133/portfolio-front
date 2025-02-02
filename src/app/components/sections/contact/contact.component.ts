import {Component, inject} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import { DropdownSelectComponent } from '../../dropdown-select/dropdown-select.component';
import { InputTextComponent } from '../../input-text/input-text.component';
import { TextareaComponent } from '../../textarea/textarea.component';
import {Email} from "../../../models/email";
import {EmailService} from "../../../services/email/email.service";
import {Observable, of} from "rxjs";
import {LoadingStatePipe, State} from "../../../pipe/loading-state/loading-state.pipe";
import {AsyncPipe, NgIf} from "@angular/common";
import {ToastrModule, ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    FormsModule,
    DropdownSelectComponent,
    InputTextComponent,
    TextareaComponent,
    AsyncPipe,
    NgIf,
    ToastrModule
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  providers: [LoadingStatePipe]
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

  constructor(
    private emailService: EmailService
  ) {}

  onSubmit(event: any, ngForm: NgForm) {
    event.preventDefault();

    if (ngForm.invalid) return;

    this.isLoadingEmail = true;

    this.emailService.sendEmail(this.email)
      .subscribe({
        next: () => {
          this.isLoadingEmail = false;
          this.toastr.success('Je vous répondrai dès que je pourrais.', 'Email envoyé avec succès !');
        },
        error: (err) => {
          this.isLoadingEmail = false;
          console.log(err);
          this.toastr.error('Veuillez réessayer plus tard.', 'Une erreur s\'est produit !');
        }
      })
  }
}
