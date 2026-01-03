let currentStep = 1;
const totalSteps = 5;
let paymentScreenshot = null;

// Item data
const items = {
  1: { qty: 3, price: 30 },
  2: { qty: 2, price: 25 },
  3: { qty: 1, price: 18 }
};

function updateProgressBar() {
  const progressFill = document.getElementById('progressFill');
  const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  progressFill.style.width = percentage + '%';

  document.querySelectorAll('.progress-step').forEach((step, index) => {
    if (index < currentStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
}

function validateContactInfo() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const wp = document.getElementById('wp').value.trim();
  const altphone = document.getElementById('altphone').value.trim();

  // Check if all fields are filled
  if (!firstName) {
    alert('Please enter your first name');
    document.getElementById('firstName').focus();
    return false;
  }
  if (!lastName) {
    alert('Please enter your last name');
    document.getElementById('lastName').focus();
    return false;
  }
  if (!phone) {
    alert('Please enter your phone number');
    document.getElementById('phone').focus();
    return false;
  }
  
  // Validate phone number (10 digits)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    alert('Please enter a valid 10-digit phone number');
    document.getElementById('phone').focus();
    return false;
  }

  if (!email) {
    alert('Please enter your email address');
    document.getElementById('email').focus();
    return false;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    document.getElementById('email').focus();
    return false;
  }

  if (!wp) {
    alert('Please enter your WhatsApp number');
    document.getElementById('wp').focus();
    return false;
  }

  // Validate WhatsApp number (10 digits)
  if (!phoneRegex.test(wp)) {
    alert('Please enter a valid 10-digit WhatsApp number');
    document.getElementById('wp').focus();
    return false;
  }

  if (!altphone) {
    alert('Please enter your alternate phone number');
    document.getElementById('altphone').focus();
    return false;
  }

  // Validate alternate phone number (10 digits)
  if (!phoneRegex.test(altphone)) {
    alert('Please enter a valid 10-digit alternate phone number');
    document.getElementById('altphone').focus();
    return false;
  }

  return true;
}

function validateDeliveryInfo() {
  const address1 = document.getElementById('address1').value.trim();
  const address2 = document.getElementById('address2').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value;
  const pincode = document.getElementById('pincode').value.trim();

  if (!address1) {
    alert('Please enter your house/flat/street address');
    document.getElementById('address1').focus();
    return false;
  }
  if (!address2) {
    alert('Please enter your locality/area');
    document.getElementById('address2').focus();
    return false;
  }
  if (!city) {
    alert('Please enter your city/town');
    document.getElementById('city').focus();
    return false;
  }
  if (!state) {
    alert('Please select your state');
    document.getElementById('state').focus();
    return false;
  }
  if (!pincode) {
    alert('Please enter your pincode');
    document.getElementById('pincode').focus();
    return false;
  }

  // Validate pincode (6 digits)
  const pincodeRegex = /^[0-9]{6}$/;
  if (!pincodeRegex.test(pincode)) {
    alert('Please enter a valid 6-digit pincode');
    document.getElementById('pincode').focus();
    return false;
  }

  return true;
}

function changeStep(direction) {
  // Validate current step before moving forward
  if (direction === 1) {
    // VALIDATION TEMPORARILY DISABLED - Uncomment lines below to re-enable
    /*
    // Step 2 is now Contact Info - validate it
    if (currentStep === 2 && !validateContactInfo()) {
      return; // Don't proceed if validation fails
    }
    // Step 3 is now Delivery - validate it
    if (currentStep === 3 && !validateDeliveryInfo()) {
      return; // Don't proceed if validation fails
    }
    */
  }

  const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  currentStepElement.classList.remove('active');

  currentStep += direction;

  if (currentStep < 1) currentStep = 1;
  if (currentStep > totalSteps) currentStep = totalSteps;

  const newStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  newStepElement.classList.add('active');

  updateProgressBar();
  updateButtons();

  // Update summary if on review step (now step 4)
  if (currentStep === 4) {
    updateSummary();
  }
}

function updateButtons() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-block';

  if (currentStep === totalSteps) {
    nextBtn.textContent = 'Place Order';
    nextBtn.onclick = placeOrder;
  } else {
    nextBtn.textContent = 'Next';
    nextBtn.onclick = () => changeStep(1);
  }
}

function updateQty(itemId, change) {
  items[itemId].qty = Math.max(0, items[itemId].qty + change);
  document.getElementById(`qty${itemId}`).textContent = items[itemId].qty;
  
  const totalPrice = items[itemId].qty * items[itemId].price;
  document.getElementById(`price${itemId}`).textContent = `₹${totalPrice}`;

  // <-- IMPORTANT: update summary (so totals update live if user is on review or expects immediate update)
  updateSummary();
}

function getDonationAmount() {
  // Decide donation amount: customAmount takes precedence if > 0
  const donationRadio = document.querySelector('input[name="donation"]:checked');
  const customAmountRaw = document.getElementById('customAmount').value;
  let donationAmount = 0;

  if (customAmountRaw && parseFloat(customAmountRaw) > 0) {
    donationAmount = parseFloat(customAmountRaw);
  } else if (donationRadio) {
    donationAmount = parseFloat(donationRadio.value) || 0;
  }
  return donationAmount;
}

function updateSummary() {
  // 1) subtotal
  let subtotal = 0;
  for (let id in items) {
    subtotal += items[id].qty * items[id].price;
  }

  // 2) gst
  const gst = subtotal * 0.03;

  // 3) donation
  const donation = getDonationAmount();

  // 4) total
  const total = subtotal + gst + donation;

  // 5) write to DOM (use toFixed(2) for currency formatting)
  const subEl = document.getElementById('summarySubtotal');
  const gstEl = document.getElementById('summaryGST');
  const donationEl = document.getElementById('summaryDonation');
  const totalEl = document.getElementById('summaryTotal');
  const finalTotalEl = document.getElementById('finalTotal');
  
  if (subEl) subEl.textContent = `₹${subtotal.toFixed(2)}`;
  if (gstEl) gstEl.textContent = `₹${gst.toFixed(2)}`;
  if (donationEl) donationEl.textContent = `₹${donation.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
  if (finalTotalEl) finalTotalEl.textContent = `₹${total.toFixed(2)}`;
}

function placeOrder() {
  // Get donation amount
  const donationAmount = getDonationAmount();

  // Calculate final total
  let subtotal = 0;
  for (let id in items) {
    subtotal += items[id].qty * items[id].price;
  }
  const gst = subtotal * 0.03;
  const finalTotal = subtotal + gst + donationAmount;

  window.location.href = "thanks.html";

}

// Auto-update summary when donation inputs change
function attachDonationListeners() {
  document.querySelectorAll('input[name="donation"]').forEach(radio => {
    radio.addEventListener('change', updateSummary);
  });
  const customAmountInput = document.getElementById('customAmount');
  if (customAmountInput) {
    customAmountInput.addEventListener('input', updateSummary);
  }
}

// Initialize
updateProgressBar();
updateButtons();
attachDonationListeners();
updateSummary(); // ensure UI shows correct totals from the start
