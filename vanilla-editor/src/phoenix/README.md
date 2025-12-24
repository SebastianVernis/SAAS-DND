# Phoenix Code Modules

This directory contains adapted modules from [Phoenix Code](https://github.com/phcode-dev/phoenix), converted from AMD to ES6 modules for standalone use.

## Files

### CSSUtils.js
Adapted CSS parsing utilities from Phoenix Code. Provides functions for:
- Extracting CSS selectors
- Finding matching rules
- Extracting class names and IDs
- Parsing CSS, LESS, and SCSS

**Original:** `src/language/CSSUtils.js` from Phoenix Code  
**License:** GNU AGPL-3.0  
**Adaptations:**
- Converted from AMD to ES6 modules
- Removed Phoenix/Brackets dependencies
- Simplified for standalone use
- Added regex-based parsing for basic CSS

### TokenUtils.js
Token iteration utilities for CodeMirror. Provides functions for:
- Moving through tokens
- Getting token context
- Caching tokens for performance

**Original:** `src/utils/TokenUtils.js` from Phoenix Code  
**License:** GNU AGPL-3.0  
**Adaptations:**
- Converted from AMD to ES6 modules
- Removed lodash dependency
- Simplified for standalone use

## Usage

These modules are not meant to be used directly. Instead, use the wrapper class:

```javascript
import { CSSParser } from '../utils/cssParser.js';

const parser = new CSSParser();
const classes = parser.extractClassNames(cssText);
```

See [CSS_PARSER_GUIDE.md](../../docs/editor/CSS_PARSER_GUIDE.md) for complete documentation.

## Credits

Original code from:
- **Phoenix Code**: https://github.com/phcode-dev/phoenix
- **Copyright**: (c) 2021 - present core.ai
- **Original work**: (c) 2012 - 2021 Adobe Systems Incorporated
- **License**: GNU AGPL-3.0

Adapted for SAAS-DND project (2024)
