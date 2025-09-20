import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MediaProcessingService {
  private readonly baseUrl = environment.snapCutApiUrl;
  private http: HttpClient = inject(HttpClient);

  public getVideoThumbnails(file: File): Observable<string[]> {
    const formData = new FormData();
    formData.append('video', file);
    return this.http.post<string[]>(
      this.baseUrl + '/public/thumbnails',
      formData
    );
  }

  public extractAudio(file: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.baseUrl + '/public/extract-audio', formData, {
      responseType: 'blob',
    });
  }
}
