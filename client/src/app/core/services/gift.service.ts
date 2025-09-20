import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DIR_LOCAL_GIFT } from '@app/shared/constants/const';
import { TOPIC_LIST } from '@app/shared/constants/gif-api-random-topics';
import { environment } from 'environments/environment.development';
import { map, Observable, of } from 'rxjs';

interface GiphyGif {
  id: string;
  images: {
    original: {
      url: string;
    };
  };
  title: string;
  type: string;
}

interface GifResponse {
  data: GiphyGif[];
}

interface GifSearchParams {
  topic: string;
  limit?: number;
  offset?: number;
  rating?: string;
  lang?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GiftService {
  private http: HttpClient = inject(HttpClient);
  private readonly apiKey = environment.gifApiKey || '';
  private readonly baseUrl = environment.gifApiBaseUrl;

  public getRandomGift(
    options: string | GifSearchParams,
    makeCall: boolean = false
  ): Observable<string> {
    if (this.apiKey == '' || !makeCall) {
      return of(this.getLocalGif());
    }

    const optionParams =
      typeof options === 'string'
        ? { topic: options, limit: 25, offset: 0 }
        : options;

    let {
      topic,
      limit = 5,
      offset = 0,
      rating = 'g',
      lang = 'en',
    } = optionParams;

    if (!topic || topic.trim() === '') {
      const random = Math.floor(Math.random() * TOPIC_LIST.length);
      const randomTopic = TOPIC_LIST[random];
      topic = randomTopic;
    }
    console.log(topic);
    const url = `${this.baseUrl}/search?api_key=${this.apiKey}&q=${topic}&limit=${limit}&offset=${offset}&rating=${rating}&lang=${lang}`;

    return this.http.get<GifResponse>(url).pipe(
      map((res: GifResponse) => {
        if (!res.data || res.data.length === 0) {
          return DIR_LOCAL_GIFT;
        }
        const randomIndex = Math.floor(Math.random() * res.data.length);
        return res.data[randomIndex].images.original.url;
      })
    );
  }

  private getLocalGif(): string {
    return DIR_LOCAL_GIFT;
  }
}
