/**
 * Merchant-Initiated Transactions (MIT) Module (v1.0)
 * 
 * Manages recurring billing agreements, idempotency key generation,
 * recurring charge execution, agreement cancellation, and in-memory charge history tracking.
 */

class MITManager {
  constructor() {
    // In-memory data structures (no external persistence layer required for v1.0)
    this.agreements = [];
    this.processedIdempotencyKeys = new Set();
    this.initSampleAgreements();
  }

  initSampleAgreements() {
    // Add default initial sample agreement for quick review
    this.createBillingAgreement('SaaS Enterprise Subscription', 99.99, 'MONTHLY', 'customer@example.com');
  }

  /**
   * Generates a cryptographically random/unique idempotency key.
   * Format: mit_ik_<timestamp>_<randomStr>
   * @returns {string} Idempotency key
   */
  generateIdempotencyKey() {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 9);
    return `mit_ik_${timestamp}_${randomPart}`;
  }

  /**
   * Creates a new billing agreement for recurring charges.
   * @param {string} planName - Subscription or billing agreement title
   * @param {number} amount - Recurring charge amount
   * @param {string} frequency - Billing frequency (WEEKLY, MONTHLY, ANNUAL)
   * @param {string} customerEmail - Customer contact email
   * @returns {object} Created agreement object
   */
  createBillingAgreement(planName, amount, frequency = 'MONTHLY', customerEmail = 'guest@example.com') {
    const agreementId = `agr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const agreement = {
      agreementId: agreementId,
      planName: planName,
      amount: parseFloat(amount),
      frequency: frequency,
      customerEmail: customerEmail,
      status: 'ACTIVE', // ACTIVE, CANCELLED
      createdAt: new Date().toISOString(),
      lastIdempotencyKey: null,
      chargeHistory: []
    };

    this.agreements.unshift(agreement);
    this.renderAgreementsUI();
    console.log('[MIT] Created new billing agreement:', agreement);
    return agreement;
  }

  /**
   * Cancels an existing billing agreement.
   * @param {string} agreementId - Target agreement ID
   * @returns {boolean} True if cancelled successfully
   */
  cancelBillingAgreement(agreementId) {
    const agreement = this.agreements.find(a => a.agreementId === agreementId);
    if (!agreement) {
      console.warn(`[MIT] Agreement ${agreementId} not found.`);
      return false;
    }

    if (agreement.status === 'CANCELLED') {
      alert('This billing agreement is already cancelled.');
      return false;
    }

    agreement.status = 'CANCELLED';
    agreement.cancelledAt = new Date().toISOString();
    this.renderAgreementsUI();
    console.log(`[MIT] Billing agreement ${agreementId} has been cancelled.`);
    return true;
  }

  /**
   * Executes a Merchant-Initiated Transaction charge against an active billing agreement using an idempotency key.
   * @param {string} agreementId - Target agreement ID
   * @param {string} idempotencyKey - Unique key to guarantee single-execution semantics
   * @returns {object} Result object containing status, transactionToken, and metadata
   */
  executeRecurringCharge(agreementId, idempotencyKey) {
    const agreement = this.agreements.find(a => a.agreementId === agreementId);

    if (!agreement) {
      return { success: false, error: 'AGREEMENT_NOT_FOUND', message: 'Billing agreement not found.' };
    }

    if (agreement.status !== 'ACTIVE') {
      return { success: false, error: 'AGREEMENT_INACTIVE', message: 'Cannot charge a cancelled billing agreement.' };
    }

    // Check for idempotency key deduplication
    if (this.processedIdempotencyKeys.has(idempotencyKey)) {
      console.warn(`[MIT] Idempotency key '${idempotencyKey}' already processed. Preventing duplicate charge.`);
      const existingCharge = agreement.chargeHistory.find(c => c.idempotencyKey === idempotencyKey);
      return {
        success: true,
        isDuplicate: true,
        message: 'Duplicate charge prevented via Idempotency Key.',
        chargeRecord: existingCharge
      };
    }

    // Process new recurring charge
    const chargeRecord = {
      chargeId: `chg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      idempotencyKey: idempotencyKey,
      amount: agreement.amount,
      currency: 'USD',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      transactionToken: `mit_token_${Math.random().toString(36).substring(2, 10)}`
    };

    // Mark idempotency key as processed
    this.processedIdempotencyKeys.add(idempotencyKey);
    agreement.chargeHistory.unshift(chargeRecord);

    this.renderAgreementsUI();
    console.log(`[MIT] Successfully executed recurring charge for ${agreementId}:`, chargeRecord);

    return {
      success: true,
      isDuplicate: false,
      message: 'Merchant-Initiated Transaction executed successfully.',
      chargeRecord: chargeRecord
    };
  }

  /**
   * Returns charge history for a specific agreement.
   * @param {string} agreementId - Agreement ID
   * @returns {Array} Charge history list
   */
  getAgreementHistory(agreementId) {
    const agreement = this.agreements.find(a => a.agreementId === agreementId);
    return agreement ? agreement.chargeHistory : [];
  }

  /**
   * Renders the MIT management interface in the DOM.
   */
  renderAgreementsUI() {
    const container = document.getElementById('agreements-list-container');
    if (!container) return;

    if (this.agreements.length === 0) {
      container.innerHTML = '<div class="text-center text-muted">No active billing agreements found.</div>';
      return;
    }

    container.innerHTML = this.agreements.map(agreement => {
      const isCancelled = agreement.status === 'CANCELLED';
      const statusClass = isCancelled ? 'cancelled' : 'active';
      const hasLastKey = Boolean(agreement.lastIdempotencyKey);
      const historyItems = agreement.chargeHistory.map(chg => `
        <div class="charge-history-item">
          <span>${new Date(chg.timestamp).toLocaleTimeString()} — $${chg.amount.toFixed(2)}</span>
          <span style="font-family: monospace; font-size: 0.75rem;">Key: ${chg.idempotencyKey.substring(0, 16)}...</span>
        </div>
      `).join('');

      return `
        <div class="agreement-card">
          <div class="agreement-header">
            <div>
              <span class="agreement-title">${agreement.planName}</span>
              <span class="status-tag ${statusClass}" style="margin-left: 0.5rem;">${agreement.status}</span>
            </div>
            <div style="font-weight: bold; font-size: 1.1rem; color: var(--accent-primary);">
              $${agreement.amount.toFixed(2)} / ${agreement.frequency}
            </div>
          </div>
          
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.5rem;">
            ID: <span style="font-family: monospace;">${agreement.agreementId}</span> | Customer: ${agreement.customerEmail}
          </div>

          <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
            <button class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; width: auto;" 
              ${isCancelled ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}
              onclick="window.mitMgr.triggerChargeClick('${agreement.agreementId}')">
              ⚡ Execute Recurring Charge
            </button>
            ${hasLastKey ? `
              <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; width: auto; border-color: var(--warning-color); color: var(--warning-color);" 
                ${isCancelled ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}
                onclick="window.mitMgr.triggerRetryChargeClick('${agreement.agreementId}')">
                🔄 Retry Last Charge (same key)
              </button>
            ` : ''}
            <button class="btn btn-danger" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; width: auto;" 
              ${isCancelled ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}
              onclick="window.mitMgr.cancelBillingAgreement('${agreement.agreementId}')">
              Cancel Agreement
            </button>
          </div>

          ${historyItems ? `
            <div class="charge-history-list">
              <strong style="font-size: 0.8rem; color: var(--text-main);">Charge History (${agreement.chargeHistory.length}):</strong>
              ${historyItems}
            </div>
          ` : '<div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 0.5rem;">No charges executed yet.</div>'}
        </div>
      `;
    }).join('');
  }

  /**
   * UI Click handler for triggering recurring charges with generated idempotency keys.
   * @param {string} agreementId - Agreement ID
   */
  triggerChargeClick(agreementId) {
    const agreement = this.agreements.find(a => a.agreementId === agreementId);
    const idempotencyKey = this.generateIdempotencyKey();
    if (agreement) {
      agreement.lastIdempotencyKey = idempotencyKey;
    }
    const result = this.executeRecurringCharge(agreementId, idempotencyKey);
    this.renderLogResult(agreementId, result);
  }

  /**
   * UI Click handler for retrying a charge using the stored last idempotency key.
   * @param {string} agreementId - Agreement ID
   */
  triggerRetryChargeClick(agreementId) {
    const agreement = this.agreements.find(a => a.agreementId === agreementId);
    if (!agreement || !agreement.lastIdempotencyKey) return;
    const result = this.executeRecurringCharge(agreementId, agreement.lastIdempotencyKey);
    this.renderLogResult(agreementId, result);
  }

  /**
   * Renders the execution log UI with distinct visual states for success and duplicate blocked states.
   * @param {string} agreementId - Agreement ID
   * @param {object} result - Result payload from executeRecurringCharge
   */
  renderLogResult(agreementId, result) {
    const logEl = document.getElementById('mit-execution-log');
    if (!logEl) return;

    if (result.success) {
      if (result.isDuplicate) {
        logEl.innerHTML = `
          <div class="idempotency-box" style="border-left: 4px solid var(--warning-color); background: rgba(245, 158, 11, 0.15); color: var(--warning-color);">
            <div style="font-size: 0.85rem; font-weight: bold; margin-bottom: 0.25rem;">⚠️ Duplicate Charge Blocked via Idempotency Key</div>
            <div><strong>Status:</strong> ${result.message}</div>
            <div><strong>Agreement:</strong> ${agreementId}</div>
            <div><strong>Reused Idempotency Key:</strong> ${result.chargeRecord ? result.chargeRecord.idempotencyKey : 'N/A'}</div>
          </div>
        `;
      } else {
        logEl.innerHTML = `
          <div class="idempotency-box" style="border-left: 4px solid var(--success-color);">
            <div><strong>Status:</strong> Charge Executed Successfully (${result.chargeRecord.status})</div>
            <div><strong>Agreement:</strong> ${agreementId}</div>
            <div><strong>Idempotency Key:</strong> ${result.chargeRecord.idempotencyKey}</div>
            <div><strong>Transaction Token:</strong> ${result.chargeRecord.transactionToken}</div>
          </div>
        `;
      }
    } else {
      logEl.innerHTML = `
        <div class="idempotency-box" style="border-left: 4px solid var(--danger-color); color: var(--danger-color);">
          <div><strong>Error:</strong> ${result.message}</div>
        </div>
      `;
    }
  }
}

// Global instance initialization
window.mitMgr = new MITManager();
