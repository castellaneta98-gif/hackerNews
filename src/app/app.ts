import { Component, OnInit, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HackerNewsService } from './hacker-news';
import { NewsItem } from './models/news-item.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  displayedNews = signal<NewsItem[]>([]);
  loading = signal(false);
  error = signal(false);

  private allIds: number[] = [];
  private currentIndex = 0;
  private itemsPerPage = 10;

  constructor(private newsService: HackerNewsService) {}

  ngOnInit(): void {
    this.loadAllIds();
  }

  loadAllIds(): void {
    this.loading.set(true);
    this.error.set(false);

    this.newsService.getStoryIds().subscribe({
      next: (ids) => {
        if (ids && ids.length > 0) {
          this.allIds = ids.filter(id => typeof id === 'number');
          this.loadNextBatch();
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Errore nel recupero degli ID:', err);
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  loadNextBatch(): void {
    if (this.currentIndex >= this.allIds.length) return;

    this.loading.set(true);

    const nextBatchIds = this.allIds.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);

    const requests = nextBatchIds.map(id =>
      this.newsService.getItem(id).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(requests).pipe(
      map(stories => stories.filter((story): story is NewsItem => story !== null && !!story.title))
    ).subscribe({
      next: (newsItems) => {
        this.displayedNews.update(current => [...current, ...newsItems]);
        this.currentIndex += this.itemsPerPage;
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore nel download del blocco news:', err);
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }
}

