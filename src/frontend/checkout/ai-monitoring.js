/**
 * AI Monitoring Pipeline Module (v1.0)
 * 
 * Periodically queries Google Pay integration health & performance/error metrics via MCP server.
 * Evaluates metrics against threshold rules, detects anomalies, and generates human-review alerts.
 * Note: Pure read-only monitoring; performs no automated remediation actions.
 */

const ANOMALY_THRESHOLDS = {
  maxErrorRate: 0.05, // 5% max allowed payment error rate
  maxP95LatencyMs: 3000, // 3000ms max allowed checkout latency
  minSuccessRate: 0.95 // 95% min required success rate
};

class AIMonitoringPipeline {
  constructor() {
    this.merchantId = '12345678901234567890';
    this.logs = [];
    this.metricsHistory = {
      totalRequests: 1250,
      successfulPayments: 1180,
      failedPayments: 70,
      p95LatencyMs: 1450,
      errorRate: 0.056, // 5.6% (triggers warning alert)
      integrationStatus: 'INTEGRATION_STATUS_ACTIVE'
    };
    this.pollingInterval = null;
    this.init();
  }

  init() {
    this.logAlert('INFO', 'AI Monitoring Pipeline initialized. Monitoring merchant ID: ' + this.merchantId);
    this.runHealthCheck();
  }

  /**
   * Starts periodic background polling of MCP server metrics.
   * @param {number} intervalMs - Polling frequency in milliseconds (default: 10 seconds)
   */
  startPolling(intervalMs = 10000) {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.pollingInterval = setInterval(() => {
      this.runHealthCheck();
    }, intervalMs);
    console.log(`[AI Monitoring] Polling started every ${intervalMs / 1000}s.`);
  }

  /**
   * Stops periodic background polling.
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('[AI Monitoring] Polling stopped.');
    }
  }

  /**
   * Queries Google Pay MCP tools / metrics API and analyzes performance.
   */
  async runHealthCheck() {
    this.logAlert('INFO', '[AI Monitoring] Using SIMULATED metrics — live MCP polling requires the v1.2 backend proxy (see ADR-010 / roadmap).');

    try {
      // Fetch status, performance, and error metrics
      const integrationStatus = await this.queryIntegrationStatus();
      const performanceMetrics = await this.queryPerformanceMetrics();
      const errorMetrics = await this.queryErrorMetrics();

      // Analyze metrics against thresholds
      this.analyzeMetrics(integrationStatus, performanceMetrics, errorMetrics);
      this.renderDashboardUI();
    } catch (err) {
      this.logAlert('WARNING', `MCP Query notice: ${err.message || 'Using cached telemetry stream.'}`);
    }
  }

  /**
   * Simulates/Queries list_google_pay_integrations tool.
   * @returns {Promise<object>} Integration status summary
   */
  async queryIntegrationStatus() {
    // Simulated / fallback structure representing response from list_google_pay_integrations
    return {
      merchantId: this.merchantId,
      status: this.metricsHistory.integrationStatus,
      environment: 'TEST',
      lastReviewed: new Date().toISOString()
    };
  }

  /**
   * Simulates/Queries query_merchant_performance tool.
   * @returns {Promise<object>} Performance metrics object
   */
  async queryPerformanceMetrics() {
    // Introduce slight natural variance for demonstration
    const jitterLatency = Math.floor(Math.random() * 400) - 200;
    return {
      p95LatencyMs: Math.max(800, this.metricsHistory.p95LatencyMs + jitterLatency),
      totalRequests: this.metricsHistory.totalRequests + Math.floor(Math.random() * 10),
      timeRange: 'TIME_RANGE_PAST_DAY'
    };
  }

  /**
   * Simulates/Queries query_merchant_error_metrics tool.
   * @returns {Promise<object>} Error breakdown object
   */
  async queryErrorMetrics() {
    const errorRate = this.metricsHistory.errorRate;
    return {
      errorRate: errorRate,
      failedTransactionsCount: this.metricsHistory.failedPayments,
      topErrorCodes: [
        { code: 'CARD_DECLINED_GENERIC', count: 42 },
        { code: 'EXPIRED_CARD', count: 18 },
        { code: 'TOKENIZATION_TIMEOUT', count: 10 }
      ]
    };
  }

  /**
   * Evaluates retrieved metrics against anomaly threshold rules and logs alerts for human operators.
   * @param {object} integration - Integration status
   * @param {object} performance - Performance metrics
   * @param {object} errors - Error metrics
   */
  analyzeMetrics(integration, performance, errors) {
    // Rule 1: Check Integration Status
    if (integration.status !== 'INTEGRATION_STATUS_ACTIVE') {
      this.logAlert('CRITICAL', `[Anomaly Detected] Integration status is '${integration.status}'. Requires human review in Google Pay Console.`);
    }

    // Rule 2: Check Error Rate Threshold (Max 5%)
    if (errors.errorRate > ANOMALY_THRESHOLDS.maxErrorRate) {
      const pct = (errors.errorRate * 100).toFixed(1);
      this.logAlert('WARNING', `[Anomaly Alert] Payment error rate is ${pct}% (threshold: ${(ANOMALY_THRESHOLDS.maxErrorRate * 100)}%). Action required: inspect top error 'CARD_DECLINED_GENERIC'.`);
    } else {
      this.logAlert('INFO', `Payment error rate is healthy at ${(errors.errorRate * 100).toFixed(1)}%.`);
    }

    // Rule 3: Check p95 Latency Threshold (Max 3000ms)
    if (performance.p95LatencyMs > ANOMALY_THRESHOLDS.maxP95LatencyMs) {
      this.logAlert('CRITICAL', `[Latency Alert] p95 Latency spike detected: ${performance.p95LatencyMs}ms (threshold: ${ANOMALY_THRESHOLDS.maxP95LatencyMs}ms).`);
    } else {
      this.logAlert('INFO', `Checkout latency (p95) is nominal: ${performance.p95LatencyMs}ms.`);
    }

    // Update current metrics snapshot for UI
    this.metricsHistory.p95LatencyMs = performance.p95LatencyMs;
    this.metricsHistory.totalRequests = performance.totalRequests;
  }

  /**
   * Append log entry to memory and UI console.
   * @param {string} level - INFO, WARNING, CRITICAL
   * @param {string} message - Human-readable alert detail
   */
  logAlert(level, message) {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      level: level,
      message: message
    };
    this.logs.unshift(entry);
    if (this.logs.length > 50) this.logs.pop(); // Keep last 50 logs
    this.renderConsoleUI();
  }

  /**
   * Renders the telemetry metrics grid and console logs in the DOM.
   */
  renderDashboardUI() {
    const p95El = document.getElementById('metric-p95-latency');
    const errRateEl = document.getElementById('metric-error-rate');
    const statusEl = document.getElementById('metric-integration-status');

    if (p95El) p95El.textContent = `${this.metricsHistory.p95LatencyMs} ms`;
    if (errRateEl) errRateEl.textContent = `${(this.metricsHistory.errorRate * 100).toFixed(1)}%`;
    if (statusEl) statusEl.textContent = this.metricsHistory.integrationStatus.replace('INTEGRATION_STATUS_', '');

    // Render SIMULATED DATA warning badge next to metrics grid
    const metricsGrid = document.querySelector('.metrics-grid');
    if (metricsGrid && !document.getElementById('simulated-data-badge')) {
      const badge = document.createElement('div');
      badge.id = 'simulated-data-badge';
      badge.className = 'environment-badge';
      badge.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
      badge.style.color = 'var(--warning-color)';
      badge.style.border = '1px solid rgba(245, 158, 11, 0.5)';
      badge.style.marginBottom = '1rem';
      badge.style.display = 'inline-block';
      badge.style.padding = '0.35rem 0.85rem';
      badge.style.fontSize = '0.8rem';
      badge.innerHTML = '⚠️ SIMULATED DATA — Live MCP polling requires v1.2 backend proxy';
      metricsGrid.parentNode.insertBefore(badge, metricsGrid);
    }
  }

  /**
   * Renders the scrollable console box.
   */
  renderConsoleUI() {
    const consoleContainer = document.getElementById('ai-console-logs');
    if (!consoleContainer) return;

    consoleContainer.innerHTML = this.logs.map(log => `
      <div class="log-entry">
        <span class="log-timestamp">[${log.timestamp}]</span>
        <span class="log-level ${log.level}">${log.level}</span>
        <span class="log-message">${log.message}</span>
      </div>
    `).join('');
  }
}

// Global instance initialization
window.aiMonitoring = new AIMonitoringPipeline();
