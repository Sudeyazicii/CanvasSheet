# CanvasSheet - Comprehensive Codebase Analysis

**Project Name:** CanvasSheet (also called Nokta Canvas Sheet)  
**Location:** `/home/seyyah/works/xtatistix/dev/sheet-canvas`  
**Type:** AI-Powered Dynamic Dashboard Engine  
**Status:** Faz 2 (Phase 2) Completed - AI Dashboard Generation Ready  
**Language:** JavaScript/React 19 + Vite 8  
**Code Volume:** ~2,670 lines of JavaScript/JSX code

---

## 1. PROJECT OVERVIEW

### What It Does

**CanvasSheet** is an AI-powered web application that transforms data sources (Google Sheets, CSV, Excel, JSON, databases) into beautiful, interactive, real-time dashboards. It uses Google's Gemini AI to automatically analyze data structure and generate custom dashboard configurations without requiring manual UI coding.

**Core Value Proposition:**
- Convert any tabular data into a professional, interactive dashboard in seconds
- AI-powered UI generation (no hardcoded layouts)
- Real-time bidirectional sync with Google Sheets
- Zero backend required - completely frontend-based
- Support multiple data sources (Google Sheets, Files, Text, MCP databases)

### Key Use Cases

1. **Budget Simulation Dashboard** - Edit spreadsheet values and see real-time updates
2. **Logistics Tracking** - Live container/cargo monitoring
3. **Sales Analytics** - Dynamic KPI cards and charts
4. **Data Visualization** - Convert raw data into attractive reports
5. **Multi-Source Integration** - Combine data from Google Sheets, files, databases

---

## 2. ARCHITECTURE & DESIGN PATTERNS

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React 19)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ConnectPage (Login & Data Source Selection)                │
│      ↓                                                        │
│  DataHub (Unified Data Abstraction Layer)                   │
│      ├─ GoogleSheetAdapter (OAuth2 + Sheets API)            │
│      ├─ FileAdapter (CSV/XLSX/JSON)                         │
│      ├─ TextAdapter (Raw JSON/loose text)                   │
│      └─ McpDatabaseAdapter (Real-time DB sync)              │
│      ↓                                                        │
│  AnalyzePage (Sheet Analysis + AI Generation)               │
│      ├─ sheetAnalyzer.js (Auto-detect data types/roles)    │
│      ├─ geminiService.js (AI prompt + config generation)   │
│      ├─ Brain.js (Groq API for chatbot assistant)          │
│      ↓                                                        │
│  DynamicDashboard (Config-driven rendering)                 │
│      ├─ WidgetRegistry (Widget type → component mapping)   │
│      ├─ SmartCanvas (Gemini-generated HTML rendering)      │
│      └─ Data Binding ({{template}} variable injection)      │
│      ↓                                                        │
│  BudgetPage (Legacy budget simulation module)               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
        ↓                          ↓                   ↓
    Google Sheets            File System          MCP Database
    (Sheets API v4)          (XLSX/CSV/JSON)      (REST endpoint)
```

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Backend** | None (Frontend-only for now) | Faster development, zero setup, privacy-first |
| **Data Access** | Google Sheets API v4 (OAuth) | No CORS issues, user's own credentials, no sharing needed |
| **AI Model** | Gemini 2.5 Flash (with fallback) | Fast, affordable, automatic model switching on quota |
| **Realtime Sync** | Polling (10s interval now, WebSocket Faz 3) | Polling adequate for current use cases, WebSocket in Phase 3 |
| **Widget Rendering** | Single SmartCanvas component | All Gemini-generated HTML rendered via innerHTML |
| **Rate Limiting** | Debounce (2s) + batch write + exponential backoff | Meets Google free quota (60 req/min per user) |
| **State Management** | React hooks + sessionStorage | Minimal dependencies, sufficient for current scope |

---

## 3. TECHNOLOGY STACK

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 19.2.5 | UI rendering and state management |
| **Build Tool** | Vite | 8.0.10 | Fast dev server and production bundling |
| **CSS Framework** | Tailwind CSS | (via Gemini) | Styling injected by AI |
| **HTTP Client** | Fetch API | Native | API calls (no Axios) |
| **Routing** | React Router DOM | 7.14.2 | Page navigation (/connect, /analyze, /budget) |
| **Icons** | Lucide React | 1.14.0 | Icon library for UI |
| **File Parsing** | XLSX, PapaParse | 0.18.5, 5.5.3 | Excel/CSV parsing |
| **AI Models** | Google Gemini | 2.5 Flash | Dashboard configuration generation |
| **Chat API** | Groq SDK | 1.1.2 | Optional chatbot (Brain.js) |
| **Database Drivers** | MongoDB, MySQL | 7.2.0, 3.22.3 | MCP database connection support |
| **Mobile** | Capacitor | 8.3.2 | Android/iOS support (experimental) |

### Key External APIs

1. **Google Sheets API v4** - Read/write spreadsheet data
2. **Google Identity Services (GIS)** - OAuth2 authentication
3. **Google OAuth2** - User authentication
4. **Gemini API** - AI dashboard generation
5. **Groq API** - Optional chatbot assistant (NOVA)

### Development Tools

- **ESLint** - Code linting
- **Vite Dev Server** - Hot module replacement
- **PostCSS** - CSS processing
- **Google Cloud Console** - OAuth setup and API keys

---

## 4. PROJECT STRUCTURE & KEY FILES

### Directory Layout

```
/sheet-canvas/
├── src/                           # Main source code
│   ├── main.jsx                  # App entry + routing
│   ├── index.css                 # Global styles (36KB)
│   │
│   ├── auth/                     # Authentication
│   │   ├── GoogleAuthProvider.jsx # OAuth2 context (GIS library)
│   │   └── useGoogleAuth.js      # Auth hook
│   │
│   ├── services/                 # Business logic
│   │   ├── sheetsService.js      # Google Sheets API wrapper
│   │   ├── geminiService.js      # Gemini AI integration
│   │   ├── sheetAnalyzer.js      # Data analysis & type detection
│   │   ├── budgetDataService.js  # Budget module data layer
│   │   ├── rateLimiter.js        # Debounce + backoff + polling
│   │   ├── dataUtils.js          # Helper functions
│   │   ├── Brain.js              # Groq chatbot integration
│   │   └── Voice.js              # Text-to-speech (optional)
│   │
│   ├── mcp/                      # Data abstraction layer
│   │   ├── DataHub.js            # Unified adapter interface
│   │   └── adapters/
│   │       ├── GoogleSheetAdapter.js  # Sheets API wrapper
│   │       ├── FileAdapter.js         # CSV/XLSX/JSON parsing
│   │       ├── TextAdapter.js         # Raw text/JSON parsing
│   │       └── McpDatabaseAdapter.js  # Real-time DB sync
│   │
│   ├── engine/                   # Widget engine
│   │   ├── DynamicDashboard.jsx  # Config-driven rendering
│   │   ├── WidgetRegistry.js     # Widget type → component map
│   │   └── widgets/
│   │       └── SmartCanvas.jsx   # Main widget (renders Gemini HTML)
│   │
│   ├── pages/                    # Route pages
│   │   ├── ConnectPage.jsx       # Login + source selection
│   │   ├── AnalyzePage.jsx       # Analysis + AI generation
│   │   └── BudgetPage.jsx        # Legacy budget dashboard
│   │
│   ├── components/
│   │   └── NoktaAvatar.jsx       # Custom avatar component
│   │
│   └── assets/                   # Images, logos, etc.
│
├── server/                        # Optional Node.js backend
│   └── mcp-server.js             # Test MCP server (port 3001)
│
├── discuss/                       # Architecture documentation
│   ├── architecture.md           # System design & decisions
│   ├── plan.md                   # Task checklist (Faz 1&2 complete)
│   ├── walkthrough.md            # Development history
│   └── prompt.md                 # Continuation instructions
│
├── public/
│   ├── test-data.json            # Sample data for testing
│   └── index.html                # (Entry point)
│
├── android/                       # Android/Capacitor files (experimental)
├── old_src/                       # Archived legacy code (5 old modules)
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
├── package-lock.json             # Dependency lock
├── vite.config.js               # Vite configuration
├── eslint.config.js             # Linting rules
├── capacitor.config.json        # Capacitor config
├── README.md                     # User documentation (Turkish)
├── AGENT.md                      # AI agent instructions
└── image.png                     # Preview screenshot
```

---

## 5. CORE FEATURES & FUNCTIONALITY

### Feature 1: Multi-Source Data Connection

**User connects to data via:**

1. **Google Sheets** - Direct OAuth2 + Sheets API v4
2. **Files** - Upload CSV, XLSX, or JSON locally
3. **Raw Text** - Paste JSON or loose key:value data
4. **MCP Database** - Real-time sync from MongoDB/PostgreSQL/MySQL/BigQuery

**Implementation:**
- `DataHub.js` abstracts all adapters behind single interface
- Each adapter implements: `getMetadata()`, `fetchData(range)`, `subscribe(range, callback)`
- Transparent fallback if connection fails

### Feature 2: Intelligent Sheet Analysis

**What it detects automatically:**

- Column data types (number, date, string, boolean)
- Semantic roles (dimension_time, dimension_category, measure_primary, dimension_status)
- Currency units ($, €, TL, %)
- Sample values (first 3 rows of each column)
- Row/column counts

**File:** `src/services/sheetAnalyzer.js`

**Example Output:**
```json
{
  "sheetName": "Budget 2026",
  "headers": ["Category", "Jan", "Feb", ...],
  "columnStats": [
    {
      "name": "Category",
      "type": "string",
      "role": "dimension_category",
      "sampleValues": ["License - NA", "Salary", ...]
    },
    {
      "name": "Jan",
      "type": "number",
      "role": "measure_primary",
      "unit": "$",
      "sampleValues": [10000, 8500, ...]
    }
  ]
}
```

### Feature 3: AI-Powered Dashboard Generation

**Process:**

1. User provides text prompt (e.g., "Show budget by category with color coding")
2. Sheet metadata is formatted as prompt context
3. Gemini generates dashboard configuration JSON
4. System has fallback models: gemini-2.5-flash → gemini-2.5-pro → gemini-2.0-flash

**System Prompt Example:**
```
You are a World-Class UI/UX Designer.
Generate a premium dashboard JSON with:
- THEME: Deep dark navy (#0F172A), glassmorphism
- STYLING: Tailwind CSS classes ONLY
- DATA INJECTION: Use {{column_names}} as template variables
- WIDGETS: dynamic_canvas type for Gemini-generated content
```

**Output:** UI config JSON with widgets and HTML templates

**File:** `src/services/geminiService.js`

### Feature 4: Dynamic Dashboard Rendering

**SmartCanvas Widget:**
- Receives Gemini-generated HTML template
- Injects live data using {{variable}} syntax
- Supports loops ({{LOOP_START}}/{{LOOP_END}}) for repeating elements
- Handles multiple data sources in single dashboard

**Template Variable Examples:**
- `{{total_revenue}}` → Latest value from column
- `{{LOOP_START}}...{{LOOP_END}}` → Render row template for each row
- `{{COL_0}}`, `{{HEADER_0}}` → Column references
- `{{TOTAL_ROWS}}` → Row count

**File:** `src/engine/widgets/SmartCanvas.jsx`

### Feature 5: Real-Time Bidirectional Sync

**Write Path (User → Sheet):**
1. User edits cell in dashboard
2. UI updates optimistically (instant visual feedback)
3. 2-second debounce waits for more edits
4. All changes batched into single API call
5. Exponential backoff on quota exceeded (429 error)

**Read Path (Sheet → UI):**
1. Polling every 5-10 seconds (configurable)
2. Fetches latest data from Sheets API
3. Detects changes and updates UI
4. Supports multiple concurrent data subscriptions

**Files:**
- `src/services/rateLimiter.js` - Debounce, backoff, polling
- `src/mcp/adapters/GoogleSheetAdapter.js` - Polling subscription

### Feature 6: Rate Limiting & Quota Management

**Google Sheets API Quotas:**
- 60 req/min per user
- 300 req/min per project
- No paid upgrade available (hard limit)

**Optimization Strategies:**
1. **Batch requests** - Multiple cells in one API call (96 → 1 request)
2. **Debouncing** - Wait 2s before writing changes
3. **Exponential backoff** - 1s, 2s, 4s delays on 429 errors
4. **Smart polling** - 10s interval = 6 req/min (10% of quota)
5. **Caching** - Data cached at adapter level

**Result:** 1 user = ~18% quota usage, 10 users = ~37% usage (safe)

---

## 6. DATA FLOW & STATE MANAGEMENT

### Complete User Journey

```
START
  ↓
User visits http://localhost:5173/connect
  ↓
ConnectPage displays 4 tabs:
  • Sheet (Google Sheets URL)
  • File (CSV/XLSX/JSON upload)
  • Text (Raw JSON/loose data)
  • MCP DB (Database connection)
  ↓
User clicks "Sign in with Google"
  ↓
GoogleAuthProvider initiates OAuth2 flow (GIS library)
  ↓
User grants permissions
  ↓
AccessToken obtained and stored in context
  ↓
User pastes Google Sheet URL or uploads file
  ↓
handleConnect() → DataHub.connect(type, payload)
  ↓
Adapter initialized:
  • GoogleSheetAdapter reads metadata via Sheets API
  • FileAdapter parses uploaded file
  • TextAdapter parses JSON/loose text
  • McpDatabaseAdapter fetches from endpoint
  ↓
Navigate to /analyze page
  ↓
AnalyzePage loads:
  1. Fetches raw data (A1:Z500 range)
  2. Calls analyzeSheet() to detect types/roles
  3. Displays metadata summary
  ↓
User enters custom prompt (optional)
  ↓
Click "Generate Dashboard"
  ↓
generateMultipleDashboardConfigs() called:
  1. Format metadata as prompt context
  2. Call Gemini API with 4 different style modifiers
  3. Parse JSON responses from Gemini
  4. Return array of 4 dashboard configs
  ↓
Display carousel of 4 dashboard options
User selects favorite design
  ↓
DynamicDashboard component mounts:
  1. Extracts data sources from config
  2. Fetches data for each widget
  3. Subscribes to live updates (polling)
  4. Renders SmartCanvas widgets with data binding
  ↓
User edits values in live dashboard
  ↓
Change triggers debounced write:
  1. UI updates immediately (optimistic)
  2. 2s debounce waits
  3. batchUpdate API call with all changes
  4. Status indicator shows "Saving..." → "Saved"
  ↓
Polling detects external changes:
  1. Every 5-10s, adapter fetches fresh data
  2. Compares with cached version
  3. Updates UI if different
  ↓
Dashboard stays in sync ✓
```

### Component Hierarchy

```
GoogleAuthProvider (Context)
  └─ BrowserRouter
      └─ Routes
          ├─ Route: /connect → ConnectPage
          │   └─ DataHub.connect()
          │
          ├─ Route: /analyze → AnalyzePage
          │   ├─ [User selects data]
          │   └─ generateDashboardConfig()
          │       └─ Gemini API
          │
          └─ Route: /budget → BudgetPage
              └─ Legacy budget module
```

### State Management Approach

**Global State:**
- `GoogleAuthContext` - User, accessToken, auth functions
- `sessionStorage` - spreadsheetId, gid, sheet URL, MCP source type
- `localStorage` - connectedSheetId

**Component State:**
- `AnalyzePage` - metadata, uiConfigs, selectedIndex, generating, analyzing
- `DynamicDashboard` - sheetData, loading, error
- `ConnectPage` - sheetUrl, activeTab, analyzing, error

**No Redux/Zustand** - Kept minimal for fast dev iteration

---

## 7. API INTEGRATIONS

### Google Sheets API v4

**Endpoints Used:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v4/spreadsheets/{id}` | Get metadata (sheets, titles) |
| GET | `/v4/spreadsheets/{id}/values/{range}` | Read cell values |
| PUT | `/v4/spreadsheets/{id}/values/{range}` | Write single range |
| POST | `/v4/spreadsheets/{id}/values:batchUpdate` | Write multiple ranges (CRITICAL for quota) |

**Authentication:** OAuth2 access token from Google Identity Services

**Rate Limits:**
- User: 60 req/min
- Project: 300 req/min
- Free tier only (no paid upgrade)

### Google Identity Services (GIS)

**Flow:**
1. `initTokenClient()` creates token client with Client ID + scopes
2. User clicks "Sign in"
3. GIS popup shows login
4. Token obtained and passed to callback
5. Token auto-refreshes before expiry

**Scopes:**
```
openid email profile
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/drive.readonly
```

### Gemini API

**Models & Quotas:**

| Model | Input Tokens | Output Tokens | Requests/Day |
|-------|--------------|--------------|--------------|
| gemini-2.5-flash | 1M | 65K | 10 |
| gemini-2.5-pro | 1M | 65K | 10 |
| gemini-2.0-flash | 1M | 8K | 20 |
| gemini-2.5-flash-lite | 1M | 65K | 20 |

**Fallback Logic:**
1. Try ENV_MODEL (from `.env`)
2. Query `/v1beta/models` to discover available models
3. Try flash models first, then pro, then others
4. Return first successful response

**Used For:** Dashboard configuration JSON generation

### Groq API (Optional)

**Purpose:** Chatbot assistant ("NOVA") for conversational UI refinement

**Model:** `llama-3.3-70b-versatile`

**Uses:** Optional chat bubbles in AnalyzePage for guidance

---

## 8. UI/UX PATTERNS

### Design System

**Colors:**
- Primary background: `#0F172A` (deep navy)
- Secondary: `#020617` (darker)
- Text: `#F8FAFC` (almost white)
- Muted: `#94A3B8` (gray)
- Accent: `#3B82F6` (blue)
- Success: `#10B981` (green)

**Effects:**
- Glassmorphism: `backdrop-filter: blur(24px)` + `rgba(30, 41, 59, 0.7)`
- Glow: Radial gradients around buttons
- Animations: Fade-in (0.5s), spin (3s), pulse glow (infinite)

**Font:** Outfit (from Google Fonts)

### Page Layouts

**ConnectPage:**
- Large header with logo and tagline
- Two-step flow: (1) Login, (2) Data source selection
- Tabs for different source types
- Premium dark theme with orbs and glow effects

**AnalyzePage:**
- Top: Metadata summary (column count, row count, types)
- Center: Carousel of 4 AI-generated dashboard options
- Bottom: Chat assistant (NOVA) for refinement
- Export button for JSON config

**BudgetPage:**
- Budget table (editable rows/columns)
- Real-time charts (bar, pie, line)
- Auto-save status indicator
- Polling sync indicator

### Accessibility Features

- Large touch targets (44px minimum)
- High contrast text on dark backgrounds
- Semantic HTML (buttons, inputs, labels)
- ARIA labels on interactive elements

---

## 9. CURRENT LIMITATIONS & ISSUES

### Known Limitations

| Issue | Impact | Workaround | Priority |
|-------|--------|-----------|----------|
| No real backend | Requires frontend-only auth | Add backend proxy for Faz 3 | P2 |
| Polling only (no WebSocket) | Latency in multi-user scenarios | Polling adequate for current users | P3 |
| No dashboard persistence | Can't save/load dashboards | Store config in localStorage/DB (Faz 3) | P2 |
| No user accounts | All data public | Add auth system (Faz 3) | P1 |
| Rate limit strictly enforced | Max ~10-50 concurrent users | Implement caching or scaling (Faz 3) | P2 |
| Gemini quota limits | ~10 dashboard generations/day | Upgrade to paid tier or rate-limit users | P2 |
| Single SmartCanvas widget | All designs same rendering engine | Add specialized widgets (Faz 3) | P3 |
| No error recovery UI | User confused on failure | Better error messages + retry flow | P2 |
| Mobile/Capacitor untested | Android build may not work | Test and debug Capacitor integration | P3 |
| No dark/light theme toggle | Always dark mode | Add theme switcher (Easy) | P4 |

### Missing Features

| Feature | Purpose | Effort | Priority |
|---------|---------|--------|----------|
| **Kanban Widget** | Task/project board view | Medium | P3 |
| **Gantt Chart** | Timeline visualization | Medium | P3 |
| **Advanced Charts** | Scatter, area, combo plots | Medium | P3 |
| **Dashboard Save/Load** | Persist custom configs | Small | P2 |
| **User Accounts** | Multi-user with auth | Large | P1 |
| **Backend Proxy** | OAuth server, rate limiting | Large | P3 |
| **WebSocket** | Real-time multi-user sync | Medium | P3 |
| **Custom CSS Editor** | Allow design tweaks post-generation | Small | P4 |
| **Data Refresh Button** | Manual sync trigger | Trivial | P4 |
| **Dark/Light Theme** | UI theme toggle | Small | P4 |
| **CSV Export** | Download dashboard data | Small | P4 |
| **Admin Panel** | Manage users, quotas, settings | Large | P2 |

---

## 10. BUILD & DEPLOYMENT

### Build Process

**Development:**
```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (http://localhost:5173)
```

**Production:**
```bash
npm run build        # Create optimized dist/ folder
npm run preview      # Preview production build locally
```

**Output:**
- Main bundle: ~103KB (gzipped)
- Total size: ~339KB (uncompressed)
- Build time: < 2 seconds

### Environment Variables

**Required (.env file):**
```
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your-secret (optional)
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_GEMINI_MODEL=gemini-2.5-flash
VITE_GROQ_API_KEY=your-groq-api-key (optional)
```

### Deployment Options

1. **Vercel** - Recommended for React/Vite (1-click deploy)
2. **Netlify** - Also great for static + serverless
3. **GitHub Pages** - Free but limited
4. **Self-hosted** - Docker/Node server
5. **Android/iOS** - Via Capacitor (experimental)

### Docker Example

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

---

## 11. DEVELOPMENT ROADMAP

### Completed (Faz 1 & 2)

- [x] Google OAuth2 authentication
- [x] Google Sheets API v4 integration
- [x] Real-time bidirectional sync (polling)
- [x] Sheet structure analysis
- [x] Gemini AI integration
- [x] Dashboard configuration generation
- [x] Dynamic widget rendering
- [x] Rate limiting & quota management
- [x] Multi-source adapters (File, Text, MCP)
- [x] ConnectPage, AnalyzePage, DynamicDashboard pages
- [x] Dark theme UI with glassmorphism

### In Planning (Faz 3)

- [ ] **User authentication system** - Allow dashboard sharing & persistence
- [ ] **Backend proxy server** - Centralized rate limiting, OAuth server
- [ ] **WebSocket real-time sync** - Multi-user simultaneous editing
- [ ] **Dashboard save/load** - Store configs in database
- [ ] **Kanban, Gantt widgets** - Specialized visualization components
- [ ] **Admin panel** - Manage users, quotas, API keys
- [ ] **Advanced chart types** - Scatter, area, combo plots
- [ ] **Mobile optimization** - Responsive design improvements
- [ ] **Analytics dashboard** - Track usage, errors, performance
- [ ] **API key management** - User-facing key rotation

### Potential Faz 4+

- [ ] **Custom theme builder** - AI-generated color schemes
- [ ] **Collaborative editing** - Real-time multi-user dashboards
- [ ] **Data transformation** - SQL-like query builder
- [ ] **Scheduling** - Automated dashboard generation
- [ ] **ML integrations** - Anomaly detection, forecasting
- [ ] **Mobile apps** - Native iOS/Android via React Native
- [ ] **Marketplace** - Share dashboards, templates, widgets
- [ ] **Enterprise features** - SSO, audit logs, compliance

---

## 12. TESTING & QA

### Manual Testing Checklist

**Authentication:**
- [x] Google OAuth login
- [x] Token refresh
- [x] Logout

**Data Connectivity:**
- [x] Google Sheets read
- [x] File upload (CSV, XLSX, JSON)
- [x] Raw text input
- [x] MCP database connection

**AI Generation:**
- [x] Sheet analysis
- [x] Gemini prompt generation
- [x] 4-variant dashboard creation
- [x] Fallback model switching

**Real-time Sync:**
- [x] Write (debounced)
- [x] Read (polling)
- [x] Concurrent edits
- [x] External change detection

**UI/UX:**
- [x] Responsive design
- [x] Dark theme consistency
- [x] Loading states
- [x] Error messages
- [x] Animation smoothness

### Test Sheet

URL: `https://docs.google.com/spreadsheets/d/1AtuJqItcKqg-IPRmQkvSC4RiArbAme7o-_6O4Vrt9hA/edit?gid=380037596`

Contains budget data with:
- 4 revenue categories
- 4 cost categories
- 12 months of data
- Formula cells for totals

---

## 13. IMPORTANT NOTES FOR DEVELOPERS

### Performance Optimization

1. **Lazy load Gemini** - Import only when needed
2. **Memoize data subscriptions** - Prevent duplicate fetches
3. **Debounce aggressively** - 2s default is reasonable
4. **Cache sheet metadata** - Reuse between requests
5. **Limit polling subscriptions** - Max 5-10 concurrent

### Security Considerations

1. **Never commit .env** - Already in .gitignore
2. **OAuth Client ID is public** - No secret embedded
3. **Access tokens are short-lived** - ~1 hour expiry
4. **No data stored on server** - Everything frontend
5. **CORS handled by Google** - No manual CORS headers needed

### Common Pitfalls

1. **Forgetting accessToken** - Many API calls fail silently
2. **Wrong sheet range format** - e.g., "Sheet1!A1:M20" (tab name + range)
3. **Polling too frequently** - Will hit quota limits
4. **Batch updates without debounce** - Creates 96 requests instead of 1
5. **Gemini templates without {{tags}}** - Data won't inject

---

## 14. USEFUL COMMANDS

```bash
# Development
npm run dev              # Start dev server
npm run lint            # Check code style

# Production
npm run build           # Build for production
npm run preview         # Preview production build

# Server (optional)
npm run mcp             # Start test MCP server (port 3001)

# Cleanup
rm -rf node_modules     # Clear dependencies
npm install             # Reinstall
npm ci                  # Clean install (CI environments)
```

---

## 15. KEY FILES REFERENCE

| File | Lines | Purpose |
|------|-------|---------|
| `discuss/architecture.md` | 450 | Complete system design (READ FIRST) |
| `src/services/sheetsService.js` | 125 | Google Sheets API wrapper |
| `src/services/geminiService.js` | 112 | AI integration + fallback logic |
| `src/services/sheetAnalyzer.js` | 95 | Data type detection |
| `src/auth/GoogleAuthProvider.jsx` | 100 | OAuth context provider |
| `src/pages/AnalyzePage.jsx` | 180+ | Dashboard generation UI |
| `src/pages/ConnectPage.jsx` | 316 | Login + source selection |
| `src/engine/widgets/SmartCanvas.jsx` | 80+ | Data binding + HTML rendering |
| `src/mcp/DataHub.js` | 80 | Adapter abstraction |
| `src/mcp/adapters/*.js` | 350+ | Source-specific implementations |
| `package.json` | 44 | Dependencies |
| `.env.example` | 30 | Environment variables |

---

## 16. CONCLUSION

### What Makes CanvasSheet Special

1. **Zero Backend** - Completely frontend-based, no server setup
2. **AI-Powered** - Gemini generates layouts, not humans
3. **Multi-Source** - Google Sheets, files, databases, text
4. **Real-Time** - Bidirectional sync with polling
5. **Quota-Aware** - Smart batching and rate limiting
6. **Extensible** - DataHub abstraction for new sources
7. **Dark/Premium** - Beautiful glassmorphism UI

### Current State (2026-05-11)

- **MVP Complete** ✅ (Faz 1 & 2)
- **Production-Ready** for small teams (< 50 concurrent users)
- **Scalability** limited by Google Sheets API quotas
- **Next Priority** - User accounts + backend (Faz 3)

### Best For

- Rapid dashboard prototyping
- Google Sheets power users
- Data visualization without coding
- Small-to-medium team projects
- Budget/financial tracking
- Logistics/shipping monitoring
- Sales KPI dashboards

### Not Recommended For

- Enterprise with 1000+ concurrent users (quota issues)
- Complex real-time collaborative editing (polling latency)
- Stored dashboard persistence (needs database)
- Custom authentication (no user system yet)
- Large file uploads (client-side parsing limit ~100MB)

---

**Last Updated:** 2026-05-11  
**Status:** Phase 2 Complete, Phase 3 In Planning  
**Primary Maintainer:** Code in `/home/seyyah/works/xtatistix/dev/sheet-canvas`
