import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface NewsItem {
  id: number;
  title: string;
  url?: string;
  time: number;
}

const URL_STORIES = 'https://hacker-news.firebaseio.com/v0/newstories.json';
const URL_ITEM = 'https://hacker-news.firebaseio.com/v0/item/';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  allIds: number[] = [];
  displayedNews: NewsItem[] = [];
  currentIndex = 0;
  itemsPerPage = 10;
  loading = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.displayedNews = [];
    this.allIds = [];
    this.currentIndex = 0;

    this.loadAllIds();
  }

  loadAllIds(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.http.get<number[]>(URL_STORIES).subscribe({
      next: (ids) => {
        if (ids && ids.length > 0) {
          this.allIds = ids.filter(id => typeof id === 'number');
          this.loadNextBatch();
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error("Errore nel recupero degli ID:", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadNextBatch(): void {
    if (this.currentIndex >= this.allIds.length) return;

    this.loading = true;
    this.cdr.detectChanges();

    const nextBatchIds = this.allIds.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);

    const requests = nextBatchIds.map(id =>
      this.http.get<NewsItem>(URL_ITEM + id + '.json').pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(requests).pipe(
      map(stories => stories.filter((story): story is NewsItem => story !== null && !!story.title))
    ).subscribe({
      next: (newsItems) => {
        const processedItems = newsItems.map((item, index) => ({
          id: item.id || (this.currentIndex + index + 1),
          title: item.title,
          url: item.url || '',
          time: item.time || Math.floor(Date.now() / 1000)
        }));

        this.displayedNews = [...this.displayedNews, ...processedItems];
        this.currentIndex += this.itemsPerPage;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore nel download del blocco news:", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}


