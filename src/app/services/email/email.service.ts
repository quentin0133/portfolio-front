import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment.development";
import {HttpClient} from "@angular/common/http";
import {Email} from "../../models/email";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private ENDPOINT = `${environment.API_URL}/api/email`;

  constructor(private http: HttpClient) {
  }

  sendEmail(email: Email): Observable<void> {
    return this.http.post<void>(`${this.ENDPOINT}/send`, email);
  }
}
