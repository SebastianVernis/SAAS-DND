/**
 * Framework Detector
 * Automatically detects the framework and project type
 * 
 * @module FrameworkDetector
 */

export class FrameworkDetector {
  constructor() {
    this.detectors = {
      react: this.detectReact.bind(this),
      vue: this.detectVue.bind(this),
      angular: this.detectAngular.bind(this),
      svelte: this.detectSvelte.bind(this),
      html: this.detectHTML.bind(this)
    };
  }

  /**
   * Detect framework from organized files
   * @param {Object} files - Organized files
   * @returns {Promise<Object>} Framework information
   */
  async detect(files) {
    const scores = {
      react: 0,
      vue: 0,
      angular: 0,
      svelte: 0,
      html: 0
    };

    // Check package.json if available
    const packageJson = await this.findPackageJson(files.json);
    if (packageJson) {
      const pkgScores = this.scoreFromPackageJson(packageJson);
      Object.keys(pkgScores).forEach(key => {
        scores[key] += pkgScores[key];
      });
    }

    // Check file extensions
    if (files.jsx.length > 0 || files.tsx.length > 0) {
      scores.react += 10;
    }

    if (files.vue.length > 0) {
      scores.vue += 10;
    }

    // Check HTML files for framework indicators
    for (const file of files.html) {
      const content = await this.readFile(file);
      const htmlScores = this.scoreFromHTML(content);
      Object.keys(htmlScores).forEach(key => {
        scores[key] += htmlScores[key];
      });
    }

    // Check JS files for framework imports
    for (const file of [...files.js, ...files.jsx, ...files.ts, ...files.tsx].slice(0, 10)) {
      const content = await this.readFile(file);
      const jsScores = this.scoreFromJS(content);
      Object.keys(jsScores).forEach(key => {
        scores[key] += jsScores[key];
      });
    }

    // If no framework detected, default to HTML
    if (Object.values(scores).every(s => s === 0)) {
      scores.html = 10;
    }

    // Find highest score
    const detected = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    );

    const frameworkName = detected[0];
    const confidence = detected[1];

    console.log('🎯 Framework detection scores:', scores);

    return {
      name: frameworkName,
      version: await this.detectVersion(frameworkName, packageJson),
      flavor: await this.detectFlavor(frameworkName, files, packageJson),
      typescript: files.ts.length > 0 || files.tsx.length > 0,
      confidence
    };
  }

  /**
   * Find and parse package.json
   * @param {File[]} jsonFiles - JSON files
   * @returns {Promise<Object|null>} Parsed package.json
   */
  async findPackageJson(jsonFiles) {
    const pkgFile = jsonFiles.find(f => 
      f.name === 'package.json' || f.webkitRelativePath?.endsWith('package.json')
    );

    if (!pkgFile) return null;

    try {
      const content = await this.readFile(pkgFile);
      return JSON.parse(content);
    } catch (error) {
      console.warn('Failed to parse package.json:', error);
      return null;
    }
  }

  /**
   * Score framework from package.json
   * @param {Object} pkg - Parsed package.json
   * @returns {Object} Scores
   */
  scoreFromPackageJson(pkg) {
    const scores = { react: 0, vue: 0, angular: 0, svelte: 0, html: 0 };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // React detection
    if (deps.react) scores.react += 20;
    if (deps['react-dom']) scores.react += 10;
    if (deps.next) scores.react += 15;
    if (deps.gatsby) scores.react += 15;

    // Vue detection
    if (deps.vue) scores.vue += 20;
    if (deps.nuxt) scores.vue += 15;
    if (deps['@vue/cli-service']) scores.vue += 10;

    // Angular detection
    if (deps['@angular/core']) scores.angular += 20;
    if (deps['@angular/cli']) scores.angular += 10;

    // Svelte detection
    if (deps.svelte) scores.svelte += 20;
    if (deps['@sveltejs/kit']) scores.svelte += 15;

    return scores;
  }

  /**
   * Score framework from HTML content
   * @param {string} content - HTML content
   * @returns {Object} Scores
   */
  scoreFromHTML(content) {
    const scores = { react: 0, vue: 0, angular: 0, svelte: 0, html: 5 };

    // React indicators
    if (content.includes('id="root"') || content.includes('id=\'root\'')) {
      scores.react += 5;
    }
    if (content.includes('react') || content.includes('React')) {
      scores.react += 3;
    }

    // Vue indicators
    if (content.includes('id="app"') || content.includes('id=\'app\'')) {
      scores.vue += 5;
    }
    if (content.includes('v-') || content.includes('{{')) {
      scores.vue += 5;
    }

    // Angular indicators
    if (content.includes('ng-app') || content.includes('[ng')) {
      scores.angular += 5;
    }
    if (content.includes('*ngFor') || content.includes('*ngIf')) {
      scores.angular += 5;
    }

    return scores;
  }

  /**
   * Score framework from JS content
   * @param {string} content - JS content
   * @returns {Object} Scores
   */
  scoreFromJS(content) {
    const scores = { react: 0, vue: 0, angular: 0, svelte: 0, html: 0 };

    // React indicators
    if (content.includes('from \'react\'') || content.includes('from "react"')) {
      scores.react += 10;
    }
    if (content.includes('React.') || content.includes('useState') || content.includes('useEffect')) {
      scores.react += 5;
    }
    if (content.includes('jsx') || content.includes('JSX')) {
      scores.react += 3;
    }

    // Vue indicators
    if (content.includes('from \'vue\'') || content.includes('from "vue"')) {
      scores.vue += 10;
    }
    if (content.includes('createApp') || content.includes('defineComponent')) {
      scores.vue += 5;
    }

    // Angular indicators
    if (content.includes('@angular/core')) {
      scores.angular += 10;
    }
    if (content.includes('@Component') || content.includes('@Injectable')) {
      scores.angular += 5;
    }

    // Svelte indicators
    if (content.includes('from \'svelte\'') || content.includes('from "svelte"')) {
      scores.svelte += 10;
    }

    return scores;
  }

  /**
   * Detect framework version
   * @param {string} framework - Framework name
   * @param {Object} packageJson - Package.json data
   * @returns {Promise<string>} Version
   */
  async detectVersion(framework, packageJson) {
    if (!packageJson) return 'unknown';

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    switch (framework) {
      case 'react':
        return deps.react?.replace(/[\^~]/, '') || 'unknown';
      case 'vue':
        return deps.vue?.replace(/[\^~]/, '') || 'unknown';
      case 'angular':
        return deps['@angular/core']?.replace(/[\^~]/, '') || 'unknown';
      case 'svelte':
        return deps.svelte?.replace(/[\^~]/, '') || 'unknown';
      case 'html':
        return '5';
      default:
        return 'unknown';
    }
  }

  /**
   * Detect framework flavor (CRA, Next.js, Nuxt, etc.)
   * @param {string} framework - Framework name
   * @param {Object} files - Organized files
   * @param {Object} packageJson - Package.json data
   * @returns {Promise<string>} Flavor
   */
  async detectFlavor(framework, files, packageJson) {
    if (!packageJson) return 'vanilla';

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    switch (framework) {
      case 'react':
        if (deps.next) return 'next';
        if (deps.gatsby) return 'gatsby';
        if (deps['react-scripts']) return 'cra';
        if (deps.vite) return 'vite';
        return 'vanilla';

      case 'vue':
        if (deps.nuxt) return 'nuxt';
        if (deps['@vue/cli-service']) return 'vue-cli';
        if (deps.vite) return 'vite';
        return 'vanilla';

      case 'angular':
        if (deps['@angular/cli']) return 'angular-cli';
        return 'vanilla';

      case 'svelte':
        if (deps['@sveltejs/kit']) return 'sveltekit';
        if (deps.vite) return 'vite';
        return 'vanilla';

      default:
        return 'vanilla';
    }
  }

  /**
   * Detect React project
   * @param {Object} files - Organized files
   * @returns {Promise<Object>} React info
   */
  async detectReact(files) {
    // Implementation for detailed React detection
    return {
      framework: 'react',
      hasJSX: files.jsx.length > 0,
      hasTypeScript: files.tsx.length > 0
    };
  }

  /**
   * Detect Vue project
   * @param {Object} files - Organized files
   * @returns {Promise<Object>} Vue info
   */
  async detectVue(files) {
    // Implementation for detailed Vue detection
    return {
      framework: 'vue',
      hasSFC: files.vue.length > 0,
      hasTypeScript: files.ts.length > 0
    };
  }

  /**
   * Detect Angular project
   * @param {Object} files - Organized files
   * @returns {Promise<Object>} Angular info
   */
  async detectAngular(files) {
    // Implementation for detailed Angular detection
    return {
      framework: 'angular',
      hasTypeScript: true
    };
  }

  /**
   * Detect Svelte project
   * @param {Object} files - Organized files
   * @returns {Promise<Object>} Svelte info
   */
  async detectSvelte(files) {
    // Implementation for detailed Svelte detection
    return {
      framework: 'svelte'
    };
  }

  /**
   * Detect plain HTML project
   * @param {Object} files - Organized files
   * @returns {Promise<Object>} HTML info
   */
  async detectHTML(files) {
    return {
      framework: 'html',
      version: '5'
    };
  }

  /**
   * Read file content
   * @param {File} file - File to read
   * @returns {Promise<string>} Content
   */
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}
