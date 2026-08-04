import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewsItem } from './models/news-item.model';

const STORIES_URL = 'https://hacker-news.firebaseio.com/v0/newstories.json';
const ITEM_URL = 'https://hacker-news.firebaseio.com/v0/item/';

@Injectable({
  providedIn: 'root'
})
export class HackerNewsService {

  constructor(private http: HttpClient) {}

  getStoryIds(): Observable<number[]> {
    return this.http.get<number[]>(STORIES_URL);
  }

  getItem(id: number): Observable<NewsItem> {
    return this.http.get<NewsItem>(`${ITEM_URL}${id}.json`);
  }
}