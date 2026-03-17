# waveeProjectBW - pelna dokumentacja techniczna

## 1. O czym jest ten projekt
waveeProjectBW to aplikacja webowa o muzyce. Uzytkownik moze:
- zalogowac sie przez Spotify,
- albo wejsc w tryb demo,
- szukac piosenek,
- dodawac recenzje,
- przegladac cechy audio utworu,
- generowac playlisty na podstawie gatunku albo piosenki,
- przegladac profile innych osob (modul spolecznosci).

Projekt dziala jako dwa osobne serwisy:
- frontend (React + Vite + Tailwind),
- backend (Node.js + Express + Prisma + PostgreSQL).

Jest to full-stack. Front i back gadaja przez HTTP pod adresem `/api/*`.

## 2. Szybki rzut oka na architekture

### 2.1 Schemat logiczny
1. Przegladarka odpala frontend.
2. Front wysyla zapytania do backendu (`/api`).
3. Backend:
- obsluguje autoryzacje,
- kontaktuje sie ze Spotify API,
- zapisuje dane do bazy przez Prisma.
4. Backend zwraca JSON.
5. Frontend pokazuje wynik na ekranie.

### 2.2 Najwazniejsze zaleznosci
Backend:
- `express`, `cors`, `cookie-parser`,
- `jsonwebtoken` (sesja/JWT),
- `axios` (HTTP do Spotify),
- `@prisma/client`, `prisma`.

Frontend:
- `react`, `react-router-dom`,
- `@tanstack/react-query`,
- `axios`,
- `tailwindcss`, `lucide-react`.

## 3. Backend - bardzo dokladnie

### 3.1 Punkt startowy serwera
Plik: `backend/src/index.js`

Serwer:
- laduje `.env`,
- ustawia CORS (localhost i adresy LAN),
- odpala parser JSON i cookies,
- podpina route'y,
- ma health endpoint,
- ma globalny handler bledu.

Przyklad kodu:

```js
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/reviews', reviewsRoutes)
app.use('/api/spotify', spotifyRoutes)
app.use('/api/playlists', playlistsRoutes)
app.use('/api/recommendations', recommendationsRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'waveeProjectBW API is running' })
})
```

### 3.2 Middleware autoryzacji
Plik: `backend/src/middleware/auth.js`

Co robi middleware:
1. bierze token z cookie `token` albo z naglowka Authorization,
2. weryfikuje JWT (`JWT_SECRET`),
3. jak token wygasl to probuje odswiezyc Spotify access token,
4. ustawia `req.userId` i `req.spotifyAccessToken`.

To jest mocna czesc projektu, bo automatycznie naprawia sesje bez wywalania usera.

Przyklad kodu:

```js
const token = req.cookies.token || req.headers.authorization?.split(' ')[1]
const decoded = jwt.verify(token, process.env.JWT_SECRET)
req.userId = decoded.userId
req.spotifyAccessToken = decoded.spotifyAccessToken
```

### 3.3 Moduly `lib` (Spotify, Prisma, helpery)

#### a) `backend/src/lib/spotify.js`
Zawiera wszystkie funkcje do Spotify:
- login OAuth (`getAuthUrl`, `getTokens`),
- odswiezanie tokenu,
- pobieranie profilu,
- top tracks/artists,
- search,
- details track,
- audio-features (z fallbackiem na `null`),
- rekomendacje zastępcze (bo stare endpointy Spotify byly wycofane),
- tworzenie i sync playlist.

Wazna rzecz: autorzy projektu poprawnie obsluzyli zmiany Spotify po 2024, wiec endpointy deprecated sa zastapione innymi strategiami.

Przyklad kodu (wyszukiwanie):

```js
const { data } = await axios.get(`${API}/search`, {
  headers: authHeader(token),
  params: { q: query, type: 'track' },
})
return (data.tracks?.items ?? []).slice(0, limit)
```

#### b) `backend/src/lib/prisma.js`
Singleton Prisma Client. Chroni przed tworzeniem wielu polaczen przy hot-reload.

```js
const globalForPrisma = globalThis
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### c) `backend/src/lib/routeHelpers.js`
- mapowanie bledow Spotify -> sensowny JSON,
- wykrywanie demo usera,
- losowe tasowanie tablic.

## 4. Baza danych (Prisma)
Plik: `backend/prisma/schema.prisma`

Provider: `postgresql`

### 4.1 Model User
Najwazniejsze pola:
- `spotifyId` (unique),
- `email` (nullable + unique),
- `displayName`, `avatarUrl`, `bio`,
- `favoriteGenres` jako tablica string.

Relacje:
- 1:N do `Review`,
- 1:N do `Playlist`,
- 1:N do `LikedTrack`.

### 4.2 Model Review
- recenzja per user i utwor (`@@unique([userId, trackId])`),
- trzyma snapshot metadanych piosenki,
- trzyma ocene i opcjonalny komentarz,
- trzyma cechy audio (tempo, key, energy, danceability, valence).

### 4.3 Playlist i PlaylistTrack
- `Playlist` to kontener,
- `PlaylistTrack` to utwory z `position`.

Mocny punkt: `@@unique([playlistId, trackId])` zapobiega duplikatowi tego samego tracka w 1 playliscie.

### 4.4 LikedTrack
Model pod przyszle funkcje like/favorite, juz jest gotowy pod audio-features i gatunki.

## 5. API - endpoint po endpoincie

### 5.1 `/api/auth`
Plik: `backend/src/routes/auth.js`

Najwazniejsze endpointy:
- `POST /register` - lokalne konto email+haslo,
- `POST /local-login` - lokalny login,
- `GET /login` - URL do Spotify OAuth albo `demoMode: true`,
- `POST /demo-login` - tworzy usera demo i cookie,
- `GET /callback` - konczy OAuth,
- `GET /me` - zwraca zalogowanego usera,
- `POST /refresh` - refresh tokena Spotify,
- `POST /logout` - kasuje cookie.

Skrawek kodu z walidacja:

```js
const localAuthSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(6).max(72),
  displayName: z.string().min(2).max(40).optional(),
})
```

### 5.2 `/api/spotify`
Plik: `backend/src/routes/spotify.js`

- `GET /search?q=...`
- `GET /track/:trackId`
- `GET /audio-features/:trackId`
- `GET /top/tracks`
- `GET /top/artists`
- `GET /genres`

Dla demo usera endpointy zwracaja `mockData`, co jest bardzo praktyczne na obrone i testy.

### 5.3 `/api/reviews`
Plik: `backend/src/routes/reviews.js`

- `POST /` - create lub update recenzji (upsert),
- `GET /my` - moje recenzje z paginacja,
- `GET /track/:trackId` - feed recenzji dla 1 utworu,
- `GET /:reviewId` - szczegol,
- `DELETE /:reviewId` - usuwanie,
- `GET /` - globalny feed.

Mocny fragment:

```js
const review = await prisma.review.upsert({
  where: { userId_trackId: { userId: req.userId, trackId } },
  update: { rating, content },
  create: { userId: req.userId, trackId, rating, content }
})
```

### 5.4 `/api/playlists`
Plik: `backend/src/routes/playlists.js`

- tworzenie playlist,
- lista moich,
- pobranie jednej,
- dodanie/usuniecie tracka,
- synchronizacja do Spotify,
- kasowanie playlisty.

Tu jest dobra ochrona: prawie kazda operacja sprawdza wlasciciela playlisty (`playlist.userId !== req.userId`).

### 5.5 `/api/recommendations`
Plik: `backend/src/routes/recommendations.js`

- `GET /similar/:trackId` - podobne utwory,
- `GET /discover/:genre` - odkrywanie po gatunku.

## 6. Frontend - bardzo dokladnie

### 6.1 Punkt startowy i provider
Plik: `frontend/src/main.tsx`

- tworzy QueryClient,
- ustawia staleTime 5 minut,
- opakowuje appke w `QueryClientProvider`.

### 6.2 Routing
Plik: `frontend/src/App.tsx`

Route'y:
- public: `/`, `/login`,
- protected: `/dashboard`, `/search`, `/track/:trackId`, `/reviews`, `/generator`, `/community`, `/profile`.

Protected route pilnuje logowania (`frontend/src/components/ProtectedRoute.tsx`).

### 6.3 Warstwa API po stronie frontu
Plik: `frontend/src/lib/api.ts`

To jest wazne i profesjonalne:
- `axios.create({ baseURL: '/api', withCredentials: true })`,
- interceptor na 401,
- automatyczny `POST /auth/refresh`,
- ponowienie pierwotnego requestu.

Przyklad kodu:

```ts
if (!originalRequest || status !== 401 || originalRequest._retry || shouldSkipRefresh) {
  return Promise.reject(error)
}
originalRequest._retry = true
await api.post('/auth/refresh')
return api(originalRequest)
```

### 6.4 Zarzadzanie sesja usera
Plik: `frontend/src/contexts/AuthContext.tsx`

Context trzyma:
- `user`,
- `isLoading`,
- `isAuthenticated`,
- `logout()`,
- `refetchUser()`.

Po logout robi `queryClient.clear()`, czyli czyści cache i to jest bardzo dobre.

### 6.5 Opis stron

#### Home (`frontend/src/pages/Home.tsx`)
- hero,
- wejscie przez Spotify,
- wejscie demo,
- karty funkcji.

#### Login (`frontend/src/pages/Login.tsx`)
- pobiera login URL z backendu,
- jesli backend zwraca demoMode -> user dostaje komunikat,
- fallback: tryb demo.

#### Dashboard (`frontend/src/pages/Dashboard.tsx`)
- top tracks i top artists,
- statystyki usera,
- ostatnie recenzje,
- wybor zakresu czasu.

#### Search (`frontend/src/pages/Search.tsx`)
- formularz,
- query przez react-query,
- lista kart utworow.

#### Track (`frontend/src/pages/Track.tsx`)
- szczegoly piosenki,
- audio features,
- formularz recenzji,
- lista recenzji,
- podobne utwory.

#### Reviews (`frontend/src/pages/Reviews.tsx`)
- lista moich recenzji,
- usuwanie recenzji,
- fallback gdy pusta lista.

#### PlaylistGenerator (`frontend/src/pages/PlaylistGenerator.tsx`)
- 2 tryby: po gatunku lub po tracku,
- wybor dlugosci playlisty,
- usuwanie pojedynczych trackow,
- dociaganie nowych utworow gdy brak zapasu.

#### Profile (`frontend/src/pages/Profile.tsx`)
- edycja `displayName`, `bio`, `favoriteGenres`,
- podglad statystyk i rozkladu ocen.

#### Community (`frontend/src/pages/Community.tsx`)
- szukanie userow,
- podglad publicznego profilu,
- blokada w trybie demo.

### 6.6 Komponenty pomocnicze

`AudioFeaturesDisplay.tsx`:
- pokazuje BPM, tonacje, loudness,
- renderuje paski cech (energia, tanecznosc, nastroj itd.).

`StarRating.tsx`:
- obsluguje gwiazdki 0.5,
- tryb readonly i tryb edycji.

## 7. Tryb demo - dlaczego jest super na prezentacje
Pliki: `backend/src/lib/mockData.js`, `backend/src/routes/*.js`

Tryb demo pozwala:
- nie byc zablokowanym przez konfiguracje Spotify,
- pokazac wszystkie ekrany,
- dalej testowac recenzje i flow UX.

Czyli nawet jak internet/Spotify padnie to projekt dalej sie prezentuje. To jest duzy plus i serio nauczyciel powinien to docenic.

## 8. Bezpieczenstwo i dobre praktyki

### 8.1 Co jest zrobione dobrze
- JWT cookie `httpOnly`,
- middleware autoryzacji,
- ownership checks (playlist/review),
- walidacja inputu Zod,
- obsluga bledow API,
- fallback na demo.

### 8.2 Co mozna poprawic jeszcze
- w produkcji ustawic `secure: true` dla cookie,
- dodac rate limiting na logowanie i search,
- dodac testy automatyczne endpointow,
- dodac centralny logger (np. pino/winston).

## 9. Konfiguracja i uruchomienie

### 9.1 Wymagania
- Node.js 18+,
- PostgreSQL,
- konto Spotify Developer (opcjonalnie, bo jest demo).

### 9.2 Backend
```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run dev
```

### 9.3 Frontend
```bash
cd frontend
npm install
npm run dev
```

### 9.4 Zmienne srodowiskowe (backend/.env)
Przykladowo:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://USER:PASS@localhost:5432/waveeProjectBW
JWT_SECRET=super_tajne_haslo
SPOTIFY_CLIENT_ID=twoj_client_id
SPOTIFY_CLIENT_SECRET=twoj_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3001/api/auth/callback
```

## 10. Przykladowe scenariusze testowe

1. Login demo:
- wejdz `/login`,
- kliknij "Tryb Demo",
- sprawdz czy dashboard sie laduje.

2. Dodanie recenzji:
- wejdz w Search,
- wybierz track,
- daj ocene 4.5,
- zapisz,
- sprawdz `/reviews`.

3. Generator playlisty:
- wybierz 2 gatunki,
- wygeneruj 5 trackow,
- usun 1 track i sprawdz czy wskakuje nowy.

4. Community:
- zaloguj przez Spotify,
- wyszukaj innego usera,
- otworz jego profil.

## 11. Wnioski techniczne
Projekt jest dobrze zlozony jak na poziom technikum i ma sensowny podzial warstw. Kod jest czytelny i da sie go rozwijac. Dodatkowo ma tryb demo, wiec obrona projektu nie powinna sie wysypac przez brak API key.

Jest pare drobnych rzeczy do dopieszczenia, ale trzon aplikacji jest naprawde solidny i dzialaom stabilnie.

## 12. Podpis autorow dokumentacji
Dokumentacje przygotowali:
- Aleksander Baran
- Franciszek Wawrzeń

Data: 17.03.2026
