/**
 * Checkout & Dynamic Pricing Module (v1.0)
 * 
 * Manages cart state, express guest checkout, dynamic pricing rules based on cardFundingSource,
 * and UI total calculations.
 */

// Initial Sample Cart Items
const INITIAL_CART_ITEMS = [
  { id: 'item-1', name: 'Software License (Annual)', price: 49.99, quantity: 1 },
  { id: 'item-2', name: 'Premium Tech Support', price: 19.99, quantity: 1 },
  { id: 'item-3', name: 'Cloud Storage (100 GB)', price: 9.99, quantity: 1 }
];

// Dynamic Pricing Rules per Funding Source
const PRICING_RULES = {
  CREDIT: {
    label: 'Credit Card Surcharge (+2.5%)',
    multiplier: 1.025,
    rateText: '+2.5% processing surcharge',
    type: 'surcharge'
  },
  DEBIT: {
    label: 'Debit Card Discount (-1.5%)',
    multiplier: 0.985,
    rateText: '-1.5% instant savings',
    type: 'discount'
  },
  PREPAID: {
    label: 'Prepaid Card Discount (-1.0%)',
    multiplier: 0.99,
    rateText: '-1.0% instant savings',
    type: 'discount'
  }
};

class CheckoutManager {
  constructor() {
    this.cart = [...INITIAL_CART_ITEMS];
    this.selectedFundingSource = 'CREDIT'; // Default funding source
    this.lastProcessedPayment = null;
    this.init();
  }

  init() {
    console.log('[Checkout] Initialized checkout manager.');
  }

  /**
   * Returns current cart items list.
   * @returns {Array} Cart items array
   */
  getCartItems() {
    return this.cart;
  }

  /**
   * Calculates subtotal price of all items in cart.
   * @returns {number} Subtotal price
   */
  calculateSubtotal() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /**
   * Applies dynamic pricing rule based on funding source.
   * @param {string} fundingSource - CREDIT, DEBIT, or PREPAID
   * @returns {object} Pricing breakdown object
   */
  calculateDynamicPricing(fundingSource = this.selectedFundingSource) {
    const subtotal = this.calculateSubtotal();
    const rule = PRICING_RULES[fundingSource] || PRICING_RULES.CREDIT;
    const finalTotal = subtotal * rule.multiplier;
    const difference = finalTotal - subtotal; // Positive = surcharge, Negative = discount

    return {
      subtotal: subtotal,
      fundingSource: fundingSource,
      ruleLabel: rule.label,
      rateText: rule.rateText,
      pricingType: rule.type,
      adjustmentAmount: difference,
      finalTotal: Math.max(0, finalTotal)
    };
  }

  /**
   * Updates selected card funding source.
   * @param {string} fundingSource - CREDIT, DEBIT, PREPAID
   */
  setFundingSource(fundingSource) {
    if (PRICING_RULES[fundingSource]) {
      this.selectedFundingSource = fundingSource;
      this.renderCartUI();
    }
  }

  /**
   * Returns complete transaction summary for PaymentDataRequest construction.
   * @returns {object} Cart summary object
   */
  getCartSummary() {
    const pricing = this.calculateDynamicPricing();
    return {
      subtotal: pricing.subtotal,
      totalPrice: pricing.finalTotal,
      currencyCode: 'USD',
      lineItems: this.cart,
      fundingSource: pricing.fundingSource,
      adjustmentAmount: pricing.adjustmentAmount
    };
  }

  /**
   * Updates quantity of an item in cart.
   * @param {string} itemId - ID of target item
   * @param {number} delta - Change in quantity (+1 or -1)
   */
  updateItemQuantity(itemId, delta) {
    const item = this.cart.find(i => i.id === itemId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.cart = this.cart.filter(i => i.id !== itemId);
      }
      this.renderCartUI();
    }
  }

  /**
   * Renders Cart and Dynamic Pricing UI elements.
   */
  renderCartUI() {
    const cartListEl = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const pricingBreakdownEl = document.getElementById('pricing-breakdown-container');
    const totalEl = document.getElementById('cart-final-total');

    if (!cartListEl) return;

    // Render line items
    if (this.cart.length === 0) {
      cartListEl.innerHTML = '<div class="text-center text-muted">Your cart is empty.</div>';
    } else {
      cartListEl.innerHTML = this.cart.map(item => `
        <div class="cart-item">
          <div class="item-info">
            <span class="item-name">${item.name}</span>
            <span class="item-qty">Qty: ${item.quantity} × $${item.price.toFixed(2)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; width: auto;" onclick="window.checkoutMgr.updateItemQuantity('${item.id}', -1)">-</button>
            <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; width: auto;" onclick="window.checkoutMgr.updateItemQuantity('${item.id}', 1)">+</button>
          </div>
        </div>
      `).join('');
    }

    // Dynamic pricing calculations
    const pricing = this.calculateDynamicPricing();

    if (subtotalEl) subtotalEl.textContent = `$${pricing.subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${pricing.finalTotal.toFixed(2)}`;

    // Render pricing breakdown box
    if (pricingBreakdownEl) {
      const isDiscount = pricing.pricingType === 'discount';
      const cssClass = isDiscount ? 'highlight' : 'surcharge';
      const sign = isDiscount ? '' : '+';

      pricingBreakdownEl.innerHTML = `
        <div class="breakdown-row">
          <span>Card Funding Source:</span>
          <strong>${pricing.fundingSource}</strong>
        </div>
        <div class="breakdown-row ${cssClass}">
          <span>${pricing.ruleLabel}:</span>
          <span>${sign}$${pricing.adjustmentAmount.toFixed(2)}</span>
        </div>
        <div class="breakdown-row" style="margin-top: 0.4rem; font-weight: bold; color: var(--text-main);">
          <span>Applied Total:</span>
          <span>$${pricing.finalTotal.toFixed(2)}</span>
        </div>
      `;
    }
  }

  /**
   * Called when Google Pay payment authorization succeeds.
   * @param {object} paymentResult - Payload containing token and cardFundingSource
   */
  handlePaymentSuccess(paymentResult) {
    this.lastProcessedPayment = paymentResult;

    // Automatically update funding source if returned from cardInfo
    if (paymentResult.fundingSource && PRICING_RULES[paymentResult.fundingSource]) {
      this.selectedFundingSource = paymentResult.fundingSource;
      this.renderCartUI();
    }

    const modalLogEl = document.getElementById('payment-result-log');
    if (modalLogEl) {
      const summary = this.calculateDynamicPricing(paymentResult.fundingSource);
      modalLogEl.innerHTML = `
        <div class="agreement-card" style="border-color: var(--success-color);">
          <div class="agreement-header">
            <span class="agreement-title" style="color: var(--success-color);">✓ Payment Authorized Successfully!</span>
            <span class="status-tag active">AUTHORIZED</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Payment token generated & logged:</p>
          <div class="idempotency-box">${paymentResult.token}</div>
          <div style="font-size: 0.85rem; margin-top: 0.5rem;">
            <div><strong>Funding Source Detected:</strong> ${paymentResult.fundingSource}</div>
            <div><strong>Applied Price Surcharge/Discount:</strong> ${summary.rateText}</div>
            <div><strong>Final Charged Amount:</strong> $${summary.finalTotal.toFixed(2)} USD</div>
          </div>
        </div>
      `;
    }

    console.log('[Checkout] Payment process completed successfully:', paymentResult);
  }
}

// Global instance initialization
window.checkoutMgr = new CheckoutManager();
window.getCartSummary = () => window.checkoutMgr.getCartSummary();
window.getSelectedFundingSource = () => window.checkoutMgr.selectedFundingSource;
window.handlePaymentSuccess = (res) => window.checkoutMgr.handlePaymentSuccess(res);
