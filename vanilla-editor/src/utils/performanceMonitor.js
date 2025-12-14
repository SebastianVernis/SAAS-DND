/**
 * Performance Monitor
 * Tracks and reports performance metrics for Monaco Editor operations
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTimes = new Map();
  }

  /**
   * Start timing an operation
   */
  start(operationName) {
    this.startTimes.set(operationName, performance.now());
  }

  /**
   * End timing an operation
   */
  end(operationName) {
    const startTime = this.startTimes.get(operationName);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operationName}`);
      return;
    }

    const duration = performance.now() - startTime;
    
    if (!this.metrics.has(operationName)) {
      this.metrics.set(operationName, {
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: -Infinity,
        avgDuration: 0
      });
    }

    const metric = this.metrics.get(operationName);
    metric.count++;
    metric.totalDuration += duration;
    metric.minDuration = Math.min(metric.minDuration, duration);
    metric.maxDuration = Math.max(metric.maxDuration, duration);
    metric.avgDuration = metric.totalDuration / metric.count;

    this.startTimes.delete(operationName);

    // Log if operation is slow
    if (duration > 500) {
      console.warn(`⚠️ Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Get metrics for a specific operation
   */
  getMetric(operationName) {
    return this.metrics.get(operationName);
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    const result = {};
    this.metrics.forEach((value, key) => {
      result[key] = { ...value };
    });
    return result;
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics.clear();
    this.startTimes.clear();
  }

  /**
   * Log performance report
   */
  logReport() {
    console.group('📊 Performance Report');
    this.metrics.forEach((metric, operationName) => {
      console.log(`\n${operationName}:`);
      console.log(`  Count: ${metric.count}`);
      console.log(`  Avg: ${metric.avgDuration.toFixed(2)}ms`);
      console.log(`  Min: ${metric.minDuration.toFixed(2)}ms`);
      console.log(`  Max: ${metric.maxDuration.toFixed(2)}ms`);
      console.log(`  Total: ${metric.totalDuration.toFixed(2)}ms`);
    });
    console.groupEnd();
  }

  /**
   * Check if performance meets criteria
   */
  meetsPerformanceCriteria() {
    const criteria = {
      'editor-init': 2000,      // <2s
      'sync-code-to-visual': 100, // <100ms
      'sync-visual-to-code': 100, // <100ms
      'error-detection': 500      // <500ms
    };

    const results = {};
    let allPass = true;

    Object.entries(criteria).forEach(([operation, threshold]) => {
      const metric = this.metrics.get(operation);
      if (metric) {
        const passes = metric.avgDuration < threshold;
        results[operation] = {
          avgDuration: metric.avgDuration,
          threshold,
          passes
        };
        if (!passes) allPass = false;
      }
    });

    return { allPass, results };
  }
}

export default PerformanceMonitor;
