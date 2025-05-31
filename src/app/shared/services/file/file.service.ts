import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, take } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private ENDPOINT = `${environment.API_URL}/files`;

  constructor(private http: HttpClient) {}

  findByUrl(fileUrl: string): Observable<File> {
    return this.http
      .get(`${this.ENDPOINT}/${fileUrl}`, { responseType: 'blob' })
      .pipe(
        take(1),
        map((blob) => {
          const match = fileUrl.match(/^[0-9a-fA-F-]+-(.+)$/);
          const fileName = match ? match[1] : 'fichier_inconnu';
          return new File([blob], fileName, {
            type: blob.type,
          });
        }),
      );
  }
}
