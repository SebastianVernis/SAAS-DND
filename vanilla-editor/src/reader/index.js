/**
 * Frontend Reader System - Main Entry Point
 * Automatically reads, analyzes, and loads existing frontend projects
 * 
 * @module FrontendReader
 * @version 1.0.0
 */

import { FrameworkDetector } from './core/FrameworkDetector.js';
import { ProjectAnalyzer } from './core/ProjectAnalyzer.js';
import { HTMLParser } from './parsers/HTMLParser.js';
import { ComponentTreeBuilder } from './core/ComponentTreeBuilder.js';
import { StyleExtractor } from './extractors/StyleExtractor.js';
import { AssetManager } from './core/AssetManager.js';
import { SyncEngine } from './core/SyncEngine.js';

/**
 * Main Frontend Reader class
 * Orchestrates the entire project reading and loading process
 */
export class FrontendReader {
  constructor(options = {}) {
    this.options = {
      autoSync: true,
      watchFiles: true,
      preserveFormatting: true,
      ...options
    };

    this.frameworkDetector = new FrameworkDetector();
    this.projectAnalyzer = new ProjectAnalyzer();
    this.htmlParser = new HTMLParser();
    this.componentTreeBuilder = new ComponentTreeBuilder();
    this.styleExtractor = new StyleExtractor();
    this.assetManager = new AssetManager();
    this.syncEngine = null;

    this.currentProject = null;
    this.isLoading = false;
  }

  /**
   * Load and analyze a project from files
   * @param {FileList|File[]} files - Files from directory input
   * @returns {Promise<Object>} Analyzed project data
   */
  async loadProject(files) {
    if (this.isLoading) {
      throw new Error('Already loading a project');
    }

    this.isLoading = true;

    try {
      console.log('🔍 Starting project analysis...');

      // Step 1: Organize files by type
      const organizedFiles = this.organizeFiles(files);
      console.log('📁 Files organized:', {
        html: organizedFiles.html.length,
        css: organizedFiles.css.length,
        js: organizedFiles.js.length,
        assets: organizedFiles.assets.length
      });

      // Step 2: Detect framework and project type
      const framework = await this.frameworkDetector.detect(organizedFiles);
      console.log('🎯 Framework detected:', framework);

      // Step 3: Analyze project structure
      const projectMetadata = await this.projectAnalyzer.analyze(organizedFiles, framework);
      console.log('📊 Project analyzed:', projectMetadata);

      // Step 4: Parse files based on framework
      const parsedComponents = await this.parseFiles(organizedFiles, framework);
      console.log('🔨 Components parsed:', parsedComponents.length);

      // Step 5: Build component tree
      const componentTree = await this.componentTreeBuilder.build(parsedComponents, framework);
      console.log('🌳 Component tree built');

      // Step 6: Extract styles
      const styles = await this.styleExtractor.extract(organizedFiles, parsedComponents);
      console.log('🎨 Styles extracted');

      // Step 7: Load assets
      const assets = await this.assetManager.load(organizedFiles.assets);
      console.log('🖼️ Assets loaded:', assets.length);

      // Step 8: Create project object
      this.currentProject = {
        metadata: projectMetadata,
        framework,
        components: parsedComponents,
        componentTree,
        styles,
        assets,
        files: organizedFiles
      };

      // Step 9: Initialize sync engine if enabled
      if (this.options.watchFiles) {
        this.syncEngine = new SyncEngine(this.currentProject, this.options);
        await this.syncEngine.start();
      }

      console.log('✅ Project loaded successfully!');
      return this.currentProject;

    } catch (error) {
      console.error('❌ Error loading project:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load a single HTML file
   * @param {File} file - HTML file
   * @returns {Promise<Object>} Parsed HTML data
   */
  async loadHTMLFile(file) {
    try {
      console.log('📄 Loading HTML file:', file.name);

      const content = await this.readFileContent(file);
      const parsed = await this.htmlParser.parse(content, file.name);

      // Extract inline styles and scripts
      const styles = this.styleExtractor.extractInline(parsed);
      const assets = this.assetManager.extractFromHTML(parsed);

      const project = {
        metadata: {
          name: file.name.replace('.html', ''),
          type: 'html',
          framework: { name: 'html', version: '5' }
        },
        framework: { name: 'html', version: '5' },
        components: [parsed],
        componentTree: { roots: [parsed], components: [parsed] },
        styles,
        assets,
        files: { html: [file], css: [], js: [], assets: [] }
      };

      this.currentProject = project;
      console.log('✅ HTML file loaded successfully!');
      return project;

    } catch (error) {
      console.error('❌ Error loading HTML file:', error);
      throw error;
    }
  }

  /**
   * Organize files by type
   * @param {FileList|File[]} files - Input files
   * @returns {Object} Organized files
   */
  organizeFiles(files) {
    const organized = {
      html: [],
      css: [],
      scss: [],
      js: [],
      jsx: [],
      ts: [],
      tsx: [],
      vue: [],
      json: [],
      assets: [],
      other: []
    };

    Array.from(files).forEach(file => {
      const ext = this.getFileExtension(file.name);
      const path = file.webkitRelativePath || file.name;

      // Skip node_modules, .git, dist, build directories
      if (this.shouldSkipFile(path)) {
        return;
      }

      switch (ext) {
        case 'html':
        case 'htm':
          organized.html.push(file);
          break;
        case 'css':
          organized.css.push(file);
          break;
        case 'scss':
        case 'sass':
          organized.scss.push(file);
          break;
        case 'js':
        case 'mjs':
          organized.js.push(file);
          break;
        case 'jsx':
          organized.jsx.push(file);
          break;
        case 'ts':
          organized.ts.push(file);
          break;
        case 'tsx':
          organized.tsx.push(file);
          break;
        case 'vue':
          organized.vue.push(file);
          break;
        case 'json':
          organized.json.push(file);
          break;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
        case 'webp':
        case 'ico':
        case 'woff':
        case 'woff2':
        case 'ttf':
        case 'eot':
        case 'mp4':
        case 'webm':
        case 'ogg':
          organized.assets.push(file);
          break;
        default:
          organized.other.push(file);
      }
    });

    return organized;
  }

  /**
   * Parse files based on framework
   * @param {Object} files - Organized files
   * @param {Object} framework - Detected framework
   * @returns {Promise<Array>} Parsed components
   */
  async parseFiles(files, framework) {
    const components = [];

    // Parse HTML files
    for (const file of files.html) {
      const content = await this.readFileContent(file);
      const parsed = await this.htmlParser.parse(content, file.name);
      components.push(parsed);
    }

    // For now, we focus on HTML parsing
    // JSX, Vue, Angular parsers will be added in future phases
    if (framework.name === 'react' && files.jsx.length > 0) {
      console.log('⚠️ React JSX parsing not yet implemented');
    }

    if (framework.name === 'vue' && files.vue.length > 0) {
      console.log('⚠️ Vue SFC parsing not yet implemented');
    }

    return components;
  }

  /**
   * Read file content as text
   * @param {File} file - File to read
   * @returns {Promise<string>} File content
   */
  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  /**
   * Get file extension
   * @param {string} filename - File name
   * @returns {string} Extension
   */
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  /**
   * Check if file should be skipped
   * @param {string} path - File path
   * @returns {boolean} Should skip
   */
  shouldSkipFile(path) {
    const skipPatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      '.nuxt',
      'coverage',
      '.cache',
      'vendor'
    ];

    return skipPatterns.some(pattern => path.includes(pattern));
  }

  /**
   * Get current project
   * @returns {Object|null} Current project
   */
  getCurrentProject() {
    return this.currentProject;
  }

  /**
   * Stop sync engine
   */
  async stopSync() {
    if (this.syncEngine) {
      await this.syncEngine.stop();
      this.syncEngine = null;
    }
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    await this.stopSync();
    this.currentProject = null;
  }
}

// Export singleton instance
export const frontendReader = new FrontendReader();
