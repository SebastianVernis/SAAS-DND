/**
 * Project Analyzer
 * Analyzes project structure and metadata
 * 
 * @module ProjectAnalyzer
 */

export class ProjectAnalyzer {
  constructor() {
    this.metadata = null;
  }

  /**
   * Analyze project structure
   * @param {Object} files - Organized files
   * @param {Object} framework - Detected framework
   * @returns {Promise<Object>} Project metadata
   */
  async analyze(files, framework) {
    const packageJson = await this.findPackageJson(files.json);
    const structure = this.analyzeStructure(files);
    const dependencies = this.analyzeDependencies(packageJson);
    const buildTool = this.detectBuildTool(packageJson, files);

    this.metadata = {
      name: packageJson?.name || 'Unnamed Project',
      version: packageJson?.version || '1.0.0',
      description: packageJson?.description || '',
      framework,
      structure,
      dependencies,
      buildTool,
      packageManager: this.detectPackageManager(files),
      entryPoints: this.findEntryPoints(files, framework),
      stats: this.calculateStats(files)
    };

    return this.metadata;
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
   * Analyze project structure
   * @param {Object} files - Organized files
   * @returns {Object} Structure info
   */
  analyzeStructure(files) {
    const allFiles = [
      ...files.html,
      ...files.css,
      ...files.js,
      ...files.jsx,
      ...files.ts,
      ...files.tsx,
      ...files.vue
    ];

    const paths = allFiles.map(f => f.webkitRelativePath || f.name);
    
    return {
      srcDir: this.findCommonDir(paths, ['src', 'source', 'app']),
      publicDir: this.findCommonDir(paths, ['public', 'static', 'assets']),
      componentsDir: this.findCommonDir(paths, ['components', 'comp', 'widgets']),
      pagesDir: this.findCommonDir(paths, ['pages', 'views', 'screens']),
      stylesDir: this.findCommonDir(paths, ['styles', 'css', 'scss']),
      assetsDir: this.findCommonDir(paths, ['assets', 'images', 'img', 'media']),
      totalFiles: allFiles.length,
      directories: this.extractDirectories(paths)
    };
  }

  /**
   * Find common directory
   * @param {string[]} paths - File paths
   * @param {string[]} candidates - Candidate directory names
   * @returns {string|null} Directory path
   */
  findCommonDir(paths, candidates) {
    for (const candidate of candidates) {
      const found = paths.find(p => p.toLowerCase().includes(`/${candidate}/`));
      if (found) {
        const parts = found.split('/');
        const index = parts.findIndex(p => p.toLowerCase() === candidate);
        return parts.slice(0, index + 1).join('/');
      }
    }
    return null;
  }

  /**
   * Extract unique directories
   * @param {string[]} paths - File paths
   * @returns {string[]} Directories
   */
  extractDirectories(paths) {
    const dirs = new Set();
    paths.forEach(path => {
      const parts = path.split('/');
      for (let i = 1; i < parts.length; i++) {
        dirs.add(parts.slice(0, i).join('/'));
      }
    });
    return Array.from(dirs).sort();
  }

  /**
   * Analyze dependencies
   * @param {Object} packageJson - Package.json data
   * @returns {Object} Dependencies info
   */
  analyzeDependencies(packageJson) {
    if (!packageJson) {
      return {
        production: {},
        development: {},
        total: 0
      };
    }

    const production = packageJson.dependencies || {};
    const development = packageJson.devDependencies || {};

    return {
      production,
      development,
      total: Object.keys(production).length + Object.keys(development).length,
      frameworks: this.extractFrameworks(production, development),
      uiLibraries: this.extractUILibraries(production, development),
      buildTools: this.extractBuildTools(production, development)
    };
  }

  /**
   * Extract framework dependencies
   * @param {Object} prod - Production dependencies
   * @param {Object} dev - Development dependencies
   * @returns {string[]} Frameworks
   */
  extractFrameworks(prod, dev) {
    const frameworks = [];
    const all = { ...prod, ...dev };

    if (all.react) frameworks.push('React');
    if (all.vue) frameworks.push('Vue');
    if (all['@angular/core']) frameworks.push('Angular');
    if (all.svelte) frameworks.push('Svelte');
    if (all.next) frameworks.push('Next.js');
    if (all.nuxt) frameworks.push('Nuxt');
    if (all.gatsby) frameworks.push('Gatsby');

    return frameworks;
  }

  /**
   * Extract UI library dependencies
   * @param {Object} prod - Production dependencies
   * @param {Object} dev - Development dependencies
   * @returns {string[]} UI libraries
   */
  extractUILibraries(prod, dev) {
    const libraries = [];
    const all = { ...prod, ...dev };

    if (all['@mui/material']) libraries.push('Material-UI');
    if (all['antd']) libraries.push('Ant Design');
    if (all['bootstrap']) libraries.push('Bootstrap');
    if (all['tailwindcss']) libraries.push('Tailwind CSS');
    if (all['styled-components']) libraries.push('Styled Components');
    if (all['@emotion/react']) libraries.push('Emotion');

    return libraries;
  }

  /**
   * Extract build tool dependencies
   * @param {Object} prod - Production dependencies
   * @param {Object} dev - Development dependencies
   * @returns {string[]} Build tools
   */
  extractBuildTools(prod, dev) {
    const tools = [];
    const all = { ...prod, ...dev };

    if (all.webpack) tools.push('Webpack');
    if (all.vite) tools.push('Vite');
    if (all.parcel) tools.push('Parcel');
    if (all.rollup) tools.push('Rollup');
    if (all.esbuild) tools.push('esbuild');

    return tools;
  }

  /**
   * Detect build tool
   * @param {Object} packageJson - Package.json data
   * @param {Object} files - Organized files
   * @returns {string} Build tool name
   */
  detectBuildTool(packageJson, files) {
    if (!packageJson) return 'none';

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps.vite) return 'vite';
    if (deps.webpack) return 'webpack';
    if (deps.parcel) return 'parcel';
    if (deps.rollup) return 'rollup';
    if (deps.esbuild) return 'esbuild';

    // Check for config files
    const configFiles = files.js.map(f => f.name);
    if (configFiles.includes('vite.config.js')) return 'vite';
    if (configFiles.includes('webpack.config.js')) return 'webpack';
    if (configFiles.includes('rollup.config.js')) return 'rollup';

    return 'none';
  }

  /**
   * Detect package manager
   * @param {Object} files - Organized files
   * @returns {string} Package manager name
   */
  detectPackageManager(files) {
    const allFiles = [...files.other, ...files.json];
    const fileNames = allFiles.map(f => f.name);

    if (fileNames.includes('pnpm-lock.yaml')) return 'pnpm';
    if (fileNames.includes('yarn.lock')) return 'yarn';
    if (fileNames.includes('package-lock.json')) return 'npm';

    return 'npm';
  }

  /**
   * Find entry points
   * @param {Object} files - Organized files
   * @param {Object} framework - Framework info
   * @returns {Object} Entry points
   */
  findEntryPoints(files, framework) {
    const entryPoints = {
      html: [],
      js: [],
      css: []
    };

    // Find main HTML files
    const htmlFiles = files.html.map(f => f.name.toLowerCase());
    const mainHtml = ['index.html', 'main.html', 'app.html'];
    entryPoints.html = files.html.filter(f => 
      mainHtml.includes(f.name.toLowerCase())
    );

    // Find main JS files
    const jsFiles = [...files.js, ...files.jsx, ...files.ts, ...files.tsx];
    const mainJs = ['index.js', 'main.js', 'app.js', 'index.jsx', 'main.jsx', 'app.jsx'];
    entryPoints.js = jsFiles.filter(f => 
      mainJs.includes(f.name.toLowerCase())
    );

    // Find main CSS files
    const mainCss = ['index.css', 'main.css', 'app.css', 'style.css', 'styles.css'];
    entryPoints.css = files.css.filter(f => 
      mainCss.includes(f.name.toLowerCase())
    );

    return entryPoints;
  }

  /**
   * Calculate project statistics
   * @param {Object} files - Organized files
   * @returns {Object} Statistics
   */
  calculateStats(files) {
    return {
      totalFiles: Object.values(files).flat().length,
      htmlFiles: files.html.length,
      cssFiles: files.css.length + files.scss.length,
      jsFiles: files.js.length + files.jsx.length + files.ts.length + files.tsx.length,
      vueFiles: files.vue.length,
      assetFiles: files.assets.length,
      hasTypeScript: files.ts.length > 0 || files.tsx.length > 0,
      hasJSX: files.jsx.length > 0 || files.tsx.length > 0,
      hasSCSS: files.scss.length > 0
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

  /**
   * Get metadata
   * @returns {Object|null} Metadata
   */
  getMetadata() {
    return this.metadata;
  }
}
