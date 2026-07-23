/**
 * Google Pay API Integration Module (v1.0)
 * Environment: TEST
 * 
 * Handles Google Pay Client initialization, isReadyToPay gating,
 * PaymentDataRequest construction, button rendering, and onPaymentAuthorized callback.
 */

// Global configuration constants
const GPAY_CONFIG = {
  apiVersion: 2,
  apiVersionMinor: 0,
  environment: 'TEST',
  merchantInfo: {
    merchantId: '12345678901234567890',
    merchantName: 'Google Pay AI Checkout (Demo)'
  },
  allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'],
  allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
  tokenizationSpecification: {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: 'example',
      gatewayMerchantId: 'exampleGatewayMerchantId'
    }
  }
};

let paymentsClient = null;

/**
 * Returns base card payment method configuration used across requests.
 * @returns {object} Base card payment method config
 */
function getBaseCardPaymentMethod() {
  return {
    type: 'CARD',
    parameters: {
      allowedAuthMethods: GPAY_CONFIG.allowedCardAuthMethods,
      allowedCardNetworks: GPAY_CONFIG.allowedCardNetworks
    }
  };
}

/**
 * Returns full card payment method configuration including tokenization spec.
 * @returns {object} Card payment method object with tokenization spec
 */
function getCardPaymentMethod() {
  return Object.assign({}, getBaseCardPaymentMethod(), {
    tokenizationSpecification: GPAY_CONFIG.tokenizationSpecification
  });
}

/**
 * Constructs the isReadyToPay request payload.
 * @returns {object} IsReadyToPayRequest schema
 */
function getIsReadyToPayRequest() {
  return {
    apiVersion: GPAY_CONFIG.apiVersion,
    apiVersionMinor: GPAY_CONFIG.apiVersionMinor,
    allowedPaymentMethods: [getBaseCardPaymentMethod()]
  };
}

/**
 * Initializes the Google Payments Client instance.
 * @returns {google.payments.api.PaymentsClient} PaymentsClient instance
 */
function getGooglePaymentsClient() {
  if (paymentsClient === null) {
    if (typeof google === 'undefined' || !google.payments || !google.payments.api) {
      console.warn('[Google Pay] Google Pay JS SDK (pay.js) not loaded yet.');
      return null;
    }
    paymentsClient = new google.payments.api.PaymentsClient({
      environment: GPAY_CONFIG.environment,
      paymentDataCallbacks: {
        onPaymentAuthorized: onPaymentAuthorized
      }
    });
  }
  return paymentsClient;
}

/**
 * Checks if the user is ready to pay with Google Pay.
 * @returns {Promise<boolean>} True if ready to pay, false otherwise
 */
async function checkIsReadyToPay() {
  const client = getGooglePaymentsClient();
  if (!client) return false;

  try {
    const isReadyToPayRequest = getIsReadyToPayRequest();
    const response = await client.isReadyToPay(isReadyToPayRequest);
    console.log('[Google Pay] isReadyToPay response:', response);
    return response.result === true;
  } catch (err) {
    console.error('[Google Pay] isReadyToPay error:', err);
    return false;
  }
}

/**
 * Renders the Google Pay button into a target container element once isReadyToPay resolves true.
 * @param {HTMLElement} containerElement - Target DOM element for the button
 * @param {function} onClickHandler - Callback function triggered when user clicks button
 */
async function renderGooglePayButton(containerElement, onClickHandler) {
  if (!containerElement) return;

  const isReady = await checkIsReadyToPay();
  containerElement.innerHTML = ''; // Clear loading placeholder

  if (isReady) {
    const client = getGooglePaymentsClient();
    const button = client.createButton({
      buttonColor: 'default',
      buttonType: 'buy',
      buttonSizeMode: 'fill',
      onClick: onClickHandler || onGooglePayButtonClicked
    });
    containerElement.appendChild(button);
    console.log('[Google Pay] Button rendered successfully.');
  } else {
    // Render standard fallback button for testing environment
    const fallbackBtn = document.createElement('button');
    fallbackBtn.className = 'btn btn-primary';
    fallbackBtn.innerHTML = '<i class="ti ti-credit-card" aria-hidden="true"></i> Pay with Google Pay (Simulated)';
    fallbackBtn.addEventListener('click', onClickHandler || onGooglePayButtonClicked);
    containerElement.appendChild(fallbackBtn);
    console.log('[Google Pay] Rendered fallback Google Pay button.');
  }
}

/**
 * Builds a PaymentDataRequest object dynamically based on current cart and pricing.
 * @param {object} transactionData - Summary object containing totalPrice, currencyCode, lineItems
 * @returns {object} PaymentDataRequest structure
 */
function buildPaymentDataRequest(transactionData) {
  const displayItems = (transactionData.lineItems || []).map(item => ({
    label: `${item.name} (x${item.quantity})`,
    price: (item.price * item.quantity).toFixed(2),
    type: 'LINE_ITEM'
  }));

  return {
    apiVersion: GPAY_CONFIG.apiVersion,
    apiVersionMinor: GPAY_CONFIG.apiVersionMinor,
    allowedPaymentMethods: [getCardPaymentMethod()],
    merchantInfo: GPAY_CONFIG.merchantInfo,
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPriceLabel: 'Total',
      totalPrice: transactionData.totalPrice.toFixed(2),
      currencyCode: transactionData.currencyCode || 'USD',
      countryCode: 'US',
      displayItems: displayItems
    },
    callbackIntents: ['PAYMENT_AUTHORIZATION']
  };
}

/**
 * Handles the Google Pay button click event.
 */
async function onGooglePayButtonClicked() {
  const client = getGooglePaymentsClient();
  
  // Get active cart transaction info from checkout state
  const cartSummary = window.getCartSummary ? window.getCartSummary() : {
    totalPrice: 79.97,
    currencyCode: 'USD',
    lineItems: [
      { name: 'Software License', price: 49.99, quantity: 1 },
      { name: 'Premium Support', price: 19.99, quantity: 1 },
      { name: 'Cloud Storage', price: 9.99, quantity: 1 }
    ]
  };

  const paymentDataRequest = buildPaymentDataRequest(cartSummary);

  if (client) {
    try {
      await client.loadPaymentData(paymentDataRequest);
    } catch (err) {
      if (err.statusCode !== 'CANCELED') {
        console.error('[Google Pay] loadPaymentData error:', err);
        alert(`Payment initialization failed: ${err.statusMessage || err.statusCode}`);
      }
    }
  } else {
    // Simulated payment data authorization for environments where pay.js client isn't interactive
    simulatePaymentResponse(cartSummary);
  }
}

/**
 * Callback function required by callbackIntents: ['PAYMENT_AUTHORIZATION'].
 * Triggered after user selects payment method in sheet.
 * @param {object} paymentData - Authorization response from Google Pay
 * @returns {Promise<{transactionState: string}>} Authorization state object
 */
function onPaymentAuthorized(paymentData) {
  return new Promise((resolve) => {
    console.log('[Google Pay] onPaymentAuthorized received payload:', paymentData);

    const paymentMethodData = paymentData.paymentMethodData || {};
    const token = paymentMethodData.tokenizationData?.token || 'SIMULATED_GPAY_TOKEN_XYZ123456';
    const cardInfo = paymentMethodData.info || {};
    const fundingSource = cardInfo.cardFundingSource || 'CREDIT'; // CREDIT, DEBIT, PREPAID

    console.log(`[Google Pay] Token received: ${token}`);
    console.log(`[Google Pay] Card Funding Source: ${fundingSource}`);

    // Notify checkout state of completed payment
    if (window.handlePaymentSuccess) {
      window.handlePaymentSuccess({
        token: token,
        fundingSource: fundingSource,
        paymentMethodData: paymentMethodData
      });
    }

    resolve({ transactionState: 'SUCCESS' });
  });
}

/**
 * Helper to simulate payment authorization response for testing without interactive window.
 * @param {object} cartSummary - Cart details
 */
function simulatePaymentResponse(cartSummary) {
  const simulatedFundingSource = window.getSelectedFundingSource ? window.getSelectedFundingSource() : 'CREDIT';
  const simulatedPayload = {
    paymentMethodData: {
      type: 'CARD',
      description: 'Visa •••• 1111',
      info: {
        cardNetwork: 'VISA',
        cardDetails: '1111',
        cardFundingSource: simulatedFundingSource
      },
      tokenizationData: {
        type: 'PAYMENT_GATEWAY',
        token: `mock_gpay_token_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      }
    }
  };

  onPaymentAuthorized(simulatedPayload);
}

// Export module functions globally
window.GPayModule = {
  checkIsReadyToPay,
  renderGooglePayButton,
  buildPaymentDataRequest,
  onPaymentAuthorized,
  onGooglePayButtonClicked,
  simulatePaymentResponse
};
