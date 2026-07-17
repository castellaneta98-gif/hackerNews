import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 👈 AGGIUNGI ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { HackerNewsService, NewsItem } from './hacker-news.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

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

  // 👈 INIETTA IL DETECTOR NEL COSTRUTTORE
  constructor(
    private newsService: HackerNewsService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.displayedNews = [];
    this.allIds = [];
    this.currentIndex = 0;
    this.loadAllIdsAndFirstBatch();
  }

  loadAllIdsAndFirstBatch(): void {
    this.loading = true;
    this.cdr.detectChanges(); // Forza l'aggiornamento visivo dello spinner iniziale

    this.newsService.getNewStoriesIds().subscribe({
      next: (ids) => {
        if (ids && ids.length > 0) {
          this.allIds = ids.filter(id => typeof id === 'number').slice(5);
          this.loading = false; 
          this.loadNextBatch();
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error("Errore ID:", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadNextBatch(): void {
    if (this.currentIndex >= this.allIds.length) return;

    this.loading = true;
    this.cdr.detectChanges(); // Comunica all'HTML che lo spinner deve riattivarsi

    const nextBatchIds = this.allIds.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
    const requests = nextBatchIds.map(id => this.newsService.getStoryDetails(id));

    forkJoin(requests).pipe(
      map(stories => stories.filter((story): story is NewsItem => story !== null))
    ).subscribe({
      next: (newsItems) => {
        const processedItems = newsItems.map((item, index) => ({
          id: item.id || (this.currentIndex + index + 1),
          title: item.title || 'Titolo non disponibile',
          url: item.url || '',
          time: item.time || Math.floor(Date.now() / 1000)
        }));

        // Accumula le notizie nell'array
        this.displayedNews = [...this.displayedNews, ...processedItems];
        this.currentIndex += this.itemsPerPage;
        this.loading = false;

        // 👈 COSTRUTTO FONDAMENTALE: Costringe Angular a ridisegnare la griglia con i nuovi dati
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Errore dettagli:", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
