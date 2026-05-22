# CanvasSheet - Comprehensive Codebase Analysis

**Project**: AI-Powered Dynamic Dashboard Platform  
**Version**: Phase 1 (MVP) Complete, Phase 2 (AI) In Development  
**Date**: May 2026  
**Tech Stack**: React 19, Vite 8, Google Sheets API v4, OpenAI GPT-4o-mini  
**Location**: `/home/seyyah/works/xtatistix/dev/canvas-sheet`

---

## Executive Summary

**CanvasSheet** is an innovative web application that transforms Google Sheets into interactive, real-time dashboards using AI-powered analysis and dynamic widget rendering. The platform leverages Google Sheets API v4 for data access (eliminating CORS issues), OpenAI's GPT models for dashboard generation, and a modular React component architecture for flexible visualization.

**Key Innovation**: Frontend-only OAuth2 authentication with direct Google Sheets API access, allowing users to connect their own sheets without sharing or service accounts.

---

## 1. PROJECT STRUCTURE & ARCHITECTURE

### 1.1 Directory Layout

```
canvas-sheet/
├── src/
│   ├── main.jsx                          # App entry point + routing
│   ├── index.css                         # Global styles + Tailwind
│   ├── auth/
│   │   ├── GoogleAuthProvider.jsx        # OAuth2 context provider (GIS)
│   │   └── useGoogleAuth.js              # Custom hook for auth state
│   ├── services/
│   │   ├── sheetsService.js              # Google Sheets API v4 wrapper
│   │   ├── rateLimiter.js                # Debouncing, backoff, polling
│   │   ├── sheetAnalyzer.js              # Sheet structure analysis
│   │   ├── openaiService.js              # OpenAI API integration
│   │   ├── geminiService.js              # Google Gemini API integration
│   │   └── budgetDataService.js          # Budget-specific data layer
│   ├── pages/
│   │   ├── ConnectPage.jsx               # Login + sheet URL entry
│   │   ├── AnalyzePage.jsx               # Sheet analysis + dashboard gen
│   │   └── BudgetPage.jsx                # Budget simulation dashboard (Phase 1)
│   └── engine/
│       ├── DynamicDashboard.jsx          # Dashboard renderer
│       ├── WidgetRegistry.js             # Widget type mapping
│       └── widgets/
│           ├── KpiCard.jsx               # Key metric cards
│           ├── BarChart.jsx              # Bar chart component
│           ├── LineChart.jsx             # Line chart component
│           ├── PieChart.jsx              # Pie chart component
│           └── EditableTable.jsx         # Interactive data table
├── discuss/                              # Architecture documentation
│   ├── architecture.md                   # System design (READ FIRST)
│   ├── plan.md                           # Task checklist
│   ├── walkthrough.md                    # Development history
│   └── prompt.md                         # Continuation guide
├── old_src/                              # Legacy code (archived)
├── .env.example                          # Environment variables template
├── package.json                          # Dependencies
├── tailwind.config.js                    # Tailwind CSS configuration
├── vite.config.js                        # Vite build configuration
└── index.html                            # HTML entry point
```

### 1.2 Routing Structure

```
/connect  → ConnectPage (Login + Sheet URL)
/analyze  → AnalyzePage (AI Analysis + Dashboard Generation)
/budget   → BudgetPage  (Budget Simulation Dashboard)
/         → Default to /connect
```

---

## 2. TECHNOLOGY STACK

### 2.1 Frontend Framework
- **React 19.2.5**: Latest React with hooks, StrictMode for development
- **Vite 8**: Next-gen build tool with instant HMR and optimized bundles
- **React Router 7**: Client-side routing with lazy loading support
- **Tailwind CSS 4.2.4**: Utility-first CSS with custom design system

### 2.2 Authentication
- **Google Identity Services (GIS)**: OAuth2 authentication (no backend required)
- **OAuth2 Token Client**: Frontend-only token acquisition
- **Scopes**: `openid`, `email`, `profile`, `spreadsheets`, `drive.readonly`

### 2.3 APIs & External Services
- **Google Sheets API v4**: Direct REST API for read/write operations
- **OpenAI API**: GPT-4o-mini (primary), GPT-4o, GPT-4-turbo, GPT-3.5-turbo
- **Google Gemini API**: Alternative AI for dashboard generation (gemini-2.5-flash)

### 2.4 Libraries & Tools
- **Lucide React 1.14.0**: Icon library with 400+ icons
- **PapaParse 5.5.3**: CSV parsing (legacy fallback)
- **OpenAI SDK 6.36.0**: Official OpenAI JavaScript client
- **ESLint 10.2.1**: Code quality and style checking

---

## 3. KEY FEATURES & FUNCTIONALITY

### 3.1 Phase 1 - MVP (COMPLETED)

#### **Budget Simulation Dashboard**
- Real-time budget data editing with monthly columns
- Revenue and cost item management
- Auto-calculated totals and metrics
- Live preview of financial impact
- Persistent storage to Google Sheets

#### **Authentication**
- Google OAuth2 sign-in flow
- User profile retrieval (name, email, picture)
- Token management with automatic refresh
- Logout with token revocation

#### **Google Sheets Integration (V2)**
- Direct API v4 access without service accounts
- Read/write operations with batch updates
- Sheet metadata retrieval and tab selection
- Debounced writes (2s) to optimize quota usage
- 10s polling for external changes detection

#### **Rate Limiting & Performance**
- Exponential backoff for 429/503 errors
- Request batching for multiple cell updates
- Debouncing to prevent excessive writes
- Polling manager with interval control
- Quota budgeting: ~11 req/min (18% of 60 req/min limit)

#### **Data Validation**
- Robust numeric parsing (currency, percentages, decimals)
- Support for multiple number formats (US, European, Turkish)
- Legacy CSV fallback for non-authenticated users

### 3.2 Phase 2 - AI-Powered Dashboards (IN DEVELOPMENT)

#### **Sheet Analysis Engine**
- Automatic sheet structure detection
- Column type inference (number, date, string, empty)
- Row categorization (revenue, cost, total, other)
- Template detection (budget, gantt, kanban, data_table)
- Sample data extraction for AI processing

#### **AI-Powered Dashboard Generation**
- OpenAI GPT integration with model fallback chain
- Detailed system prompts for dashboard design
- Dynamic UI configuration generation
- Support for custom user requests
- Fallback to hardcoded configs on AI failure

#### **Dynamic Widget Rendering**
- Registry-based widget mapping
- Grid layout system with position-based rendering
- Data source abstraction with indices and aggregations
- Real-time polling for data updates
- Debounced saves on editable content

#### **Widget Library**
1. **KPI Card**: Single metric display with aggregations (sum, avg, count, max, min)
2. **Bar Chart**: Categorical comparisons with SVG rendering
3. **Line Chart**: Temporal trends with dual-axis support
4. **Pie Chart**: Proportional data with legend
5. **Editable Table**: Interactive data grid with cell editing

---

## 4. DATA FLOW & STATE MANAGEMENT

### 4.1 Authentication Flow

```
User clicks "Sign in with Google"
    ↓
Google Identity Services (GIS) loads
    ↓
TokenClient initialized with OAuth scopes
    ↓
User prompted for consent
    ↓
Access token received
    ↓
User info fetched from OAuth2 userinfo endpoint
    ↓
Context updated with user { name, email, picture }
    ↓
AccessToken stored in React context (not localStorage)
    ↓
User can now access Google Sheets API
```

### 4.2 Budget Dashboard Data Flow

```
1. USER CONNECTS SHEET
   ConnectPage: URL paste → extract spreadsheetId + gid
   → Verify sheet access via getSheetMetadata()
   → Store in sessionStorage
   → Navigate to /analyze

2. SHEET ANALYSIS (Phase 2)
   AnalyzePage: analyzeSheet() called
   → Read headers, sample data (first 10 rows)
   → Detect column types and row categories
   → Identify template (budget, gantt, etc.)
   → Format metadata for AI prompt

3. DASHBOARD GENERATION
   OpenAI API call: sheet metadata → UI config JSON
   → Validate UI config structure
   → Fallback to hardcoded config on failure
   → Store config in state

4. DYNAMIC RENDERING
   DynamicDashboard: Render widgets from UI config
   → Map widgets to components via WidgetRegistry
   → Extract unique data requests (sheet + range)
   → Batch load all data via Sheets API
   → Apply grid positioning
   → Handle cell edits → debounced writes

5. REAL-TIME SYNC
   Poll every 10s: readSheet() → compare with local
   → Detect external changes
   → Update state without user interruption
   → Debounced writes: 2s delay for user edits
   → Batch update via batchWriteSheet()
```

### 4.3 State Management Pattern

**Context API** for global auth state:
```javascript
GoogleAuthContext {
  user: { name, email, picture } | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: Function
  logout: Function
}
```

**Component State** for local UI:
- Page-level: spreadsheetId, sheetMetadata, uiConfig
- Widget-level: localData, editingCell, loading, error
- App-level: saveStatus, viewMode, useV2Flag

**Storage**:
- `sessionStorage`: Temporary (spreadsheetId, gid, url)
- `localStorage`: Persistent (connectedSheetId for AnalyzePage)
- `React Context`: Runtime auth state

---

## 5. API INTEGRATIONS

### 5.1 Google Sheets API v4

**Wrapper Functions** (`sheetsService.js`):

| Function | Method | Quota Cost | Use Case |
|----------|--------|-----------|----------|
| `readSheet()` | GET | 1 req | Fetch data by range |
| `writeSheet()` | PUT | 1 req | Update single range |
| `batchWriteSheet()` | POST | 1 req | Update 1+ ranges atomically |
| `getSheetMetadata()` | GET | 1 req | Fetch sheet tabs and properties |
| `getSheetNameByGid()` | GET | 1 req | Map gid → sheet name |
| `extractSpreadsheetId()` | - | - | Parse URL → ID |
| `extractGid()` | - | - | Parse URL → tab ID |

**Rate Limiting**:
- **Per User**: 60 requests/minute
- **Per Project**: 300 requests/minute
- **Strategy**: Debounce (2s) + Batch updates + Polling (10s)
- **Budget**: ~11 req/min with active editing (18% of quota)

**Example: Batch Write**
```javascript
batchWriteSheet(token, spreadsheetId, [
  { range: 'Budget!B2:B13', values: [[100], [200], ...] },
  { range: 'Budget!D5', values: [[99]] }
])
// Entire update = 1 API request
```

### 5.2 OpenAI API

**Configuration** (`openaiService.js`):

| Setting | Value | Notes |
|---------|-------|-------|
| Primary Model | gpt-4o-mini | Fast, cost-effective, 128K context |
| Fallback Models | gpt-4o, gpt-4-turbo, gpt-3.5-turbo | Automatic retry chain |
| Temperature | 0.3 | Lower = more deterministic |
| Max Tokens | 16000 | For detailed dashboard configs |
| Response Format | JSON object | Forced via OpenAI API |

**System Prompt**:
- 136-line detailed dashboard design rules
- Budget template specification
- Grid layout rules (3-column, 4 KPIs top, charts middle, table bottom)
- Critical data selection rules (monthlycolumns [2-13], avoid totals column)
- Widget type specifications

**Usage Flow**:
```
Sheet metadata → Format for AI prompt
    ↓
OpenAI API: chat.completions.create()
    ↓
Receive JSON string (with markdown wrapping)
    ↓
Clean markdown, parse JSON
    ↓
Validate config structure
    ↓
Fallback to hardcoded config if invalid
    ↓
Render dashboard from config
```

**Error Handling**:
- Try primary model first
- If fails, try fallback models in order
- If all fail, use generateFallbackConfig()
- No user-visible error if fallback succeeds

### 5.3 Google Gemini API (Alternative)

**Configuration** (`geminiService.js`):

| Setting | Value |
|---------|-------|
| Primary Model | gemini-2.5-flash |
| Fallback Models | 2.0-flash, 2.5-lite, 2.5-pro, etc. |
| Max Output Tokens | 8192 |
| Temperature | 0.2 |

**Similar to OpenAI but uses**:
- `generativelanguage.googleapis.com` endpoint
- REST API with JSON request body
- `candidates[0].content.parts[0].text` for response

---

## 6. UI/UX PATTERNS & WIDGETS

### 6.1 Design System

**Color Palette** (Tailwind):
- **Primary**: Sky blue (#0ea5e9 to #075985)
- **Success**: Green (#22c55e to #15803d)
- **Danger**: Red (#ef4444 to #b91c1c)
- **Neutral**: Slate (#f8fafc to #0f172a)

**Typography**:
- Font: Inter (system fallbacks)
- Sizes: 11px (labels) to 36px (titles)
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700+ (bold)

**Components**:
- Cards: 1px border, subtle shadow, 8-14px border-radius
- Buttons: Gradient backgrounds, hover effects, icon integration
- Forms: Input groups with icons, error states

### 6.2 Widget Architecture

**Base Widget Pattern**:
```javascript
export default function Widget({ title, dataSource, sheetData, onDataChange, gridPosition }) {
  // Data extraction from sheetData using dataSource.rowIndices/columnIndices
  // Grid positioning via gridPosition prop
  // Render within responsive container
  // Handle edits via onDataChange callback
}
```

**KPI Card** (239 lines):
- Aggregates data: sum, avg, count, max, min
- Parses currencies ($), percentages (%), decimal separators
- Formats output: $X.XXX or 9,999.99
- Single metric display with title

**Line Chart** (214 lines):
- SVG-based with no library dependencies
- Dynamic axis scaling (min/max from data)
- Multi-series support with color assignment
- Handles 1-based column indices from OpenAI

**Bar Chart** (117 lines):
- Categorical comparison
- Grouped bars for multiple series
- Auto-scaling based on data range

**Pie Chart** (143 lines):
- Proportional visualization
- Legend with category names
- Hover effects for segments

**Editable Table** (149 lines):
- Click-to-edit cells
- Debounced save (2s after last edit)
- Keyboard support (Enter, Escape)
- Maintains local state during editing

### 6.3 Grid Layout System

**CSS Grid**:
- 3-column layout (col: 0, 1, 2)
- Dynamic row heights based on widget height
- Responsive via media queries
- Widget positioned by `gridPosition: { row, col, width, height }`

**Example Config**:
```javascript
{
  type: 'kpi_card',
  gridPosition: { row: 0, col: 0, width: 1, height: 1 },
  // → CSS: grid-column: 1 / span 1; grid-row: 1 / span 1;
}
```

---

## 7. CONFIGURATION & ENVIRONMENT

### 7.1 Environment Variables

**Required** (.env file):
```env
# Google OAuth2
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com

# OpenAI
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_MODEL=gpt-4o-mini  # Optional, defaults to gpt-4o-mini

# Gemini (Optional)
VITE_GEMINI_API_KEY=AIza...
VITE_GEMINI_MODEL=gemini-2.5-flash  # Optional
```

### 7.2 Build Configuration

**Vite Config** (`vite.config.js`):
- React plugin enabled
- Default to ES modules
- Environment variables available via `import.meta.env`

**Tailwind Config** (`tailwind.config.js`):
- Custom color palette
- Extended font family (Inter)
- Custom shadow definitions
- PostCSS plugin pipeline

### 7.3 NPM Scripts

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Production build (vite build)
npm run preview   # Preview production build
npm run lint      # ESLint check
```

---

## 8. NOTABLE IMPLEMENTATION DETAILS

### 8.1 Rate Limiting Strategy

**Problem**: Google Sheets API: 60 req/min per user, no paid tier

**Solution**:
1. **Debouncing**: 2s delay before writing changes
   ```javascript
   const debouncedSave = createDebounce(saveToSheet, 2000);
   ```

2. **Batch Requests**: Combine multiple cells in single API call
   ```javascript
   // Instead of 12 separate PUT requests
   batchWriteSheet(token, spreadsheetId, [
     { range: 'A1:A12', values: [[1], [2], ...] }
   ]) // = 1 API request
   ```

3. **Exponential Backoff**: Retry on rate limit errors
   ```javascript
   async fetchWithBackoff(fetchFn, maxRetries = 3) {
     // Wait 2^attempt * 1000ms + random jitter
   }
   ```

4. **Polling Strategy**: 10s interval for reads
   ```javascript
   // 6 req/min = 18% of 60 req/min quota
   // Safe with debounced writes (3-5 req/min)
   ```

### 8.2 Value Parsing for Robust Aggregations

**Challenge**: Handle currency ($1,234.56), percentages (45%), decimals (1.23)

**Solution** (KpiCard, EditableTable, widgets):
```javascript
function parseNumericValue(val) {
  // Strip $, %, commas, spaces
  // Handle European format: 1.234,56 → 1234.56
  // Handle US format: 1,234.56 → 1234.56
  // Return parsed number or null
}
```

**Aggregation Functions**:
- `sum`: Total of all values
- `avg`: Average across values
- `count`: Non-empty cell count
- `max` / `min`: Extreme values
- `none`: Return first value (raw display)

### 8.3 OAuth2 Context Pattern

**Design**: Context provider at root level
```javascript
<GoogleAuthProvider>  {/* Initializes GIS */}
  <BrowserRouter>
    <Routes>
      <Route path="/connect" element={<ConnectPage />} />
      {/* useGoogleAuth() hook available everywhere */}
    </Routes>
  </BrowserRouter>
</GoogleAuthProvider>
```

**Key Features**:
- GIS library auto-initialization with retry
- Token client created after GIS loads
- User info fetched after token acquired
- Logout with token revocation
- No localStorage (security: avoid XSS exposure)
- Context updated immediately on state changes

### 8.4 Data Source Abstraction

**Problem**: Separate data selection from rendering logic

**Solution** (`dataSource` object):
```javascript
{
  sheetName: "Budget",
  range: "A1:N15",
  rowIndices: [1, 2, 3],      // 1-based, specific rows
  columnIndices: [2,3,...13], // 1-based, monthly columns
  aggregation: "sum"          // How to combine values
}
```

**Benefits**:
- AI can generate precise data references
- Widgets reusable across different sheets
- Indices isolated from actual cell positions
- Easy to validate and debug

### 8.5 Fallback Configuration Strategy

**Graceful Degradation**:
1. Try OpenAI GPT-4o-mini
2. Fall back to GPT-4o, GPT-4-turbo, GPT-3.5-turbo
3. If all fail, use `generateFallbackConfig()`
   - Budget template: Rich dashboard with 8 widgets
   - Generic: Simple KPI + data table

**Fallback Budget Dashboard**:
- 4 KPI cards (Annual Revenue, Costs, Profit, Margin)
- Line chart (Profitability Trends)
- Bar chart (Annual Totals)
- Editable table (Full data)

---

## 9. UNIQUE & ADVANCED FEATURES

### 9.1 No-Backend Architecture

**Innovation**: Frontend-only with OAuth2
- Users authenticate with Google account
- No backend service account needed
- No API key sharing required
- Users own their data (automatic access)
- Can be deployed on static hosting (Netlify, Vercel, GitHub Pages)

### 9.2 CORS-Free Data Access

**Standard Problem**: CSV export from Google Sheets triggers redirects → CORS errors

**CanvasSheet Solution**: Use Google Sheets API v4
- Designed for browser requests
- OAuth2 authentication
- Direct REST API
- No redirects or CORS issues

### 9.3 Multi-Model AI Fallback

**Problem**: Single AI provider could have rate limits or availability issues

**Solution**: Automatic fallback chain
```javascript
const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
for (const model of modelsToTry) {
  try {
    return await callOpenAI(model);
  } catch {
    continue; // Try next model
  }
}
```

**Support for Multiple Providers**:
- OpenAI (GPT-4o-mini, GPT-4o, GPT-4-turbo, GPT-3.5-turbo)
- Google Gemini (2.5-flash, 2.0-flash, 2.5-lite, etc.)
- Each with independent implementation

### 9.4 Smart Sheet Structure Detection

**Analyzes**:
- Column types (number, date, string, empty)
- Row categories (revenue, cost, total)
- Template patterns (budget, gantt, kanban, data_table)
- Sample data for AI context

**Example**: Budget Template Detection
- Has "Revenue", "Income", "Sales", or "Earnings" rows
- Has "Cost", "Expense", "Spend", or "Payment" rows
- Has month columns (JAN, FEB, ..., DEC)
- Results in specialized 8-widget dashboard

### 9.5 Editable Dashboard with Sync

**Workflow**:
1. User edits cell in EditableTable widget
2. Local state updated immediately (UX feedback)
3. 2s debounce delay (waits for user to stop editing)
4. Batch update sent to Google Sheets
5. Sheet polling updates remote data
6. Other widgets refresh automatically
7. Real-time collaboration-ready

---

## 10. BUILD & DEPLOYMENT

### 10.1 Development

```bash
# Install dependencies
npm install

# Start dev server with HMR
npm run dev
# → http://localhost:5173

# ESLint check
npm run lint
```

**Development Features**:
- React StrictMode for debugging
- Fast refresh (instant HMR)
- Vite's dev server
- Source maps for debugging

### 10.2 Production Build

```bash
# Build optimized bundle
npm run build
# → dist/ directory

# Preview production build locally
npm run preview
# → http://localhost:5173
```

**Build Output**:
- Minified React, Vite, Tailwind CSS
- Tree-shaking removes unused code
- Code splitting for lazy loading
- Asset optimization

### 10.3 Deployment Options

**Static Hosting** (Recommended):
- Netlify, Vercel, GitHub Pages, Cloudflare Pages
- Just upload `dist/` directory
- No backend required

**Docker** (Optional):
```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

**Environment Setup** (Hosting):
1. Set environment variables in hosting platform
2. Create OAuth2 authorized redirect URIs for your domain
3. Add test users to Google OAuth consent screen
4. Deploy the built `dist/` folder

---

## 11. TESTING & KNOWN ISSUES

### 11.1 Test Sheet

**URL**: `https://docs.google.com/spreadsheets/d/1AtuJqItcKqg-IPRmQkvSC4RiArbAme7o-_6O4Vrt9hA/edit?gid=380037596`

**Structure**:
- Budget data with 12 monthly columns (JAN-DEC)
- Revenue and cost line items
- Total and profit calculations

### 11.2 Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `redirect_uri_mismatch` | OAuth URL not configured | Add `http://localhost:5173` to Google Cloud Console → Authorized origins |
| `access_denied (403)` | User not in test users list | Add account to OAuth Consent Screen → Test users |
| `userinfo 401 Unauthorized` | Missing OAuth scopes | Verify scopes in GoogleAuthProvider.jsx |
| `invalid credentials` | Access token not retrieved | Check network tab for token acquisition |
| CORS errors | Using CSV export approach | Use Sheets API v4 with OAuth (current approach) |
| Rate limit (429) | Too many requests | Debouncing and batching handled automatically |

### 11.3 Logging & Debugging

**Console Logs**:
- `[SheetAnalyzer]`: Sheet structure analysis
- `[KpiCard]`: Data aggregation details
- `[LineChart]`: Chart data generation
- `🤖 OpenAI`: AI generation progress
- `❌ Model failed`: AI fallback chain tracking

**Browser DevTools**:
- Network tab: Google Sheets API requests
- Storage: sessionStorage (spreadsheetId, gid)
- React Components: Profiler for performance
- Console: Application logs and errors

---

## 12. FUTURE ROADMAP

### Phase 2 (In Development)
- Dashboard generation with OpenAI
- Dynamic widget rendering (currently implemented)
- Multi-sheet support
- User-customizable layouts

### Phase 3 (Planned)
- Kanban widget (column-based task management)
- Gantt widget (timeline visualization)
- Vortex widget (custom multi-module)
- WebSocket real-time sync
- Backend proxy integration
- User dashboard save/load
- Sharing and collaboration

### Phase 4 (Future)
- Mobile app (React Native Expo)
- Advanced analytics and insights
- Custom widget library
- Template marketplace
- API documentation and SDKs

---

## 13. KEY FILES REFERENCE

| File | Lines | Purpose |
|------|-------|---------|
| `src/main.jsx` | 24 | App entry, routing setup |
| `src/auth/GoogleAuthProvider.jsx` | 100 | OAuth2 context + GIS init |
| `src/services/sheetsService.js` | 125 | Sheets API v4 wrapper |
| `src/services/openaiService.js` | 428 | OpenAI integration, prompts |
| `src/services/sheetAnalyzer.js` | 279 | Sheet structure analysis |
| `src/services/rateLimiter.js` | 110 | Debounce, backoff, polling |
| `src/engine/DynamicDashboard.jsx` | 150+ | Dashboard renderer |
| `src/engine/widgets/KpiCard.jsx` | 239 | KPI aggregation widget |
| `src/pages/AnalyzePage.jsx` | 235 | Sheet analysis UI |
| `src/pages/ConnectPage.jsx` | 200+ | Login + URL entry form |
| `discuss/architecture.md` | 453 | Complete system design |
| `.env.example` | 28 | Configuration template |

---

## 14. CODE QUALITY & PATTERNS

### 14.1 Code Style

- **Language**: JavaScript (ES6+ modules)
- **Linting**: ESLint with React/Hooks plugins
- **Format**: Consistent indentation (2 spaces)
- **Comments**: Detailed JSDoc for functions
- **Error Handling**: Try-catch with user-friendly messages

### 14.2 React Patterns

- **Hooks**: useState, useEffect, useContext, useMemo, useCallback
- **Context API**: Global auth state management
- **Custom Hooks**: useGoogleAuth for auth logic
- **Memoization**: useMemo for expensive calculations
- **Cleanup**: useEffect cleanup functions for intervals/timeouts

### 14.3 Performance Optimizations

- **Code Splitting**: Vite dynamic imports for routes
- **Memoization**: useMemo for widget data calculations
- **Batch Requests**: Single API call for multiple updates
- **Debouncing**: 2s delay before saves
- **Polling**: 10s interval to reduce requests
- **Lazy Loading**: Route-based code splitting

---

## 15. SECURITY CONSIDERATIONS

### 15.1 Authentication Security

- OAuth2 tokens never stored in localStorage (XSS-safe)
- Tokens stored in React context only
- Token revocation on logout
- No API keys in frontend code
- Environment variables for sensitive data

### 15.2 API Security

- HTTPS only for all API calls
- Google's OAuth2 for authentication
- User's own credentials (no shared accounts)
- Rate limiting to prevent abuse
- No sensitive data in logs

### 15.3 Data Privacy

- User data never sent to backend
- Direct Google Sheets API access
- User owns and controls their data
- No data persistence on CanvasSheet servers
- GDPR/Privacy-friendly architecture

---

## 16. LESSONS & BEST PRACTICES

### 16.1 Why This Architecture Works

1. **Frontend-First**: No backend dependency simplifies deployment and reduces attack surface
2. **OAuth2**: User authentication without sharing sheets or API keys
3. **API v4**: CORS-free access to Google Sheets, modern REST API
4. **Rate Limiting**: Coding strategy (debounce, batch, backoff) vs. paid tier
5. **AI Fallback**: Multiple models prevent single point of failure
6. **Modular Widgets**: Registry pattern allows easy extension
7. **Context API**: Sufficient for auth state, avoids Redux complexity

### 16.2 Reusable Patterns for Similar Projects

- **Sheet URL Parsing**: Extract IDs from URLs via regex
- **OAuth2 Context**: Reusable provider for any OAuth2 service
- **Rate Limiter Utilities**: createDebounce, fetchWithBackoff, createPoller
- **Widget Registry**: Extensible component mapping system
- **Data Source Abstraction**: Decouple data selection from rendering
- **AI Integration Pattern**: Multi-model fallback chain
- **Grid Layout System**: CSS Grid with position-based props

---

## 17. CONCLUSION

**CanvasSheet** demonstrates a modern, production-ready approach to building AI-powered web applications:

✅ **Frontend-Only**: No backend required, easy deployment  
✅ **OAuth2 Authentication**: Secure, user-controlled access  
✅ **No CORS Issues**: Google Sheets API v4 fully supported  
✅ **Rate Limiting Strategy**: Quota optimization without paid tier  
✅ **AI-Powered**: OpenAI and Gemini integration with fallbacks  
✅ **Modular Architecture**: Easy to extend and customize  
✅ **Type-Safe Ready**: Foundation for TypeScript migration  
✅ **Production Ready**: Error handling, logging, cleanup  

The project serves as an excellent reference implementation for:
- OAuth2 patterns in React
- Google Sheets API integration
- AI-powered UI generation
- Rate limiting strategies
- Modular widget systems
- Real-time data synchronization

---

**Last Updated**: May 11, 2026  
**Project Status**: Phase 1 Complete, Phase 2 In Development  
**Maintainer**: seyyah (xtatistix team)
