# CanvasSheet - Architecture Diagrams & Visual Explanations

## System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER (React 19)                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─ AUTH LAYER ─────────────────────────────────────────────────────┐  │
│  │ GoogleAuthProvider (Context)                                     │  │
│  │ • OAuth2 token management                                        │  │
│  │ • User info (name, email, picture)                             │  │
│  │ • Token refresh handling                                         │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─ PAGES ──────────────────────────────────────────────────────────┐  │
│  │ /connect        → ConnectPage (login + data source selection)   │  │
│  │ /analyze        → AnalyzePage (analysis + AI generation)        │  │
│  │ /budget         → BudgetPage (legacy budget dashboard)          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│           ↓                    ↓                      ↓                 │
│  ┌─ SERVICES (Business Logic) ──────────────────────────────────────┐  │
│  │ • sheetsService.js      → Google Sheets API v4 wrapper         │  │
│  │ • geminiService.js      → AI dashboard generation              │  │
│  │ • sheetAnalyzer.js      → Data type & role detection           │  │
│  │ • rateLimiter.js        → Debounce + backoff + polling         │  │
│  │ • budgetDataService.js  → Budget module data layer             │  │
│  │ • Brain.js              → Groq chatbot integration             │  │
│  └────────────────────────────────────────────────────────────────┘  │
│           ↓                                                             │
│  ┌─ DATA ABSTRACTION (DataHub) ─────────────────────────────────────┐  │
│  │ Unified adapter interface for all data sources                  │  │
│  │                                                                  │  │
│  │ ┌──────────────────┐  ┌────────────────┐  ┌──────────────────┐ │  │
│  │ │ GoogleSheetAdapter│  │ FileAdapter    │  │ TextAdapter     │ │  │
│  │ │ • OAuth2 token   │  │ • CSV parsing  │  │ • JSON parsing  │ │  │
│  │ │ • Sheets API v4  │  │ • XLSX reading │  │ • loose format  │ │  │
│  │ │ • Polling 5-10s  │  │ • JSON loading │  │ • Row/col array │ │  │
│  │ └──────────────────┘  └────────────────┘  └──────────────────┘ │  │
│  │                                                                  │  │
│  │ ┌─────────────────────────────┐                                 │  │
│  │ │ McpDatabaseAdapter          │                                 │  │
│  │ │ • REST endpoint fetch       │                                 │  │
│  │ │ • Live sync (5s interval)   │                                 │  │
│  │ │ • MongoDB/PostgreSQL/MySQL  │                                 │  │
│  │ └─────────────────────────────┘                                 │  │
│  └────────────────────────────────────────────────────────────────┘  │
│           ↓                                                             │
│  ┌─ WIDGET ENGINE ────────────────────────────────────────────────────┐  │
│  │ DynamicDashboard (Config-driven rendering)                       │  │
│  │ • Parse widget configs from Gemini                               │  │
│  │ • Subscribe to data updates                                      │  │
│  │ • Render SmartCanvas components                                  │  │
│  │                                                                  │  │
│  │ SmartCanvas (Universal Widget)                                   │  │
│  │ • Receives Gemini-generated HTML template                       │  │
│  │ • Injects live data via {{variable}} syntax                    │  │
│  │ • Handles {{LOOP_START}}/{{LOOP_END}} for row iteration        │  │
│  │ • Updates on data change (from polling)                         │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
          ↓              ↓                  ↓                 ↓
    ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌─────────────────┐
    │ Google   │  │ Google OAuth2│  │ Gemini   │  │ File System     │
    │ Sheets   │  │ & GIS        │  │ API      │  │ (local upload)  │
    │ API v4   │  │              │  │          │  │                 │
    └──────────┘  └──────────────┘  └──────────┘  └─────────────────┘
```

---

## Data Flow - Complete User Journey

```
START: User visits http://localhost:5173/connect
  │
  ├─→ GoogleAuthProvider loads GIS library
  │   └─ Scopes: openid, email, profile, spreadsheets, drive.readonly
  │
  ├─→ User clicks "Sign in with Google"
  │   └─ GIS popup shows login form
  │
  ├─→ User authenticates
  │   └─ GIS returns access_token (~1 hour expiry)
  │
  ├─→ User selects data source:
  │
  │   ┌─ GOOGLE SHEETS ────────────────────────────────────┐
  │   │ 1. User pastes Sheets URL                          │
  │   │ 2. extractSpreadsheetId() extracts ID              │
  │   │ 3. DataHub.connect('google_sheets', {...})         │
  │   │ 4. GoogleSheetAdapter created                      │
  │   │ 5. getSheetMetadata() called (Sheets API)          │
  │   │ 6. Sheet name, tabs, column headers extracted      │
  │   └────────────────────────────────────────────────────┘
  │
  │   ┌─ FILE UPLOAD ──────────────────────────────────────┐
  │   │ 1. User uploads CSV/XLSX/JSON file                 │
  │   │ 2. FileAdapter created with File object            │
  │   │ 3. parseCsv()/parseExcel()/parseJson() called      │
  │   │ 4. Data normalized to 2D array [headers, ...rows]  │
  │   └────────────────────────────────────────────────────┘
  │
  │   ┌─ TEXT INPUT ───────────────────────────────────────┐
  │   │ 1. User pastes JSON or key:value format            │
  │   │ 2. TextAdapter created with text string            │
  │   │ 3. JSON.parse() or parseLooseText() called         │
  │   │ 4. Data normalized to 2D array                     │
  │   └────────────────────────────────────────────────────┘
  │
  │   ┌─ MCP DATABASE ─────────────────────────────────────┐
  │   │ 1. User selects database type & enters URL         │
  │   │ 2. McpDatabaseAdapter created                      │
  │   │ 3. fetch(URL) retrieves JSON array                 │
  │   │ 4. Data normalized to 2D array                     │
  │   │ 5. Subscribe for live updates (5s polling)         │
  │   └────────────────────────────────────────────────────┘
  │
  ├─→ Adapter initialization complete
  │   └─ Session storage updated with source type & config
  │
  ├─→ Navigate to /analyze
  │
  ├─→ AnalyzePage mounts
  │   │
  │   ├─ Fetch raw data (A1:Z500 range)
  │   │   └─ DataHub.fetchData() calls adapter.fetchData()
  │   │
  │   ├─ Analyze sheet metadata
  │   │   └─ analyzeSheet() detects:
  │   │      • Column names
  │   │      • Data types (number, date, string, boolean)
  │   │      • Semantic roles (dimension, measure, etc.)
  │   │      • Currency units ($, €, TL, %)
  │   │      • Sample values (first 3 rows)
  │   │
  │   ├─ Display analysis results
  │   │   └─ User sees column stats, row count, data preview
  │   │
  │   ├─ User enters custom prompt (optional)
  │   │   └─ e.g., "Show budget by category with color coding"
  │   │
  │   ├─ Click "Generate Dashboard"
  │   │
  │   ├─ generateMultipleDashboardConfigs() called
  │   │   │
  │   │   ├─ formatMetadataForPrompt() creates context
  │   │   │   └─ COLUMNS section with {{tag}} syntax
  │   │   │
  │   │   ├─ Call Gemini API 4 times with different styles:
  │   │   │   1. EXECUTIVE OVERVIEW (High-level KPIs)
  │   │   │   2. DETAILED PERFORMANCE (Data grids & charts)
  │   │   │   3. VISUAL & TRENDY (Futuristic, gradients)
  │   │   │   4. ACTION ORIENTED (Progress bars, alerts)
  │   │   │
  │   │   ├─ Gemini returns dashboard configs:
  │   │   │   {
  │   │   │     "title": "Dashboard Title",
  │   │   │     "widgets": [
  │   │   │       {
  │   │   │         "type": "dynamic_canvas",
  │   │   │         "title": "Widget Title",
  │   │   │         "config": {
  │   │   │           "htmlTemplate": "<div>... {{column}} ...</div>"
  │   │   │         }
  │   │   │       }
  │   │   │     ]
  │   │   │   }
  │   │   │
  │   │   └─ Array of 4 configs returned
  │   │
  │   ├─ Display carousel of 4 dashboard options
  │   │   └─ User selects favorite design
  │   │
  │   └─ Mock render selected dashboard
  │       (with NOVA chatbot assistant sidebar)
  │
  ├─→ DynamicDashboard component mounts
  │   │
  │   ├─ Extract data sources from config
  │   │   └─ Parse widget dataSource fields
  │   │
  │   ├─ Batch fetch all required data
  │   │   └─ Promise.all() for parallel requests
  │   │
  │   ├─ Subscribe to data updates
  │   │   └─ For each data source:
  │   │      DataHub.subscribe(range, (data) => {
  │   │        setSheetData(prev => ({...prev, [range]: data}))
  │   │      })
  │   │      └─ Polling callback (5-10s interval)
  │   │
  │   ├─ Render SmartCanvas widgets
  │   │   └─ For each widget in config:
  │   │      <SmartCanvas
  │   │        title={widget.title}
  │   │        config={widget.config}
  │   │        sheetData={sheetData[widget.dataSource.range]}
  │   │      />
  │   │
  │   └─ Cleanup subscriptions on unmount
  │       (clearInterval for polling)
  │
  ├─→ LIVE DASHBOARD READY
  │   │
  │   ├──→ USER INTERACTION (Edit values)
  │   │   │
  │   │   └─→ Cell onChange event
  │   │       │
  │   │       ├─ Update local state (optimistic)
  │   │       │   └─ UI reflects change immediately
  │   │       │
  │   │       ├─ Call debouncer.set(newData, 2000ms)
  │   │       │   └─ Wait 2 seconds for more edits
  │   │       │
  │   │       └─→ After 2s debounce (if no more edits)
  │   │           │
  │   │           ├─ Collect all changes
  │   │           │
  │   │           ├─ batchWriteSheet() API call
  │   │           │   └─ POST /values:batchUpdate
  │   │           │       └─ Multiple ranges in one request!
  │   │           │           (Critical for quota efficiency)
  │   │           │
  │   │           ├─ Show "Saving..." indicator
  │   │           │
  │   │           ├─ If 429 error (quota exceeded)
  │   │           │   └─ Exponential backoff: 1s, 2s, 4s
  │   │           │
  │   │           └─ Show "Saved" when complete
  │   │
  │   ├──→ POLLING (Every 5-10 seconds)
  │   │   │
  │   │   └─→ Adapter.subscribe() interval
  │   │       │
  │   │       ├─ DataHub.fetchData(range)
  │   │       │   └─ GET Sheets API for fresh data
  │   │       │
  │   │       ├─ Compare with cached version
  │   │       │   └─ Detect external changes
  │   │       │
  │   │       └─ If different
  │   │           └─ Update React state
  │   │               └─ UI re-renders with new data
  │   │
  │   └─ DASHBOARD STAYS IN SYNC ✓
  │       (User <--> React State <--> Sheets API)
  │
  └─ QUIT: User closes tab or logs out
      └─ Cleanup:
         • Clear intervals (polling)
         • Revoke access token
         • Clear session storage
```

---

## Component Hierarchy

```
<GoogleAuthProvider>
  {/* Provides: user, accessToken, login, logout */}

  <BrowserRouter>
    <Routes>

      {/* ROUTE 1: Login & Data Source Selection */}
      <Route path="/connect" element={
        <ConnectPage>
          {/* Tabs: Sheet | File | Text | MCP */}
          {/* Google login button */}
          {/* Data source input forms */}
          {/* handleConnect() → DataHub.connect() → /analyze */}
        </ConnectPage>
      } />

      {/* ROUTE 2: Analysis & AI Generation */}
      <Route path="/analyze" element={
        <AnalyzePage>
          {/* handleAnalyze() → analyzeSheet() */}
          {/* Metadata display (columns, types, samples) */}
          {/* Custom prompt input */}
          {/* Click "Generate" → generateMultipleDashboardConfigs() */}
          {/* Carousel of 4 AI-generated dashboard designs */}
          {/* NOVA chatbot assistant */}
          {/* Export JSON button */}
          {/* Mock preview of selected dashboard */}
        </AnalyzePage>
      } />

      {/* ROUTE 3: Legacy Budget Module */}
      <Route path="/budget" element={
        <BudgetPage>
          {/* Editable budget table */}
          {/* Real-time charts */}
          {/* Auto-save with debounce */}
          {/* Polling sync indicator */}
        </BudgetPage>
      } />

    </Routes>
  </BrowserRouter>
</GoogleAuthProvider>
```

---

## Data Source Adapter Pattern

```
UNIFIED INTERFACE (DataHub)
  ├─ adapter.getMetadata()     → Returns source metadata
  ├─ adapter.fetchData(range)  → Returns 2D array [[headers], [rows...]]
  └─ adapter.subscribe(range, callback) → Live update polling

┌───────────────────────────────────────────────────────────────────────┐
│                     ADAPTER IMPLEMENTATIONS                           │
├───────────────────────────────────────────────────────────────────────┤

GoogleSheetAdapter:
  • Input: accessToken, spreadsheetId
  • getMetadata()
    └─ Calls: GET /spreadsheets/{id}?fields=sheets.properties
      └─ Returns: { sheetName, headers, rawMetadata }
  • fetchData(range)
    └─ Calls: GET /spreadsheets/{id}/values/{range}
      └─ Returns: 2D array of cell values
  • subscribe(range, callback)
    └─ setInterval every 5000ms (5 seconds)
      └─ Polls fetchData() and calls callback

FileAdapter:
  • Input: File object (from <input type="file">)
  • getMetadata()
    └─ Parses file header
      └─ Returns: { sourceType: 'file', fileName, rowCount, ... }
  • fetchData()
    └─ Returns: Full file data (2D array)
      └─ No polling (static file)

TextAdapter:
  • Input: Raw text string (JSON or key:value format)
  • getMetadata()
    └─ Parses text
      └─ Returns: { sourceType: 'text', rowCount, ... }
  • fetchData()
    └─ Returns: 2D array
      └─ No polling (static text)

McpDatabaseAdapter:
  • Input: Database URL (REST endpoint)
  • getMetadata()
    └─ Fetches from URL
      └─ Returns: { sourceType: 'mcp', dbType, isLive: true }
  • fetchData()
    └─ Fetches from URL
      └─ Returns: 2D array
  • subscribe(range, callback)
    └─ setInterval every 5000ms
      └─ Fetches fresh data with cache-breaking ?t=timestamp
      └─ Calls callback if data changed

└───────────────────────────────────────────────────────────────────────┘
```

---

## Rate Limiting & Quota Management

```
GOOGLE SHEETS API QUOTAS (FREE TIER)
  • 60 requests/minute per user
  • 300 requests/minute per project
  • NO paid tier available

OPTIMIZATION STRATEGIES:

1. BATCH REQUESTS
   ┌─────────────────────────────────────────────────────┐
   │ WITHOUT BATCHING:                                   │
   │ • Edit 96 cells (8 columns × 12 months)             │
   │ • Each cell = 1 API request                         │
   │ • Total: 96 requests (uses 96 req/min quota)        │
   └─────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────┐
   │ WITH BATCHING (implemented):                        │
   │ • Collect all changes in array                      │
   │ • batchWriteSheet([                                 │
   │     { range: 'B2:M2', values: [[...]] },            │
   │     { range: 'B3:M3', values: [[...]] }             │
   │   ])                                                │
   │ • Total: 1 request (uses 1 req/min quota)           │
   │ • RESULT: 96x efficiency improvement!               │
   └─────────────────────────────────────────────────────┘

2. DEBOUNCING
   User edits cells rapidly:
   Edit 1 → (2000ms timer starts)
   Edit 2 → (reset timer)
   Edit 3 → (reset timer)
   ... no more edits for 2s
   → Send batch update

3. EXPONENTIAL BACKOFF
   If quota exceeded (HTTP 429):
   Attempt 1: Immediate
   Attempt 2: Wait 1 second
   Attempt 3: Wait 2 seconds
   Attempt 4: Wait 4 seconds
   → Retry up to 3 times

4. SMART POLLING
   Read quota limit: 60 req/min per user
   Polling interval: 10 seconds
   Requests per minute: 60 / 10 = 6 req/min
   Usage: 6 / 60 = 10% of quota (SAFE)

5. CACHING
   • Data cached at adapter level
   • Avoid redundant fetches
   • Subscribe() uses cache between polls

QUOTA BUDGET (SINGLE USER):
  • Page load: 1 GET request
  • Polling (per 10 sec): 1 GET request
  • Active editing (per 2 sec debounce): 1 batchUpdate
  • Typical usage: 6 (polling) + 3 (editing) = 9 req/min
  • Quota usage: 9 / 60 = 15% (SAFE)

SCALING:
  • 1 user = 15% quota usage ✓
  • 4 users = 60% quota usage ✓
  • 10 users = 150% quota usage ✗ (EXCEEDS)
  → Solution for Faz 3: Backend caching layer
```

---

## AI Dashboard Generation Flow

```
INPUT: Sheet data + User prompt

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: DATA ANALYSIS                                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ analyzeSheet(data) in sheetAnalyzer.js:                           │
│                                                                     │
│ • Extract headers: [name1, name2, name3, ...]                     │
│ • For each column:                                                 │
│   ├─ Sample first 20 rows                                         │
│   ├─ Detect type:                                                 │
│   │   • 60%+ numeric values → "number"                            │
│   │   • Valid dates → "date"                                      │
│   │   • Otherwise → "string"                                      │
│   ├─ Detect currency unit:                                        │
│   │   • $, €, TL, % symbols in data or header names              │
│   ├─ Detect semantic role:                                        │
│   │   • Headers containing "date", "time", "month" → dimension_time
│   │   • Headers containing "category", "product" → dimension_category
│   │   • Headers containing "total", "revenue" → measure_primary    │
│   │   • Headers containing "status" → dimension_status            │
│   └─ Store sample values (first 3 rows)                          │
│                                                                     │
│ OUTPUT: metadata = {                                               │
│   sheetName: "Budget 2026",                                       │
│   headers: ["Category", "Jan", "Feb", ...],                       │
│   columnStats: [                                                   │
│     {                                                              │
│       name: "Category",                                           │
│       type: "string",                                             │
│       role: "dimension_category",                                 │
│       unit: "",                                                   │
│       sampleValues: ["License", "Salary", ...]                   │
│     },                                                             │
│     {                                                              │
│       name: "Jan",                                                │
│       type: "number",                                             │
│       role: "measure_primary",                                    │
│       unit: "$",                                                  │
│       sampleValues: [10000, 8500, ...]                           │
│     }                                                              │
│   ]                                                                │
│ }                                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: CONTEXT FORMATTING                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ formatMetadataForPrompt(metadata):                                │
│                                                                     │
│ Converts metadata to readable text with {{tags}}:                │
│                                                                     │
│ Source: Budget 2026                                               │
│ Rows: 12                                                           │
│ COLUMNS (Use these as {{tags}} in your HTML):                   │
│ - "{{category}}": Category (string, dimension_category),         │
│   Samples: License, Salary, Rent                                 │
│ - "{{jan}}": Jan (number, measure_primary), Unit: $              │
│   Samples: 10000, 8500, 5000                                     │
│ - "{{feb}}": Feb (number, measure_primary), Unit: $              │
│   Samples: 10000, 8500, 5000                                     │
│ ...                                                                │
│                                                                     │
│ This context is passed to Gemini for dashboard generation       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: GEMINI API CALLS (WITH FALLBACK)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ generateMultipleDashboardConfigs(metadataPrompt, userRequest):   │
│                                                                     │
│ For each of 4 styles:                                            │
│   1. EXECUTIVE OVERVIEW: High-level KPIs                         │
│   2. DETAILED PERFORMANCE: Data grids and charts                 │
│   3. VISUAL & TRENDY: Futuristic design, gradients              │
│   4. ACTION ORIENTED: Progress bars and alerts                   │
│                                                                     │
│ For each style:                                                   │
│   try {                                                           │
│     Call Gemini API:                                             │
│     POST https://generativelanguage.googleapis.com/v1beta/       │
│            models/{modelName}:generateContent                     │
│                                                                     │
│     Request body:                                                 │
│     {                                                             │
│       contents: [{                                                │
│         parts: [{                                                 │
│           text: `${SYSTEM_PROMPT}\n\n                            │
│                  PERSPECTIVE: ${style}\n\n                      │
│                  METADATA:\n${metadataPrompt}`                   │
│         }]                                                         │
│       }],                                                         │
│       generationConfig: {                                         │
│         temperature: 0.2  // Low creativity, predictable output │
│       }                                                            │
│     }                                                             │
│                                                                     │
│     Parse response:                                               │
│     • Extract JSON from response text                            │
│     • Validate dashboard structure                               │
│     • Return config object                                       │
│   } catch (error) {                                              │
│     Try next model from fallback list:                           │
│       [ENV_MODEL, ...flashModels, ...proModels, ...]            │
│   }                                                               │
│                                                                     │
│ OUTPUT: Array of 4 dashboard configs                            │
│                                                                     │
│ Example single config:                                            │
│ {                                                                 │
│   "title": "Budget Overview 2026",                              │
│   "subtitle": "Revenue vs Expenses Analysis",                    │
│   "widgets": [                                                   │
│     {                                                             │
│       "type": "dynamic_canvas",                                  │
│       "title": "Total Revenue",                                  │
│       "gridPosition": { "colSpan": 2, "rowSpan": 1, "order": 1 },│
│       "config": {                                                │
│         "htmlTemplate": "<div class='rounded-lg bg-white/10...   │
│           <h3>{{total_revenue}}</h3>                            │
│           <p class='text-sm'>YoY Growth: {{growth}}%</p>         │
│         </div>"                                                  │
│       }                                                           │
│     },                                                            │
│     {                                                             │
│       "type": "dynamic_canvas",                                  │
│       "title": "Monthly Breakdown",                              │
│       "gridPosition": { "colSpan": 4, "rowSpan": 2, "order": 2 },│
│       "config": {                                                │
│         "htmlTemplate": "<div class='space-y-2'>                │
│           {{LOOP_START}}                                         │
│           <div class='flex items-center'>                       │
│             <span>{{category}}</span>                           │
│             <div class='bar' style='width:{{jan}}%'>{{jan}}</div>│
│           </div>                                                 │
│           {{LOOP_END}}                                           │
│         </div>"                                                  │
│       }                                                           │
│     }                                                             │
│   ]                                                               │
│ }                                                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: UI RENDERING (SmartCanvas)                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ <DynamicDashboard uiConfig={selectedConfig}>                    │
│   ↓                                                                │
│   For each widget in uiConfig.widgets:                          │
│   <SmartCanvas                                                   │
│     title={widget.title}                                         │
│     config={widget.config}                                       │
│     sheetData={sheetData}                                        │
│   />                                                              │
│   ↓                                                                │
│   SmartCanvas receives Gemini HTML template                    │
│   ↓                                                                │
│   Processes {{variable}} injection:                            │
│   1. Extract headers from sheetData                             │
│   2. For each column, create clean tag (e.g., "total_revenue") │
│   3. If template has {{LOOP_START}}...{{LOOP_END}}:            │
│      • Render loop template for each row                       │
│      • Replace {{COL_0}}, {{COL_1}} with cell values          │
│      • Replace {{clean_header}} with cell value                │
│   4. For global variables:                                       │
│      • {{TOTAL_ROWS}} → row count                             │
│      • {{HEADER_0}} → column name                             │
│      • {{clean_header}} → latest value for column             │
│   5. Return rendered HTML                                        │
│   ↓                                                                │
│   dangerouslySetInnerHTML on <div>                            │
│   (⚠️ XSS risk if template contains user data)                 │
│   ↓                                                                │
│   LIVE DASHBOARD DISPLAYED ✓                                    │
│                                                                     │
│ On data update (from polling):                                  │
│   • sheetData state changes                                      │
│   • SmartCanvas re-renders with new values                     │
│   • {{variable}} tags replaced with fresh data                │
│   • Dashboard updates in real-time                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Real-Time Sync Mechanism

```
LOCAL STATE ← USER EDIT → SHEETS API ← EXTERNAL CHANGES

┌─────────────────────────────────────────────────────────────────────┐
│ WRITE PATH (User → Sheet)                                          │
├─────────────────────────────────────────────────────────────────────┤

User clicks cell and types "999":
  ↓
onChange handler triggered
  ↓
LOCAL STATE updated immediately
  └─ React state: { B2: 999 }
  └─ UI renders new value (optimistic)
  └─ User sees change instantly
  ↓
rateLimiter.debounce(() => {
  // Wait 2000ms for more edits
  // If user edits again, reset timer
}) 
  ↓
After 2000ms with NO MORE EDITS:
  ↓
Collect all changed cells from local state
  └─ Changes: [{ range: 'B2:M2', values: [[999, 30, 22, ...]] }, ...]
  ↓
batchWriteSheet(accessToken, spreadsheetId, changes)
  └─ POST /spreadsheets/{id}/values:batchUpdate
  ↓
Show "Saving..." indicator
  ↓
If HTTP 429 (quota exceeded):
  └─ Wait 1 second
  └─ Retry (exponential backoff: 1s, 2s, 4s)
  ↓
If success:
  └─ Show "Saved" indicator (1 second)
  └─ Clear indicator
  ↓
If persistent error:
  └─ Show error message
  └─ Allow user to retry

EFFICIENCY: 96 cells → 1 API request (98% quota savings!)

└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ READ PATH (Sheet → User)                                           │
├─────────────────────────────────────────────────────────────────────┤

Polling runs every 5-10 seconds (configurable):
  ↓
setInterval(() => {
  // 5000ms = 5 second interval
}, 5000)
  ↓
When interval fires:
  ↓
DataHub.fetchData(range)
  └─ GET /spreadsheets/{id}/values/{range}
  └─ Returns current sheet data
  ↓
Compare with cached version:
  └─ if (newData !== cachedData) {
       // Data changed (user or external)
     }
  ↓
If different:
  ↓
Update cache:
  └─ adapter.dataCache[range] = newData
  ↓
Call subscriber callback:
  └─ callback(newData)
  ↓
React state updated:
  └─ setSheetData(prev => ({...prev, [range]: newData}))
  ↓
Components re-render with fresh data
  ↓
UI shows latest values
  ↓
If same as before:
  └─ No callback, no re-render
  └─ Saves performance (React reconciliation skipped)

EXAMPLES:
• User A in browser tab A edits cell B2
  → Sends write via batchUpdate (1 API call)
  → Sheet API updates Google Sheets
  → User B in browser tab B polls (every 5-10s)
  → Detects change, updates UI
  → Realtime(ish) sync ✓

• External Google Sheets webapp changes cell C5
  → Sheet API updates value
  → CanvasSheet polling (every 5-10s)
  → Detects change, updates dashboard
  → Change visible to user ✓

QUOTA EFFICIENCY:
• Poll interval: 10 seconds
• Requests per minute: 6 (60 / 10)
• User quota: 60 req/min
• Polling usage: 10% (SAFE)
• Available for writes: 54 req/min

└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ FUTURE: WebSocket Real-Time (Faz 3)                               │
├─────────────────────────────────────────────────────────────────────┤

When backend is added:
  ↓
Frontend connects to backend WebSocket:
  └─ const socket = io('https://api.example.com')
  ↓
User A edits cell:
  └─ Sends: { action: 'edit', cell: 'B2', value: 999 }
  ↓
Backend receives → writes to Sheets API
  ↓
Backend broadcasts to all connected clients:
  └─ User B receives same update via WebSocket (instant!)
  └─ User B's UI updates without polling
  ↓
RESULT: True realtime multi-user editing
  (vs current 5-10s polling latency)

└─────────────────────────────────────────────────────────────────────┘
```

---

## Environment Configuration & Security

```
ENVIRONMENT VARIABLES (.env file)

Required:
  VITE_GOOGLE_CLIENT_ID=xxx...apps.googleusercontent.com
    └─ Public OAuth2 Client ID (safe to commit, but don't)
    └─ From Google Cloud Console
    └─ Used for: initTokenClient() in GoogleAuthProvider

  VITE_GEMINI_API_KEY=xxx...
    └─ Gemini API key (SECRET - never commit!)
    └─ From aistudio.google.com/app/apikey
    └─ Free tier: 10 req/min
    └─ Used for: Dashboard configuration generation

Optional:
  VITE_GOOGLE_CLIENT_SECRET=xxx...
    └─ Not used in current frontend-only setup
    └─ Will be used in Faz 3 when backend added

  VITE_GEMINI_MODEL=gemini-2.5-flash
    └─ Primary Gemini model to use
    └─ Fallback order: flash → pro → lite
    └─ Different models = different quotas

  VITE_GROQ_API_KEY=xxx...
    └─ Groq API key (optional, for chatbot)
    └─ Used for: NOVA assistant (Brain.js)

SECURITY NOTES:
  • .env is in .gitignore ✓
  • OAuth Client ID is public (safe in frontend)
  • Gemini API key is secret (should NOT be in frontend)
    → For Faz 3, move to backend
  • No database credentials stored
  • No session tokens persisted
  • All data is frontend-only
```

---

This document provides comprehensive visual explanations of CanvasSheet's architecture, data flows, and technical implementations.
