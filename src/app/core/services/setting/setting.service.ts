import { Injectable } from '@angular/core';
import {forkJoin, map, Observable, shareReplay, take} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../../../environments/environment";
import {Setting} from "../../models/setting";
import {StatusJob} from "../../models/status-job";

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  private ENDPOINT = `${environment.API_URL}/api/settings`;

  constructor(private http: HttpClient) {}

  getSearchJobStatus(): Observable<StatusJob> {
    let sources = [
      this.http.get<Setting>(`${this.ENDPOINT}/status-job-bg-color-light`),
      this.http.get<Setting>(`${this.ENDPOINT}/status-job-bg-color-dark`),
      this.http.get<Setting>(`${this.ENDPOINT}/status-job`)
    ];

    return forkJoin(sources).pipe(
      shareReplay(1),
      take(1),
      map(([jobStatusColorRes, jobStatusColorDarkRes, statusJobRes]) =>({
        statusJobBgColorLight: jobStatusColorRes.value,
        statusJobBgColorDark: jobStatusColorDarkRes.value,
        statusJob: statusJobRes.value
      }))
    );
  }
}
