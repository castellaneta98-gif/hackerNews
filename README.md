# 📰 Hacker News Dashboard

Una dashboard sviluppata in **Angular** che mostra in tempo reale le ultime news pubblicate su [Hacker News](https://news.ycombinator.com/), con titolo, link e data di pubblicazione.

## 🔗 Demo Live

- 🌐 **GitHub Pages:** [castellaneta98-gif.github.io/hackerNews](https://castellaneta98-gif.github.io/hackerNews/)
- 🔥 **Firebase Hosting:** [hacker-news-d60cf.web.app](https://hacker-news-d60cf.web.app)

## 📖 Descrizione

L'applicazione recupera l'elenco degli ID delle ultime news pubblicate tramite le API pubbliche di Hacker News, quindi carica in maniera ottimizzata solo i dettagli delle prime 10 news. Un pulsante **"Load more"** permette di caricare progressivamente altri 10 risultati alla volta, evitando di sovraccaricare l'applicazione con centinaia di richieste HTTP simultanee.

## ✨ Funzionalità

- 📋 Visualizzazione delle ultime news con titolo, link e data di pubblicazione
- ⚡ Caricamento progressivo a blocchi di 10 elementi (paginazione tramite "Load more")
- 🔄 Gestione dello stato di caricamento (loading spinner)
- 🛡️ Gestione degli errori di rete, con fallback per singole richieste fallite
- 📱 Interfaccia responsive

## 🛠️ Stack Tecnologico

- **[Angular](https://angular.dev/)** — framework principale (standalone components)
- **RxJS** — gestione delle chiamate HTTP asincrone (`forkJoin`, `catchError`, `map`)
- **HttpClient** — comunicazione con le API esterne
- **[Hacker News API](https://github.com/HackerNews/API)** — fonte dei dati (Firebase-based API)

## 📂 Struttura del progetto
hackerNews/
├── public/ # Asset statici
├── src/
│ └── app/
│ ├── app.ts # Componente principale: logica di fetch e paginazione
│ ├── app.html # Template della dashboard
│ ├── app.css # Stili del componente
│ ├── app.config.ts # Configurazione dell'applicazione Angular
│ ├── app.routes.ts # Configurazione delle rotte
│ └── app.spec.ts # Test del componente
├── index.html
├── main.ts # Entry point dell'applicazione
├── styles.css # Stili globali
├── angular.json # Configurazione Angular CLI
├── firebase.json # Configurazione Firebase Hosting
└── package.json

## 🌐 API utilizzate

L'app comunica con le API pubbliche di Hacker News (basate su Firebase):

1. **Lista degli ID delle ultime news:**
GET https://hacker-news.firebaseio.com/v0/newstories.json

Restituisce un array di circa 500 ID numerici.

2. **Dettaglio di una singola news:**
GET https://hacker-news.firebaseio.com/v0/item/{id}.json

Restituisce titolo, link, autore, timestamp e altre informazioni relative alla news.

## 🚀 Installazione e avvio in locale

Clona il repository:

```bash
git clone https://github.com/castellaneta98-gif/hackerNews.git
cd hackerNews
```

Installa le dipendenze:

```bash
npm install
```

Avvia il server di sviluppo:

```bash
ng serve
```

L'applicazione sarà disponibile su `http://localhost:4200/`.

## 📦 Build di produzione

```bash
ng build
```

I file compilati verranno generati in `dist/hackerNews/browser`.

## ☁️ Deploy

### GitHub Pages

```bash
ng deploy --base-href=/hackerNews/
```

### Firebase Hosting

```bash
ng build
firebase deploy
```

> Assicurarsi che il campo `public` in `firebase.json` punti a `dist/hackerNews/browser`.

## 👤 Autore

**Giuseppe Castellaneta**
[GitHub](https://github.com/castellaneta98-gif)
