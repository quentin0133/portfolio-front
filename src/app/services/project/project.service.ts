import { Injectable } from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Project } from '../../models/project';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private ENDPOINT = `${environment.API_URL}/api/projects`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.ENDPOINT)
      .pipe(
        catchError((error) => {
          console.error(error);
          return throwError(() => new Error('An error occurred in project service.'));
        })
      )
  }
}
