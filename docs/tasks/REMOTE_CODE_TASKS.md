# 🤖 REMOTE CODE TASKS - CodeMirror Integration

**Project:** SAAS-DND  
**Repository:** https://github.com/SebastianVernis/SAAS-DND  
**Branch:** main  
**Total Phases:** 4  
**Estimated Total Time:** 11-15 hours

---

## 📋 TASK 1/4: CodeMirror 6 Basic Integration

### 🎯 Objetivo
Integrar CodeMirror 6 como editor de código con syntax highlighting para HTML y CSS.

### 📦 Scope
- Instalar CodeMirror 6 y extensiones
- Crear componente CodeEditorPanel
- Modal de código con tabs (HTML, CSS, JS)
- Sync bidireccional canvas ↔ code
- Syntax highlighting funcional

### 🛠️ Implementation Details

**Dependencies to install:**
```bash
npm install codemirror @codemirror/lang-html @codemirror/lang-css @codemirror/lang-javascript @codemirror/view @codemirror/state
```

**Files to create:**
```
vanilla-editor/
└── src/
    └── components/
        └── CodeEditorPanel.js  # ~200 lines
```

**Integration points:**
- Add "Code" button to toolbar
- Create modal with CodeMirror instance
- Sync canvas.innerHTML → CodeMirror on open
- Sync CodeMirror → canvas on apply
- Save code edits in undo/redo history

**Features:**
- Syntax highlighting (HTML, CSS, JS)
- Line numbers
- Auto-indentation
- Bracket matching
- Basic theme (dark/light)

### ✅ Acceptance Criteria
- [ ] CodeMirror installed and working
- [ ] Modal opens with current canvas HTML
- [ ] Syntax highlighting active (HTML/CSS)
- [ ] Apply button updates canvas
- [ ] Cancel button discards changes
- [ ] Undo/redo includes code changes
- [ ] No console errors

### 📊 Deliverables
1. `vanilla-editor/src/components/CodeEditorPanel.js`
2. Updated `vanilla-editor/script.js` with integration
3. Updated `package.json` with CodeMirror deps
4. Basic tests for code editor
5. Documentation: `docs/editor/CODE_EDITOR_GUIDE.md`

**Estimated Time:** 2-3 hours  
**Priority:** High  
**Agent:** claude or blackbox

---

## 📋 TASK 2/4: Phoenix CSSUtils Extraction

### 🎯 Objetivo
Extraer y adaptar CSSUtils.js de Phoenix Code para parseo robusto de CSS.

### 📦 Scope
- Download CSSUtils.js from Phoenix repo
- Adapt from AMD modules to ES6
- Remove Phoenix/Brackets dependencies
- Create standalone CSS parser
- Test selector extraction and matching

### 🛠️ Implementation Details

**Source files to extract:**
```
From: https://github.com/phcode-dev/phoenix
Files:
- src/language/CSSUtils.js (~1,800 lines)
- src/utils/TokenUtils.js (~300 lines)
- thirdparty/CodeMirror CSS mode (minimal)
```

**Files to create:**
```
vanilla-editor/
└── src/
    ├── phoenix/
    │   ├── CSSUtils.js         # Adapted from Phoenix
    │   ├── TokenUtils.js       # Adapted from Phoenix
    │   └── cssMode.js          # CodeMirror CSS mode (minimal)
    │
    └── utils/
        └── cssParser.js        # Wrapper class (~150 lines)
```

**Adaptation work:**
- Convert AMD `define(function(require, exports, module) {})` to ES6 `export`
- Replace `require()` calls with `import`
- Remove Brackets-specific dependencies
- Standalone CodeMirror mode integration
- Test with sample CSS

**Key functions to preserve:**
```javascript
// Must work standalone
extractAllSelectors(text, mode)
findMatchingRules(text, selector, mode)
reduceStyleSheetForRegExParsing(text)
getRangeSelectors(range)
```

### ✅ Acceptance Criteria
- [ ] CSSUtils.js adapted to ES6 modules
- [ ] No AMD/Brackets dependencies
- [ ] extractAllSelectors() works with sample CSS
- [ ] findMatchingRules() returns correct matches
- [ ] Unit tests pass (10+ test cases)
- [ ] Wrapper class provides clean API

### 📊 Deliverables
1. `vanilla-editor/src/phoenix/CSSUtils.js` (adapted)
2. `vanilla-editor/src/phoenix/TokenUtils.js` (adapted)
3. `vanilla-editor/src/utils/cssParser.js` (wrapper)
4. Unit tests: `tests/unit/cssParser.test.js`
5. Documentation: `docs/editor/CSS_PARSER_GUIDE.md`

**Estimated Time:** 3-4 hours  
**Priority:** High  
**Agent:** claude (best for code adaptation)

---

## 📋 TASK 3/4: Class Manager Implementation

### 🎯 Objetivo
Implementar Class Manager visual con auto-completado y gestión de clases CSS.

### 📦 Scope
- Create ClassManager component
- Add Classes section to Properties Panel
- CSS class autocomplete (using CSSUtils)
- Visual class tags with remove buttons
- Display styles per class
- Validation of undefined classes

### 🛠️ Implementation Details

**Files to create:**
```
vanilla-editor/
└── src/
    └── components/
        └── ClassManager.js     # ~300 lines
```

**UI Components:**
```html
<!-- In Properties Panel -->
<div id="classes-section" class="property-section">
  <div class="section-header">
    <span>🏷️ Clases CSS</span>
  </div>
  
  <div class="section-content">
    <!-- Current classes as tags -->
    <div id="class-tags-container"></div>
    
    <!-- Add class input with autocomplete -->
    <input 
      type="text" 
      id="class-input"
      list="available-classes"
      placeholder="Agregar clase..."
    >
    <datalist id="available-classes"></datalist>
    
    <!-- Styles preview per class -->
    <div id="class-styles-preview"></div>
  </div>
</div>
```

**Features to implement:**
```javascript
class ClassManager {
  // Extract all CSS classes from stylesheets
  extractAvailableClasses()
  
  // Add class to element
  addClass(className)
  
  // Remove class from element
  removeClass(className)
  
  // Toggle class
  toggleClass(className)
  
  // Get styles for specific class (using CSSUtils)
  getStylesForClass(className)
  
  // Validate class exists in CSS
  validateClass(className)
  
  // Render UI
  renderClassTags()
  renderAutocomplete()
  renderStylesPreview()
}
```

**Integration with Properties Panel:**
- Add Classes section after Typography section
- Update on element selection
- Sync with undo/redo
- Save state to localStorage

### ✅ Acceptance Criteria
- [ ] Classes section visible in Properties Panel
- [ ] Current classes displayed as removable tags
- [ ] Input has autocomplete with all CSS classes
- [ ] Adding class updates element and UI
- [ ] Removing class updates element and UI
- [ ] Styles preview shows CSS for each class
- [ ] Undefined classes show warning badge
- [ ] Undo/redo works with class changes
- [ ] No performance issues with many classes

### 📊 Deliverables
1. `vanilla-editor/src/components/ClassManager.js`
2. Updated Properties Panel HTML in `script.js`
3. CSS styles for class manager UI
4. Integration with undo/redo system
5. Tests: `tests/e2e/class-manager.spec.ts`
6. Documentation: `docs/editor/CLASS_MANAGER_GUIDE.md`

**Estimated Time:** 4-5 hours  
**Priority:** Medium  
**Agent:** claude or gemini

---

## 📋 TASK 4/4: E2E Test Fixes & Validation

### 🎯 Objetivo
Corregir los 86 tests E2E fallando y alcanzar >90% pass rate.

### 📦 Scope
- Analyze current test failures
- Fix incorrect selectors (DOM inspection)
- Adjust timeouts for remote URLs
- Improve legal modal handling
- Fix React frontend tests (502 errors)
- Fix Backend API tests
- Achieve >90% pass rate (99+ tests passing)

### 🛠️ Implementation Details

**Current status:**
- Total: 110 tests
- Passing: 24 (21.8%)
- Failing: 86 (78.2%)

**Known issues:**
1. Properties panel selector wrong (#property-panel vs #properties-panel)
2. Timeouts too short for remote URLs
3. Legal modal not handled consistently
4. React frontend: 502 Bad Gateway (services not running)
5. Backend API: Network errors

**Files to modify:**
```
tests/e2e/
├── helpers/
│   ├── editor.ts       # Fix selectors, improve robustness
│   ├── setup.ts        # Adjust timeouts
│   └── auth.ts         # Improve error handling
├── vanilla-editor.spec.ts  # Fix failing tests
├── react-frontend.spec.ts  # Fix 502 errors
└── backend-api.spec.ts     # Fix network issues
```

**Key fixes needed:**

1. **Inspect DOM and fix selectors:**
```typescript
// Before
const panel = page.locator('#property-panel');

// After (with fallbacks)
const panelSelectors = [
  '#properties-panel',
  '#property-panel',
  '.properties-panel'
];
let panel;
for (const sel of panelSelectors) {
  panel = page.locator(sel);
  if (await panel.count() > 0) break;
}
```

2. **Increase timeouts:**
```typescript
// Remote URLs need more time
await page.goto('http://18.223.32.141/vanilla', {
  waitUntil: 'networkidle',
  timeout: 30000  // Increased from 15000
});
```

3. **Robust legal modal:**
```typescript
async function acceptLegalModal(page: Page) {
  await page.waitForLoadState('networkidle');
  const checkbox = page.locator('#accept-terms-checkbox');
  const visible = await checkbox.isVisible({timeout: 3000}).catch(() => false);
  if (visible) {
    await checkbox.check();
    await page.click('#accept-btn');
    await page.waitForTimeout(1500);
  }
}
```

4. **Fix React tests:**
```bash
# Start services locally or use localhost URLs
# Update baseURL in playwright.config.ts if needed
```

### ✅ Acceptance Criteria
- [ ] >90% pass rate (99+ of 110 tests)
- [ ] All selectors verified against real DOM
- [ ] Timeouts appropriate for remote URLs
- [ ] Legal modal handled in all tests
- [ ] React frontend tests passing
- [ ] Backend API tests passing
- [ ] Screenshots captured for passing tests
- [ ] HTML report generated
- [ ] Documentation of fixes: `docs/testing/E2E_FIXES_REPORT.md`

### 📊 Deliverables
1. Fixed test files in `tests/e2e/`
2. Improved helpers in `tests/e2e/helpers/`
3. Test results with >90% pass rate
4. HTML report: `playwright-report/index.html`
5. Fixes documentation: `docs/testing/E2E_FIXES_REPORT.md`
6. Screenshots of passing tests

**Estimated Time:** 4-6 hours  
**Priority:** Critical  
**Agent:** claude (best for debugging)  
**Note:** Issue #15 already created for this

---

## 🔗 USEFUL MCPs FOR INTEGRATION

### Recommended MCPs to Install

#### 1. **Better Auth MCP**
**Purpose:** Enhanced authentication testing  
**Benefits:**
- Chat with auth documentation
- Search auth best practices
- Get auth-related code examples

**Install:** Already available in your Crush setup

---

#### 2. **Context7 MCP**
**Purpose:** Library documentation on-demand  
**Benefits:**
- Get CodeMirror docs: `resolve-library-id("codemirror")`
- Get React docs for frontend tests
- Get Playwright docs

**Commands:**
```javascript
mcp_context7_resolve-library-id({ libraryName: "codemirror" })
mcp_context7_get-library-docs({ 
  context7CompatibleLibraryID: "/codemirror/codemirror.next",
  topic: "css mode"
})
```

---

#### 3. **Filesystem MCP** (if available)
**Purpose:** Better file operations  
**Benefits:**
- Batch file operations
- Safe file modifications
- Backup before changes

---

#### 4. **Database MCP** (if available)
**Purpose:** Database testing utilities  
**Benefits:**
- Seed test data
- Clean database between tests
- Query test data

---

## 📊 TASK EXECUTION ORDER

### Sequential Execution (Recommended)

```
Task 1: CodeMirror Integration (2-3h)
   ↓
Task 2: CSSUtils Extraction (3-4h)
   ↓
Task 3: Class Manager (4-5h)
   ↓
Task 4: E2E Test Fixes (4-6h)
───────────────────────────────
Total: 13-18 hours
```

**Why sequential:**
- Task 2 depends on Task 1 (needs editor)
- Task 3 depends on Task 2 (needs CSSUtils)
- Task 4 validates all previous work

---

### Parallel Execution (Advanced)

```
Task 1 + Task 4 in parallel
   ├─ Task 1: CodeMirror (2-3h) ────┐
   │                                  ├─> Task 3: Class Manager (4-5h)
   └─ Task 4: E2E Fixes (4-6h) ─────┘
              │
              └─> Task 2: CSSUtils (3-4h)
```

**Why parallel:**
- Task 1 and 4 are independent
- Faster overall completion
- Requires 2 agents

---

## 🔧 REMOTE CODE TASK FORMAT

### Task 1 Template

```markdown
🎯 TASK 1/4: CodeMirror 6 Integration

**Repository:** https://github.com/SebastianVernis/SAAS-DND
**Branch:** main
**Priority:** High
**Duration:** 2-3 hours

## Objetivo
Integrar CodeMirror 6 como editor de código con syntax highlighting.

## Scope
- Install: codemirror, @codemirror/lang-html, @codemirror/lang-css
- Create: vanilla-editor/src/components/CodeEditorPanel.js
- Features: Syntax highlighting, line numbers, tabs (HTML/CSS/JS)
- Integration: Modal con sync bidireccional canvas ↔ code

## Documentation
- See: docs/editor/PHOENIX_CODE_ANALYSIS.md (Phase 1)
- See: docs/guides/AGENTS.md (project conventions)

## Acceptance Criteria
- CodeMirror working in modal
- Syntax highlighting active
- Sync canvas ↔ code functional
- Tests passing

## Deliverables
- CodeEditorPanel.js component
- Integration in script.js
- Documentation
- Tests
```

---

### Task 2 Template

```markdown
🎯 TASK 2/4: Phoenix CSSUtils Extraction

**Repository:** https://github.com/SebastianVernis/SAAS-DND
**Branch:** main
**Priority:** High
**Duration:** 3-4 hours
**Depends on:** Task 1 (optional)

## Objetivo
Extraer CSSUtils.js de Phoenix Code y adaptarlo a ES6 standalone.

## Scope
- Download from: https://github.com/phcode-dev/phoenix/blob/main/src/language/CSSUtils.js
- Adapt: AMD → ES6 modules
- Remove: Brackets dependencies
- Create: Wrapper class for easy usage
- Test: Selector extraction and matching

## Documentation
- See: docs/editor/BRACKETS_INTEGRATION_ANALYSIS.md
- See: docs/editor/PHOENIX_CODE_ANALYSIS.md (Phase 2)

## Acceptance Criteria
- CSSUtils.js adapted to ES6
- extractAllSelectors() working
- findMatchingRules() working
- Unit tests passing (10+)
- No external dependencies

## Deliverables
- vanilla-editor/src/phoenix/CSSUtils.js
- vanilla-editor/src/utils/cssParser.js
- tests/unit/cssParser.test.js
- Documentation
```

---

### Task 3 Template

```markdown
🎯 TASK 3/4: Class Manager Implementation

**Repository:** https://github.com/SebastianVernis/SAAS-DND
**Branch:** main
**Priority:** Medium
**Duration:** 4-5 hours
**Depends on:** Task 2 (CSSUtils)

## Objetivo
Implementar Class Manager visual con auto-completado y gestión de clases.

## Scope
- Create ClassManager component
- UI: Class tags, autocomplete input, styles preview
- Features: Add/remove classes, autocomplete, validation
- Integration: Properties Panel + undo/redo

## Documentation
- See: docs/editor/BRACKETS_INTEGRATION_ANALYSIS.md (Case 4)
- See: docs/editor/PHOENIX_CODE_ANALYSIS.md (Phase 3)

## Acceptance Criteria
- Classes section in Properties Panel
- Current classes as removable tags
- Autocomplete with all CSS classes
- Styles preview per class
- Undefined classes show warning
- Undo/redo integration

## Deliverables
- vanilla-editor/src/components/ClassManager.js
- Updated Properties Panel
- CSS styles
- E2E tests
- Documentation
```

---

### Task 4 Template

```markdown
🐛 TASK 4/4: Fix E2E Test Failures

**Repository:** https://github.com/SebastianVernis/SAAS-DND
**Branch:** main
**Priority:** Critical
**Duration:** 4-6 hours
**Issue:** #15

## Objetivo
Corregir 86 tests E2E fallando → >90% pass rate.

## Scope
- Analyze failures (npx playwright test)
- Fix selectors (inspect real DOM)
- Adjust timeouts (remote URLs)
- Fix React frontend tests (502 errors)
- Fix Backend API tests
- Document all fixes

## Documentation
- See: docs/testing/E2E_FIX_TASK.md (complete guide)
- See: tests/e2e/README.md (test guide)
- See: Issue #15 (GitHub)

## Acceptance Criteria
- Pass rate >90% (99+ tests)
- All selectors validated
- Timeouts appropriate
- React/Backend tests passing
- Fixes documented

## Deliverables
- Fixed tests in tests/e2e/
- Updated helpers
- E2E_FIXES_REPORT.md
- HTML report >90% passing
```

---

## 🎯 EXECUTION PLAN

### Option 1: Sequential (Safer)

**Week 1:**
- Monday: Task 1 (CodeMirror)
- Tuesday: Task 2 (CSSUtils)
- Wednesday: Task 3 (Class Manager)
- Thursday: Task 4 (E2E Fixes)
- Friday: Integration testing & polish

---

### Option 2: Parallel (Faster)

**Day 1:**
- Agent 1 (Claude): Task 1 (CodeMirror) - 2-3h
- Agent 2 (BLACKBOX): Task 4 (E2E Fixes) - 4-6h

**Day 2:**
- Agent 1 (Claude): Task 2 (CSSUtils) - 3-4h

**Day 3:**
- Agent 1 (Claude): Task 3 (Class Manager) - 4-5h

**Total time:** ~3 days (vs 5 days sequential)

---

## 📝 NOTES FOR AGENTS

### Task Dependencies
- Task 3 requires Task 2 (needs CSSUtils)
- Task 2 can run independent
- Task 1 can run independent
- Task 4 can run independent

### Testing Requirements
- Each task must include tests
- Task 4 is ALL about tests
- Run tests before submitting PR

### Documentation Requirements
- Each task must update relevant docs
- Create new guide docs where needed
- Update existing docs if modified

---

**Created:** 23/12/2024  
**Ready for:** Remote Code execution  
**Total effort:** 13-18 hours across 4 tasks  
**Next:** Launch tasks with remote-code
