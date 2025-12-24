# 🧪 Issue #12 Testing Guide

**Quick Reference for Testing Text Editing & Resize Systems**

---

## 🚀 Quick Start

### Run All Tests
```bash
npx playwright test text-editing-resize.spec.ts
```

### Run with UI (Recommended for First Time)
```bash
npx playwright test text-editing-resize.spec.ts --ui
```

### Run Specific Suite
```bash
# Text editing only
npx playwright test text-editing-resize.spec.ts -g "Suite 1"

# Resize handles only
npx playwright test text-editing-resize.spec.ts -g "Suite 2"

# Combined operations
npx playwright test text-editing-resize.spec.ts -g "Suite 4"
```

### Generate HTML Report
```bash
npx playwright test text-editing-resize.spec.ts --reporter=html
npx playwright show-report
```

---

## 📋 Test Suites Overview

| Suite | Tests | Focus Area | Priority |
|-------|-------|------------|----------|
| Suite 1 | 5 | Text Editing | High |
| Suite 2 | 9 | Resize Handles | High |
| Suite 3 | 2 | Properties Panel | Medium |
| Suite 4 | 3 | Combined Operations | High |
| Suite 5 | 3 | Edge Cases | Medium |
| Suite 6 | 3 | Visual Feedback | Low |
| Suite 7 | 2 | Keyboard Shortcuts | Medium |
| **Total** | **35** | **All Features** | - |

---

## ✅ Expected Results

### Pass Criteria
- **Minimum:** 30/35 tests passing (85%)
- **Target:** 33/35 tests passing (94%)
- **Ideal:** 35/35 tests passing (100%)

### Common Failures (Acceptable)
- Timing issues on slow systems (1-2 tests)
- Tooltip visibility timing (Suite 6)
- Properties panel sync delays (Suite 3)

---

## 🔍 Manual Testing Checklist

If automated tests fail or you want to verify manually:

### Text Editing
1. Load template "Landing Page SaaS"
2. Double-click on H1 → Should become editable
3. Type new text → Should update
4. Press Enter → Should save and exit
5. Double-click on DIV → Should NOT become editable

### Resize Handles
1. Select any element (click on it)
2. Verify 8 blue circular handles appear
3. Hover over each handle → Cursor should change
4. Drag East handle right → Element should widen
5. Drag South handle down → Element should grow taller
6. Hold Shift + drag corner → Should maintain aspect ratio
7. Start drag + press Esc → Should cancel and restore size

### Integration
1. Edit text in H2
2. Then resize the H2
3. Both operations should work without conflicts

---

## 🐛 Troubleshooting

### Tests Won't Run
```bash
# Install Playwright browsers
npx playwright install

# Check Playwright is installed
npx playwright --version
```

### Tests Timeout
```bash
# Increase timeout
npx playwright test text-editing-resize.spec.ts --timeout=60000
```

### Can't See What's Happening
```bash
# Run in headed mode (shows browser)
npx playwright test text-editing-resize.spec.ts --headed

# Run in debug mode (step through)
npx playwright test text-editing-resize.spec.ts --debug
```

### Specific Test Fails
```bash
# Run only that test
npx playwright test text-editing-resize.spec.ts -g "2.2: Should resize horizontally"
```

---

## 📊 Interpreting Results

### ✅ All Tests Pass
**Status:** APPROVED  
**Action:** Close Issue #12, merge to production

### ⚠️ 1-2 Tests Fail
**Status:** ACCEPTABLE  
**Action:** Review failures, if timing-related, approve with notes

### ❌ 3+ Tests Fail
**Status:** NEEDS INVESTIGATION  
**Action:** Review test report, check console errors, investigate code

---

## 📸 Screenshots

All test runs automatically generate screenshots in:
```
screenshots/vanilla/issue-12/
```

Review these for visual validation of:
- Handle appearance
- Tooltip display
- Text editing state
- Resize operations

---

## 📝 Reporting Issues

If you find bugs during testing:

1. **Note the test name** (e.g., "2.2: Should resize horizontally")
2. **Check console errors** in browser DevTools
3. **Take screenshot** of the issue
4. **Note browser version** (Chrome, Firefox, etc.)
5. **Report in Issue #12** with details

---

## 🎯 Success Criteria

Issue #12 is considered **RESOLVED** when:

- ✅ Automated test suite passes (85%+ tests)
- ✅ Manual testing confirms functionality
- ✅ No critical bugs found
- ✅ Documentation is accurate
- ✅ Performance is acceptable (60 FPS)

---

## 📚 Additional Resources

- **Full Test Report:** `/reports/ISSUE_12_TEST_REPORT.md`
- **Test Suite Code:** `/tests/e2e/text-editing-resize.spec.ts`
- **Documentation:** `/docs/editor/TEXT_EDITING_AND_RESIZE.md`
- **Source Code:**
  - Text Editing: `vanilla-editor/script.js` (line 2210)
  - Resize: `vanilla-editor/src/core/resizeManager.js`

---

## 🚀 Quick Commands Reference

```bash
# Run all tests
npm test text-editing-resize

# Run with UI
npm test text-editing-resize -- --ui

# Run specific suite
npm test text-editing-resize -- -g "Suite 1"

# Generate report
npm test text-editing-resize -- --reporter=html

# Debug mode
npm test text-editing-resize -- --debug

# Headed mode (see browser)
npm test text-editing-resize -- --headed
```

---

**Created:** December 24, 2025  
**Issue:** #12  
**Status:** Ready for Testing  
**Estimated Time:** 15-30 minutes for full test run
