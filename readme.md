# 🎓 Quiz Platform

Egy modern, full-stack tanulási platform tesztek létrehozására, feltöltésére, kitöltésére és eredmények nyomon követésére. Tervezd meg saját tanulási utadat, készíts egyedi kérdéseket, ismételd a témákat és kövesd a fejlődésedet!

## ✨ Főbb Funkciók

### 🔐 Authentikáció & Profil
- **Google OAuth bejelentkezés** - Biztonságos authentikáció
- **Személyre szabott profil** - Színes avatar kezdőbetűkkel
- **Session management** - Biztonságos session tárolás PostgreSQL-ben

### 📝 Teszt Kezelés
- **Kérdés Készítő** - Interaktív vizuális szerkesztő 7 kérdéstípussal:
  - ✅ Egyszeres választás
  - ☑️ Többszörös választás
  - ✔️ Igaz/Hamis
  - 🔢 Numerikus válasz (egység támogatással)
  - 🔗 Párosítás (bal-jobb oldal)
  - 📝 Kitöltendő (cloze) - dropdown és szöveges kitöltés
  - 📄 Esszé - hosszú szöveges válasz szólimittel
- **Vágólapról beillesztés** - Válaszok gyors hozzáadása vágólapról (soronként vagy ;-vel elválasztva)
- **Fájl feltöltés** - JSON és Moodle XML formátum támogatása
- **Moodle XML Export** - Exportálás LMS-be importáláshoz
- **Teszt szerkesztés** - Címkép, téma, leírás, pontszámok, magyarázatok
- **Időkorlát beállítás** - Opcionális timer funkció

### 🎯 Teszt Kitöltés & Eredmények
- **Random kérdések és válaszok** - Minden kitöltés más sorrendben
- **Valós idejű timer** - Visszaszámlálás és backend validáció
- **Részletes kiértékelés** - 5-szintű eredmény rendszer (🏆⭐👍📚💔)
- **Visszanézés mód** - Minden kérdés színkódolt részletes elemzése
- **Pontozási rendszer** - Részleges pont többszörös választásnál

### 📊 Dashboard & Statisztikák
- **Összes Teszt nézet** - Grid layout az összes elérhető teszttel
- **Összes Eredmény nézet** - Teljes történet statisztikákkal:
  - 🏆 Legjobb eredmény
  - 🎯 Átlag eredmény
  - 📈 Összes próbálkozás
  - ⏱️ Összesített idő
- **Nemrég kitöltött tesztek** - 5 legutóbbi teszt gyors elérése
- **Legutóbbi eredmények** - 5 legfrissebb próbálkozás
- **Teljesítmény badge-ek** - Vizuális visszajelzés (🏆 Kiváló, ⭐ Jó, 👍 Átlagos, 📚 Gyakorolj még)

### 🔍 Egyéb Funkciók
- **Keresés** - Gyors keresés cím és témakör alapján
- **Responsive design** - Mobil, tablet, desktop optimalizálás
- **Hamburger menü** - Mobilbarát navigáció
- **Színkódolt UI** - Intuitív vizuális visszajelzések
- **Perzisztens adatok** - PostgreSQL adatbázis
- **Modern UI** - Tailwind CSS, clean design

---

## 🚀 Gyors Kezdés

### Előfeltételek

- **Node.js 16+** és npm
- **PostgreSQL 12+**
- **Google Cloud Console** fiók (OAuth-hoz)

### 1. Repository klónozása

```bash
git clone https://github.com/TwelveStudent47/quiz-platform.git
cd quiz-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Hozz létre egy `.env` fájlt:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/quiz_platform

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret

# Security
SESSION_SECRET=your-random-secret-key-here

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
ANTHROPIC_API_KEY=your-claude-api-key
API_SECRET_KEY=your-master-api-key
```

### 3. Adatbázis létrehozása

```bash
createdb quiz_platform
psql quiz_platform < schema.sql
```

### 4. Google OAuth Setup

1. Menj a [Google Cloud Console](https://console.cloud.google.com)
2. Hozz létre új projektet
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. **Authorized redirect URIs**: `http://localhost:5000/auth/google/callback`
5. Másold ki a **Client ID**-t és **Secret**-et a `.env` fájlba

### 5. Frontend Setup

```bash
cd ../frontend
npm install
```

Hozz létre egy `.env` fájlt a frontend mappában:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 6. Indítás

**Backend** (első terminál):
```bash
cd backend
npm start
```

**Frontend** (második terminál):
```bash
cd frontend
npm start
```

Nyisd meg a: **http://localhost:3000** 🎉

---

## 📁 Projekt Struktúra

```
quiz-platform/
├── backend/
│   ├── app.js                 # Express szerver, API endpoints
│   ├── schema.sql             # PostgreSQL adatbázis séma
│   ├── package.json
│   ├── Dockerfile
│   └── .env                   # Environment változók
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # LoginPage
│   │   │   ├── common/        # Button, Card, SearchBar, LoadingSpinner
│   │   │   ├── dashboard/     # Dashboard, RecentResults
│   │   │   ├── layout/        # Header, Navbar
│   │   │   ├── quiz/          # QuizView, ReviewView, CreateQuizView
│   │   │   │   │              # AllQuizzesView, QuizList, QuizCard
│   │   │   │   │              # QuestionDrawer, QuestionListItem
│   │   │   │   └── creator/   # SingleChoiceEditor, MultipleChoiceEditor
│   │   │   │                  # TrueFalseEditor, NumericEditor, MatchingEditor
│   │   │   │                  # ClozeEditor, EssayEditor, PasteAnswersModal
│   │   │   ├── results/       # AllResultsView
│   │   │   ├── upload/        # UploadView
│   │   │   └── ai/            # AIQuizGenerator
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useQuizzes.js
│   │   │   └── useHistory.js
│   │   │
│   │   ├── services/
│   │   │   └── api.js         # API kommunikáció
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js   # VIEWS, AVATAR_COLORS
│   │   │   ├── scoring.js     # Pontozási logika
│   │   │   └── moodleXMLExport.js  # Moodle export
│   │   │
│   │   ├── App.jsx            # Fő alkalmazás, routing
│   │   ├── index.js
│   │   └── index.css
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   └── index.html
│   │
│   ├── package.json
│   └── .env                   # Frontend environment változók
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🎯 Használat

### 1️⃣ Teszt Létrehozása (Kérdés Készítő)

1. Kattints a **"Kérdés Készítő"** gombra a navbar-on
2. Add meg a teszt adatait:
   - Cím (kötelező)
   - Témakör
   - Leírás
   - Időkorlát (perc)
   - Címkép (opcionális, base64)
3. Add hozzá a kérdéseket:
   - **Egyszeres választás** - Egy helyes válasz
   - **Többszörös választás** - Több helyes válasz
   - **Igaz/Hamis** - Boolean kérdés
   - **Numerikus** - Szám válasz (opcionális egység)
   - **Párosítás** - Bal-jobb oldal párosítása
4. Állítsd be a pontszámokat és magyarázatokat
5. Kattints **"Teszt Mentése"** vagy **"Moodle XML Export"**

#### Kérdéstípusok Példái:

**Egyszeres választás:**
```
Kérdés: Mi a JavaScript fő célja?
Opciók:
  • Adatbázis kezelés
  • Weboldal interaktivitás ✓
  • Operációs rendszer fejlesztés
  • 3D grafikák renderelése
Pontszám: 1
```

**Többszörös választás:**
```
Kérdés: Mely változó deklarációk léteznek JavaScript-ben?
Opciók:
  ✓ var
  ✓ let
  ✓ const
  • define
Pontszám: 3 (részleges pont: 1 pont/helyes válasz)
```

**Igaz/Hamis:**
```
Kérdés: A JavaScript típusos nyelv.
Válasz: Hamis ✓
Pontszám: 1
```

**Numerikus:**
```
Kérdés: Hány bájt egy JavaScript number?
Válasz: 8 ± 0.01
Egység: byte (opcionális)
Pontszám: 2
```

**Párosítás:**
```
Kérdés: Párosítsd a típusokat:
Bal oldal          → Jobb oldal
"hello"            → string ✓
42                 → number ✓
true               → boolean ✓
Pontszám: 3 (1 pont/helyes pár)
```

### 2️⃣ Teszt Feltöltése

1. Kattints a **"Feltöltés"** gombra
2. Húzd be vagy válassz ki egy **JSON** vagy **Moodle XML** fájlt
3. Kattints a **"Teszt Feltöltése"** gombra

#### JSON Példa:

```json
{
  "title": "JavaScript Alapok",
  "topic": "Programming",
  "description": "JS koncepciók tesztelése",
  "timeLimit": 30,
  "questions": [
    {
      "type": "single_choice",
      "text": "Mi az === operátor?",
      "options": ["Hozzárendelés", "Egyenlőség típus-konverzióval", "Szigorú egyenlőség", "Nem létezik"],
      "correctIndex": 2,
      "points": 1,
      "explanation": "A === strict equality, típust is ellenőriz."
    },
    {
      "type": "multiple_choice",
      "text": "Mely típusok primitívek?",
      "options": ["string", "number", "object", "boolean"],
      "correctIndices": [0, 1, 3],
      "points": 3,
      "explanation": "object nem primitív típus."
    },
    {
      "type": "true_false",
      "text": "A JavaScript aszinkron nyelv.",
      "correctAnswer": true,
      "points": 1,
      "explanation": "JS támogatja az aszinkron programozást."
    },
    {
      "type": "numeric",
      "text": "Mennyi 2^10?",
      "correctAnswer": 1024,
      "tolerance": 0,
      "unit": "",
      "points": 2,
      "explanation": "2 a 10. hatványon = 1024"
    },
    {
      "type": "matching",
      "text": "Párosítsd a metódusokat:",
      "pairs": [
        { "left": "map()", "right": "Transzformáció" },
        { "left": "filter()", "right": "Szűrés" },
        { "left": "reduce()", "right": "Aggregáció" }
      ],
      "points": 3,
      "explanation": "Array metódusok és céljaik."
    }
  ]
}
```

#### Moodle XML Példa:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <question type="multichoice">
    <name>
      <text>JavaScript Operátor</text>
    </name>
    <questiontext format="html">
      <text><![CDATA[<p>Mi az === operátor?</p>]]></text>
    </questiontext>
    <single>true</single>
    <shuffleanswers>true</shuffleanswers>
    <answernumbering>abc</answernumbering>
    <answer fraction="0" format="html">
      <text><![CDATA[<p>Hozzárendelés</p>]]></text>
    </answer>
    <answer fraction="100" format="html">
      <text><![CDATA[<p>Szigorú egyenlőség</p>]]></text>
    </answer>
  </question>
</quiz>
```

### 3️⃣ Tesztek Megtekintése

#### Dashboard:
- **Nemrég Kitöltött Tesztek** - 5 legutóbb kitöltött teszt
- **Legutóbbi Eredmények** - 5 legfrissebb eredmény

#### Összes Teszt:
1. Kattints az **"Összes Teszt"** gombra
2. Látod az összes elérhető tesztet grid layout-ban
3. Minden teszt kártyán:
   - Cím, témakör, leírás
   - Kérdések száma
   - Időkorlát
   - Létrehozás dátuma
   - Készítő neve (ha nem saját)
   - "Saját" badge (ha saját teszt)
   - Próbálkozások száma
   - Átlag eredmény %
4. Kattints **"Teszt Indítása"** gombra

### 4️⃣ Teszt Kitöltése

1. Válassz egy tesztet a Dashboard-ról vagy az Összes Teszt oldalról
2. A kérdések és válaszok **random sorrendben** jelennek meg
3. Válaszolj minden kérdésre:
   - **Egyszeres választás** - Egy opció
   - **Többszörös választás** - Több opció
   - **Igaz/Hamis** - IGAZ vagy HAMIS gomb
   - **Numerikus** - Szám beírása
   - **Párosítás** - Dropdown-ok minden párhoz
4. Ha van időkorlát, a timer visszaszámol
5. Kattints a **"Beküldés"** gombra
6. Látod az eredményt:
   - **🏆 Kiváló** (90-100%)
   - **⭐ Jó** (70-89%)
   - **👍 Átlagos** (50-69%)
   - **📚 Gyakorolj még** (30-49%)
   - **💔 Próbáld újra** (<30%)

### 5️⃣ Eredmények Visszanézése

#### Egyedi Visszanézés:
1. Dashboard **"Legutóbbi Eredmények"** → **"Visszanézés"** gomb
2. Látod minden kérdést:
   - ✅ **Helyes válasz** - Zöld háttér
   - ❌ **Rossz válasz** - Piros háttér
   - **A te válaszod** - Kiemelt kerettel
   - **Helyes válasz(ok)** - Zöld checkmark
   - **Magyarázat** - Ha van
   - **Pontszám** - Szerzett/maximum pont

#### Összes Eredmény:
1. Dashboard **"Összes Eredmény"** gomb
2. Látod a statisztikákat:
   - 🏆 **Legjobb eredmény** %
   - 🎯 **Átlag eredmény** %
   - 📈 **Összes próbálkozás**
   - ⏱️ **Össz idő** percben
3. Minden eredmény kártyán:
   - Teszt címe
   - Dátum + idő
   - Eredmény % (színkódolt)
   - Pontszám
   - Teljesítmény badge
   - Eltöltött idő
   - **"Visszanézés"** gomb

### 6️⃣ Moodle XML Export

1. **Kérdés Készítő**-ben hozz létre egy tesztet
2. Kattints a **"Moodle XML Export"** gombra
3. Letöltődik egy `.xml` fájl
4. Moodle LMS-ben:
   - **Question Bank** → **Import**
   - Válaszd a **Moodle XML format**-ot
   - Töltsd fel a fájlt
5. A kérdések importálódnak a Question Bank-be

---

## 🛠️ Technológiák

### Backend
- **Express.js 4.18** - Web framework
- **PostgreSQL 14** - Relációs adatbázis
- **Passport.js** - OAuth authentikáció (Google Strategy)
- **express-session** - Session management
- **connect-pg-simple** - PostgreSQL session store
- **Multer** - Fájl feltöltés kezelés
- **xml2js** - XML parsing (Moodle import)
- **bcrypt** - Password hashing (ha később local auth)
- **helmet** - Security headers
- **cors** - Cross-Origin Resource Sharing

### Frontend
- **React 19** - UI framework
- **Tailwind CSS 3.4** - Utility-first CSS
- **Lucide React** - Modern icon library
- **Context API** - State management
- **Custom Hooks** - useQuizzes, useHistory
- **Responsive Design** - Mobile-first approach

### Adatbázis Séma
```sql
users (id, google_id, email, name, preferences, created_at)
quizzes (id, user_id, title, description, topic, time_limit, questions, created_at)
attempts (id, user_id, quiz_id, score, total_points, percentage, answers, time_spent, completed_at)
sessions (sid, sess, expire)
```

---

## 📊 API Endpoints

### Authentikáció
| Method | Endpoint | Leírás |
|--------|----------|---------|
| GET | `/auth/google` | Google OAuth bejelentkezés |
| GET | `/auth/google/callback` | OAuth callback |
| GET | `/auth/logout` | Kijelentkezés |
| GET | `/auth/user` | Jelenlegi user adatai |

### Tesztek
| Method | Endpoint | Leírás |
|--------|----------|---------|
| POST | `/api/upload` | Teszt feltöltése (JSON/XML) |
| POST | `/api/create` | Teszt létrehozása (Kérdés Készítő) |
| GET | `/api/quizzes` | Összes teszt listázása |
| GET | `/api/quizzes?search=term` | Tesztek keresése |
| GET | `/api/quizzes/:id` | Egy teszt lekérése |
| DELETE | `/api/quizzes/:id` | Teszt törlése |
| POST | `/api/submit` | Teszt beküldése |

### Eredmények
| Method | Endpoint | Leírás |
|--------|----------|---------|
| GET | `/api/history` | Összes eredmény (50 legutóbbi) |
| GET | `/api/attempts/:id` | Egy eredmény részletei |
| GET | `/api/stats/:quizId` | Teszt statisztikák |

---

## 🐛 Bug Report

Ha hibát találsz, nyiss egy issue-t a [GitHub-on](https://github.com/TwelveStudent47/quiz-platform/issues) a következő információkkal:

- **Hiba leírása** - Mi történt?
- **Lépések a reprodukáláshoz** - Hogyan lehet előidézni?
- **Elvárt viselkedés** - Mi kellett volna történjen?
- **Képernyőképek** - Ha releváns
- **Környezet**:
  - OS (Windows/Mac/Linux)
  - Browser (Chrome/Firefox/Safari)
  - Node verzió
  - npm verzió

---

## 🎯 Roadmap / Jövőbeli Fejlesztések

### Kész ✅
- [x] Google OAuth authentikáció
- [x] Teszt feltöltés (JSON, Moodle XML)
- [x] **Kérdés Készítő (5 kérdéstípus)**
- [x] **Moodle XML export**
- [x] Random kérdés/válasz sorrend
- [x] Timer funkció
- [x] Részletes visszanézés
- [x] **Összes Teszt nézet**
- [x] **Összes Eredmény nézet statisztikákkal**
- [x] Pontozási rendszer (részleges pont)
- [x] Responsive design
- [x] **Hamburger menü**
- [x] Színkódolt eredmények
- [x] **Képfeltöltés kérdésekhez** (base64 mellett URL)
- [x] Cloze/Fill-in-the-blank kérdések
- [x] Essay típusú kérdések (hosszú szöveges válasz)
- [x] Dark mode
- [x] **Quiz szerkesztés** (meglévő tesztek módosítása)
- [x] **AI-powered kérdésgenerálás** Claude API-val
- [x] **Válasz mentések típus változtatásnál**
- [x] **Vágólapról válaszok másolása soronként/1 sorból ;-vel elválasztva**
- [x] **Kérdéskártyára kattintva szerkesztés** (nem csak az ikon, hanem a teljes kártya kattintható)
- [x] **Témaköri statisztikák** (témakör szerinti teljesítmény)

### Tervezve 📋
- [ ] **Markdown támogatás** kérdésekben és magyarázatokban
- [ ] **Spaced repetition algoritmus** (intelligens ismétlés)
- [ ] **Export eredmények PDF-be**
- [ ] **Social sharing** (eredmények megosztása)
- [ ] **Többnyelvűség** (i18n)
- [ ] **Notifications** (email értesítések)
- [ ] **Leader board** (top eredmények)
- [ ] **Tanár/Diák nézet** (role-based access)
- [ ] **Quiz megosztás** (public/private/collaborative)
- [ ] **Offline mode** (PWA)
- [ ] **Mobile app** (React Native)

---

## 🤝 Közreműködés

A közreműködéseket szívesen fogadjuk! Kérlek:

1. **Fork-old** a projektet
2. Hozz létre egy **feature branch**-et:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commitold** a változásokat:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push-old** a branch-re:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Nyiss egy **Pull Request**-et

---

## 📄 Licenc

Ez a projekt **nyílt forráskódú** és szabadon használható tanulási célokra.

---

## 👨‍💻 Szerző

**Készítette: Kevin Laczko**

- GitHub: [@TwelveStudent47](https://github.com/TwelveStudent47)
- Repository: [quiz-platform](https://github.com/TwelveStudent47/quiz-platform)

---

## 📞 Kapcsolat / Support

Ha kérdésed van vagy segítségre van szükséged:

1. **GitHub Issues**: [github.com/TwelveStudent47/quiz-platform/issues](https://github.com/TwelveStudent47/quiz-platform/issues)
2. **Email**: laczkokevin60@gmail.com

---

## 🎓 Oktatási Célok

Ez a projekt kiváló példa a következő technológiákra és koncepciókra:

- **Full-stack JavaScript** (Node.js + React)
- **RESTful API** tervezés
- **OAuth 2.0** authentikáció
- **PostgreSQL** adatbázis design
- **Session management**
- **File upload** kezelés
- **XML parsing**
- **Responsive web design**
- **State management** (Context API)
- **Custom hooks**
- **Component architecture**
- **Production deployment**
- **Environment variables**
- **Security best practices**

---

## 📚 Tanulási Források

Ha szeretnéd jobban megérteni a projektet:

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Passport.js Documentation](http://www.passportjs.org/)
- [Moodle XML Format](https://docs.moodle.org/en/Moodle_XML_format)