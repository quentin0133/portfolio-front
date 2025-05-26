import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {Email} from "../../models/email";

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
