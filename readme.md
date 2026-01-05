# 🎓 Quiz Platform

Egy modern, full-stack tanulási platform tesztek feltöltésére, kitöltésére és eredmények nyomon követésére. Tervezd meg saját tanulási utadat, ismételd a témákat és kövesd a fejlődésedet!

## ✨ Főbb Funkciók

- 🔐 *Google OAuth bejelentkezés* - Biztonságos authentikáció
- 📤 *Fájl feltöltés* - JSON és XML formátum támogatása
- 🔀 *Random kérdések és válaszok* - Minden kitöltés más sorrendben
- 📊 *Eredmény követés* - Teljes történet minden kitöltésről
- 🔍 *Keresés* - Gyors keresés témakör és cím alapján
- 👁️ *Visszanézés* - Minden kérdés részletes elemzése, elrontott válaszokkal
- 💾 *Perzisztens adatok* - PostgreSQL adatbázis
- 🎨 *Modern UI* - Tailwind CSS, responsive design
- 🎯 *Személyre szabott profil* - Színes avatar kezdőbetűkkel

## Gyors Kezdés

### Előfeltételek

- Node.js 16+ és npm
- PostgreSQL 12+
- Google Cloud Console fiók (OAuth-hoz)

### 1. Repository klónozása

git clone https://github.com/yourusername/quiz-platform.git
cd quiz-platform

### 2. Backend Setup

cd backend
npm install

Hozz létre egy .env fájlt:

env
DATABASE_URL=postgresql://user:password@localhost:5432/quiz_platform
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
SESSION_SECRET=your-random-secret-key-here
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development

### 3. Adatbázis létrehozása

createdb quiz_platform
psql quiz_platform < schema.sql

### 4. Google OAuth Setup

1. Menj a [Google Cloud Console](https://console.cloud.google.com)
2. Hozz létre új projektet
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Authorized redirect URIs: http://localhost:5000/auth/google/callback
5. Másold ki a Client ID-t és Secret-et a .env fájlba

### 5. Frontend Setup

cd ../frontend
npm install

Módosítsd az src/App.js fájlban az API URL-t (ha szükséges):

const API_URL = 'http://localhost:5000';

### 6. Indítás

*Backend (első terminál):*
cd backend
npm start

*Frontend (második terminál):*
cd frontend
npm start

Nyisd meg a: http://localhost:3000 


## 🎯 Használat

### Teszt Feltöltése

1. Kattints a *"Feltöltés"* gombra
2. Húzd be vagy válassz ki egy JSON/XML fájlt
3. Kattints a *"Teszt Feltöltése"* gombra

### JSON Példa

{
  "title": "JavaScript Alapok",
  "topic": "Programming",
  "description": "JS koncepciók tesztelése",
  "questions": [
    {
      "text": "Mi az === operátor?",
      "options": ["Hozzárendelés", "Egyenlőség típus-konverzióval", "Szigorú egyenlőség", "Nem létezik"],
      "correctIndex": 2,
      "explanation": "A === strict equality, típust is ellenőriz."
    }
  ]
}

### XML Példa

<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <title>JavaScript Alapok</title>
  <topic>Programming</topic>
  <description>JS koncepciók tesztelése</description>
  <questions>
    <question>
      <text>Mi az === operátor?</text>
      <options>
        <option>Hozzárendelés</option>
        <option>Egyenlőség típus-konverzióval</option>
        <option>Szigorú egyenlőség</option>
        <option>Nem létezik</option>
      </options>
      <correctIndex>2</correctIndex>
      <explanation>A === strict equality, típust is ellenőriz.</explanation>
    </question>
  </questions>
</quiz>

### Teszt Kitöltése

1. A Dashboard-on kattints egy tesztre
2. Válaszolj a kérdésekre (random sorrendben)
3. Kattints a *"Beküldés"* gombra
4. Nézd meg az eredményt és az elrontott válaszokat

### Eredmények Visszanézése

1. A Dashboard "Legutóbbi Eredmények" részénél
2. Kattints a *"Visszanézés"* gombra
3. Látod minden kérdést: helyes és rossz válaszokat színkóddal

## 🛠️ Technológiák

### Backend
- *Express.js* - Web framework
- *PostgreSQL* - Adatbázis
- *Passport.js* - OAuth authentikáció
- *Multer* - Fájl feltöltés
- *xml2js* - XML parsing

### Frontend
- *React 19* - UI framework
- *Tailwind CSS* - Styling
- *Lucide React* - Ikonok

## 📊 API Endpoints

| Method | Endpoint | Leírás |
|--------|----------|---------|
| GET | /auth/google | Google OAuth bejelentkezés |
| GET | /auth/google/callback | OAuth callback |
| GET | /auth/logout | Kijelentkezés |
| GET | /auth/user | Jelenlegi user lekérése |
| POST | /api/upload | Teszt feltöltése (JSON/XML) |
| GET | /api/quizzes | Összes teszt listázása |
| GET | /api/quizzes/:id | Egy teszt lekérése |
| POST | /api/submit | Teszt beküldése |
| GET | /api/history | Eredmény történet |
| GET | /api/stats/:quizId | Teszt statisztikák |

## 🚢 Production Deployment

### Backend (Railway/Render)

1. Push a GitHub-ra
2. Csatlakoztasd a repository-t
3. Add hozzá a PostgreSQL addon-t
4. Állítsd be az environment változókat
5. Deploy

### Frontend

1. Build: npm run build
2. Deploy a build mappát
3. Environment variable: REACT_APP_API_URL=your-backend-url

### Google OAuth Production Setup

A Google Cloud Console-ban add hozzá a production URL-eket:
- Authorized JavaScript origins: https://yourdomain.com
- Authorized redirect URIs: https://api.yourdomain.com/auth/google/callback

## 🤝 Közreműködés

A közreműködéseket szívesen fogadjuk! Kérlek:

1. Forkold a projektet
2. Hozz létre egy feature branch-et (git checkout -b feature/AmazingFeature)
3. Commitold a változásokat (git commit -m 'Add some AmazingFeature')
4. Push-old a branch-re (git push origin feature/AmazingFeature)
5. Nyiss egy Pull Request-et

## 🐛 Bug Report

Ha hibát találsz, nyiss egy issue-t a következő információkkal:
- Hiba leírása
- Lépések a reprodukáláshoz
- Elvárt viselkedés
- Képernyőképek (ha van)
- Környezet (OS, Node verzió, stb.)


## 🎯 Roadmap / Jövőbeli Fejlesztések

- [ ] AI-powered kérdésgenerálás Claude API-val
- [ ] Témaköri statisztikák és analytics
- [ ] Social sharing
- [ ] Spaced repetition algoritmus
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Markdown támogatás kérdésekben
- [ ] Kép feltöltés kérdésekhez
- [ ] Időzített tesztek
- [ ] Nehézségi szintek
- [ ] Export eredmények PDF-be
- [ ] Tanár/Diák nézet
- [ ] Question Machine

## 👨‍💻 Szerző

Készítette:*Kevin Laczko**