import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface NewsItem {
  id: number;
  title: string;
  url?: string;
  time: number;
}

@Injectable({ providedIn: 'root' })
export class HackerNewsService {
  constructor(private http: HttpClient) {}

  getNewStoriesIds(): Observable<number[]> {
    // URL scritto in modo diretto senza interpolazioni di stringa pericolose
    return this.http.get<number[]>('https://firebaseio.com');
  }

  getStoryDetails(id: number): Observable<NewsItem | null> {
    // Forza la stringa pulita per l'ID della singola notizia
    return this.http.get<NewsItem>('https://firebaseio.com' + id + '.json').pipe(
      catchError(() => of(null))
    );
  }
}
