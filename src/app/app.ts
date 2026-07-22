import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private newsService: HackerNewsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initialFetch();
  }

  // Pulisce in modo radicale la memoria ad ogni refresh prima di chiamare l'API
  initialFetch(): void {
    this.allIds = [];
    this.displayedNews = [];
    this.currentIndex = 0;
    this.loading = true;
    this.cdr.detectChanges();

    this.newsService.getNewStoriesIds().subscribe({
      next: (ids) => {
        if (ids && ids.length > 0) {
          // Filtra gli ID garantendo che siano numeri reali
          this.allIds = ids.filter(id => typeof id === 'number').slice(5);
          
          // Forza lo sblocco del flag prima di iniettare il primo blocco da 10
          this.loading = false;
          this.loadNextBatch();
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error("Errore nel recupero degli ID primari:", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadNextBatch(): void {
    if (this.loading) return;
    if (this.currentIndex >= this.allIds.length) return;

    this.loading = true;
    this.cdr.detectChanges();

    const nextBatchIds = this.allIds.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
    const requests = nextBatchIds.map(id => this.newsService.getStoryDetails(id));

    forkJoin(requests).pipe(
      map(stories => stories.filter((story): story is NewsItem => story !== null))
    ).subscribe({
      next: (newsItems) => {
        // Creiamo gli oggetti puliti con i testi di fallback di sicurezza
        const processedItems = newsItems.map((item, index) => ({
          id: item.id || (this.currentIndex + index + 1),
          title: item.title || 'Titolo non disponibile',
          url: item.url || '',
          time: item.time || Math.floor(Date.now() / 1000)
        }));

        // 👈 STRUTTURA IMMUTABILE: Uniamo i vecchi elementi e i nuovi in un array totalmente fresco.
        // Questo notifica istantaneamente ad Angular che i dati sono cambiati, forzando la griglia a disegnarli.
        const updatedList = [...this.displayedNews, ...processedItems];
        this.displayedNews = updatedList;

        this.currentIndex += this.itemsPerPage;
        this.loading = false;
        
        // Ordina il ridisegno immediato della pagina
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore durante lo scaricamento dei dettagli:", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}

