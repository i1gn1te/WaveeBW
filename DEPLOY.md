# Instrukcja hostowania Wavee

## Co potrzebujesz
- Konto GitHub (darmowe): https://github.com
- Konto Railway (darmowe): https://railway.app
- Konto Vercel (darmowe): https://vercel.com

---

## Krok 1 — Wrzuć kod na GitHub

1. Wejdź na https://github.com/new i stwórz **nowe repozytorium** (np. `wavee`)
2. W folderze `waveeReady` otwórz terminal i wykonaj:
   ```
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/TWOJE_KONTO/wavee.git
   git push -u origin main
   ```

---

## Krok 2 — Deploy backendu na Railway

1. Zaloguj się na https://railway.app
2. Kliknij **New Project → Deploy from GitHub repo**
3. Wybierz swoje repozytorium `wavee`
4. Kliknij **Add service → GitHub Repo**, ustaw **Root Directory** na `backend`
5. W zakładce **Variables** dodaj wszystkie zmienne (patrz niżej)
6. Railway automatycznie uruchomi backend. Skopiuj URL (np. `wavee-backend.railway.app`)

### Zmienne środowiskowe dla Railway (backend):
| Nazwa | Wartość |
|-------|---------|
| `DATABASE_URL` | Twój Neon connection string |
| `JWT_SECRET` | Dowolny długi losowy ciąg znaków |
| `SPOTIFY_CLIENT_ID` | Z panelu Spotify Developer |
| `SPOTIFY_CLIENT_SECRET` | Z panelu Spotify Developer |
| `SPOTIFY_REDIRECT_URI` | `https://TWOJ-URL.railway.app/api/auth/callback` |
| `CLIENT_URL` | `https://TWOJ-FRONTEND.vercel.app` (wypełnisz po kroku 3) |

---

## Krok 3 — Deploy frontendu na Vercel

1. Zaloguj się na https://vercel.com
2. Kliknij **Add New Project → Import Git Repository**
3. Wybierz repo `wavee`
4. Ustaw **Root Directory** na `frontend`
5. W sekcji **Environment Variables** dodaj:
   | Nazwa | Wartość |
   |-------|---------|
   | `VITE_API_URL` | `https://TWOJ-URL.railway.app` (URL z kroku 2, **bez** `/api` na końcu) |
6. Kliknij **Deploy**. Dostaniesz link np. `wavee.vercel.app`

---

## Krok 4 — Zaktualizuj Spotify Developer App

1. Wejdź na https://developer.spotify.com/dashboard
2. Otwórz swoją aplikację → **Edit Settings**
3. W **Redirect URIs** dodaj:
   ```
   https://TWOJ-URL.railway.app/api/auth/callback
   ```
4. W **Allowlisted domains** dodaj:
   ```
   https://TWOJ-FRONTEND.vercel.app
   ```
5. Zapisz

---

## Krok 5 — Zaktualizuj CLIENT_URL w Railway

Po tym jak Vercel nada Ci URL frontendu, wróć do Railway i zaktualizuj zmienną:
- `CLIENT_URL` = `https://TWOJ-FRONTEND.vercel.app`

Backend automatycznie się zrestartuje.

---

## Gotowe!

Twoja strona jest dostępna pod linkiem Vercel dla wszystkich — bez instalowania czegokolwiek.

## Aktualizowanie strony

Każdy `git push` do GitHub automatycznie zaktualizuje zarówno Railway (backend) jak i Vercel (frontend).
