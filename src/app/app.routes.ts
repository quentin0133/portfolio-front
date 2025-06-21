import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { PageNotFoundComponent } from './features/page-not-found/page-not-found.component';
import {LicenseAndLegalNoticeComponent} from "./features/license-and-legal-notice/license-and-legal-notice.component";

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'licence-et-mention-legale', component: LicenseAndLegalNoticeComponent },
  { path: '404', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/404', pathMatch: 'full' },
];
