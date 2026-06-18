// ==========================================================================
// LIFE HOPE - APPLICATION LOGIC & MATCHING CONTROLLER
// ==========================================================================

// Global Application State
let appState = {
  currentStep: 1,
  theme: 'light',
  isRegistered: false,
  registeredDonorData: null,
  database: []
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initStepper();
  initCardPreview();
  initSignaturePad();
  initDatabase();
  initMatchEngine();
});

// ==========================================
// THEME CONTROLLER (LIGHT/DARK MODE)
// ==========================================
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('lifehope-theme') || 'light';
  
  setTheme(savedTheme);
  
  themeToggle.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('lifehope-theme', theme);
  
  const sunIcon = document.querySelector('.theme-sun');
  if (theme === 'dark') {
    sunIcon.style.transform = 'rotate(180deg)';
  } else {
    sunIcon.style.transform = 'rotate(0deg)';
  }
}

// ==========================================
// SPA ROUTING & NAVIGATION
// ==========================================
function initNavigation() {
  // Mobile Hamburger Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinksList = document.getElementById('nav-links');
  
  menuToggle.addEventListener('click', () => {
    navLinksList.classList.toggle('mobile-active');
    // Simple visual toggle for hamburger lines
    const spans = menuToggle.querySelectorAll('span');
    spans[0].style.transform = navLinksList.classList.contains('mobile-active') ? 'rotate(45deg) translate(6px, 6px)' : 'none';
    spans[1].style.opacity = navLinksList.classList.contains('mobile-active') ? '0' : '1';
    spans[2].style.transform = navLinksList.classList.contains('mobile-active') ? 'rotate(-45deg) translate(6px, -6px)' : 'none';
  });

  // Desktop Card Manual 3D Flip Action
  const cardWrap = document.getElementById('preview-card-wrap');
  if (cardWrap) {
    cardWrap.addEventListener('click', () => {
      cardWrap.classList.toggle('flipped');
    });
  }
}

function switchView(viewName) {
  // Hide all views
  const views = document.querySelectorAll('.app-view');
  views.forEach(view => {
    view.classList.remove('active');
  });

  // Activate target view
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update navigation active states
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    if (link.getAttribute('data-view') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Close mobile menu if active
  const navLinksList = document.getElementById('nav-links');
  if (navLinksList.classList.contains('mobile-active')) {
    navLinksList.classList.remove('mobile-active');
    const menuToggle = document.getElementById('menu-toggle');
    const spans = menuToggle.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  }
}

// ==========================================
// REGISTRATION STEPPER MANAGEMENT
// ==========================================
function initStepper() {
  const nextBtn = document.getElementById('step-next');
  const backBtn = document.getElementById('step-back');
  
  nextBtn.addEventListener('click', () => {
    if (validateStep(appState.currentStep)) {
      if (appState.currentStep < 4) {
        goToStep(appState.currentStep + 1);
      } else {
        submitRegistration();
      }
    }
  });
  
  backBtn.addEventListener('click', () => {
    if (appState.currentStep > 1) {
      goToStep(appState.currentStep - 1);
    }
  });

  // Click direct step indicators if valid
  const stepNodes = document.querySelectorAll('.step-node');
  stepNodes.forEach(node => {
    node.addEventListener('click', () => {
      const targetStep = parseInt(node.getAttribute('data-step'));
      if (targetStep < appState.currentStep) {
        goToStep(targetStep);
      } else if (targetStep > appState.currentStep && validateStep(appState.currentStep)) {
        // Only allow moving forward one step if current validates
        if (targetStep === appState.currentStep + 1) {
          goToStep(targetStep);
        }
      }
    });
  });
}

function goToStep(stepNum) {
  // Hide current step content
  document.getElementById(`step-${appState.currentStep}-content`).classList.remove('active');
  
  // Show new step content
  document.getElementById(`step-${stepNum}-content`).classList.add('active');
  
  // Update step navigation UI
  const stepNodes = document.querySelectorAll('.step-node');
  stepNodes.forEach(node => {
    const nodeVal = parseInt(node.getAttribute('data-step'));
    node.classList.remove('active');
    node.classList.remove('completed');
    
    if (nodeVal === stepNum) {
      node.classList.add('active');
    } else if (nodeVal < stepNum) {
      node.classList.add('completed');
    }
  });

  // Update Progress Bar %
  const progressBar = document.getElementById('stepper-progress-bar');
  const percentage = ((stepNum - 1) / 3) * 100;
  progressBar.style.width = `${percentage}%`;

  // Update Nav Buttons visibility/labels
  const backBtn = document.getElementById('step-back');
  const nextBtn = document.getElementById('step-next');
  
  backBtn.style.visibility = stepNum === 1 ? 'hidden' : 'visible';
  nextBtn.textContent = stepNum === 4 ? 'Confirm Registration' : 'Next Step';
  
  appState.currentStep = stepNum;
}

function validateStep(stepNum) {
  let isValid = true;
  
  if (stepNum === 1) {
    const name = document.getElementById('reg-name');
    const dob = document.getElementById('reg-dob');
    const email = document.getElementById('reg-email');
    const phone = document.getElementById('reg-phone');
    const address = document.getElementById('reg-address');
    
    if (!name.value.trim()) { name.focus(); showToast('Full Legal Name is required', 'error'); return false; }
    if (!dob.value) { dob.focus(); showToast('Date of Birth is required', 'error'); return false; }
    if (!email.value.trim() || !validateEmail(email.value)) { email.focus(); showToast('A valid Email Address is required', 'error'); return false; }
    if (!phone.value.trim()) { phone.focus(); showToast('Phone Number is required', 'error'); return false; }
    if (!address.value.trim()) { address.focus(); showToast('Residential Address is required', 'error'); return false; }
  } 
  else if (stepNum === 2) {
    const blood = document.getElementById('reg-blood');
    const emergency = document.getElementById('reg-emergency');
    const selectedOrgans = document.querySelectorAll('.organ-checkbox:checked');
    
    if (!blood.value) { blood.focus(); showToast('Please select your blood group', 'error'); return false; }
    if (!emergency.value.trim()) { emergency.focus(); showToast('Emergency Contact Phone is required', 'error'); return false; }
    if (selectedOrgans.length === 0) { showToast('Please choose at least one organ to donate', 'error'); return false; }
  } 
  else if (stepNum === 3) {
    // Step 3 rewards doesn't require hard locks, but we validate user flow completeness
    isValid = true;
  } 
  else if (stepNum === 4) {
    const consentCheck = document.getElementById('reg-consent');
    const esign = document.getElementById('reg-esign');
    
    if (!esign.value.trim()) { esign.focus(); showToast('Digital E-Signature name is required', 'error'); return false; }
    if (!consentCheck.checked) { consentCheck.focus(); showToast('You must consent to the HIPAA policy to proceed', 'error'); return false; }
  }
  
  return isValid;
}

// Helper Email Validation regex
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
}

// ==========================================
// REAL-TIME CARD PREVIEW SYSTEM
// ==========================================
function initCardPreview() {
  const nameInput = document.getElementById('reg-name');
  const bloodSelect = document.getElementById('reg-blood');
  const phoneInput = document.getElementById('reg-phone');
  const emgInput = document.getElementById('reg-emergency');
  
  // Real-time front updates
  nameInput.addEventListener('input', () => {
    const nameLabel = document.getElementById('card-name-label');
    nameLabel.textContent = nameInput.value.trim() ? nameInput.value.toUpperCase() : 'JOHN DOE';
  });

  bloodSelect.addEventListener('change', () => {
    const bloodLabel = document.getElementById('card-blood-label');
    bloodLabel.textContent = bloodSelect.value;
  });

  // Real-time back updates
  phoneInput.addEventListener('input', () => {
    const phoneLabel = document.getElementById('card-phone-label');
    phoneLabel.textContent = phoneInput.value.trim() ? phoneInput.value : '+1 (555) 000-0000';
  });

  emgInput.addEventListener('input', () => {
    const emgLabel = document.getElementById('card-emg-label');
    emgLabel.textContent = emgInput.value.trim() ? emgInput.value : '+1 (555) 999-9999';
  });

  // Organ Select Change Handler
  const organCheckboxes = document.querySelectorAll('.organ-checkbox');
  organCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateCardOrgans);
  });
}

function updateCardOrgans() {
  const selectedCbs = document.querySelectorAll('.organ-checkbox:checked');
  const organLabel = document.getElementById('card-organs-label');
  
  if (selectedCbs.length === 0) {
    organLabel.textContent = 'None';
    return;
  }
  
  const names = Array.from(selectedCbs).map(cb => cb.value);
  organLabel.textContent = names.join(', ');
}

// ==========================================
// E-SIGNATURE CANVAS DRAWING SYSTEM
// ==========================================
let drawing = false;
let canvas, ctx;

function initSignaturePad() {
  canvas = document.getElementById('signature-pad');
  ctx = canvas.getContext('2d');
  
  // Setup line values
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  
  // Fit canvas context dimensions
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Clear pad trigger
  document.getElementById('clear-sig').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Mouse events
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  // Touch events for mobile support
  canvas.addEventListener('touchstart', (e) => {
    startDrawing(e.touches[0]);
    e.preventDefault();
  });
  canvas.addEventListener('touchmove', (e) => {
    draw(e.touches[0]);
    e.preventDefault();
  });
  canvas.addEventListener('touchend', stopDrawing);
}

function resizeCanvas() {
  // Save current signature sketches before resize
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(canvas, 0, 0);

  // Resize canvas boundary box
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  // Restore strokes and settings
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.drawImage(tempCanvas, 0, 0);
}

function startDrawing(e) {
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
}

function stopDrawing() {
  drawing = false;
  ctx.closePath();
}

// ==========================================
// CORE DATABASE SEEDING
// ==========================================
function initDatabase() {
  // Load database from localStorage
  const savedDb = localStorage.getItem('lifehope-db');
  
  if (savedDb) {
    appState.database = JSON.parse(savedDb);
  } else {
    // Seed sample donor databases for Transplant Matching Portal
    const mockDonors = [
      {
        id: 'LH-118234',
        name: 'Sarah Connor',
        dob: '1984-11-10',
        bloodGroup: 'O Negative',
        email: 'sarah@resistance.org',
        phone: '+1 (555) 304-2983',
        emergencyPhone: '+1 (555) 998-3829',
        organs: ['Heart', 'Kidneys', 'Liver', 'Lungs'],
        registeredDate: 'May 12, 2026'
      },
      {
        id: 'LH-334281',
        name: 'Bruce Wayne',
        dob: '1975-02-19',
        bloodGroup: 'AB Positive',
        email: 'bruce@waynecorp.com',
        phone: '+1 (555) 991-3829',
        emergencyPhone: '+1 (555) 881-2294',
        organs: ['Kidneys', 'Corneas', 'Liver', 'Pancreas'],
        registeredDate: 'April 20, 2026'
      },
      {
        id: 'LH-902341',
        name: 'Peter Parker',
        dob: '2001-08-10',
        bloodGroup: 'A Positive',
        email: 'peter@dailybugle.com',
        phone: '+1 (555) 438-2918',
        emergencyPhone: '+1 (555) 881-9983',
        organs: ['Heart', 'Lungs', 'Corneas'],
        registeredDate: 'May 04, 2026'
      },
      {
        id: 'LH-448291',
        name: 'Elena Rostova',
        dob: '1992-06-25',
        bloodGroup: 'B Positive',
        email: 'elena@rostov.net',
        phone: '+1 (555) 774-2910',
        emergencyPhone: '+1 (555) 441-2983',
        organs: ['Heart', 'Kidneys', 'Liver', 'Lungs', 'Pancreas', 'Corneas'],
        registeredDate: 'May 22, 2026'
      },
      {
        id: 'LH-223401',
        name: 'Marcus Vance',
        dob: '1988-12-05',
        bloodGroup: 'O Positive',
        email: 'marcus.v@gmail.com',
        phone: '+1 (555) 443-2281',
        emergencyPhone: '+1 (555) 332-9982',
        organs: ['Liver', 'Pancreas'],
        registeredDate: 'May 18, 2026'
      }
    ];
    
    appState.database = mockDonors;
    localStorage.setItem('lifehope-db', JSON.stringify(appState.database));
  }
}

// ==========================================
// REGISTRATION SUBMISSION LOGIC
// ==========================================
function submitRegistration() {
  const name = document.getElementById('reg-name').value.trim();
  const dob = document.getElementById('reg-dob').value;
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const address = document.getElementById('reg-address').value.trim();
  const bloodGroup = document.getElementById('reg-blood').value;
  const emergencyPhone = document.getElementById('reg-emergency').value.trim();
  
  // Selected Organs
  const organCbs = document.querySelectorAll('.organ-checkbox:checked');
  const organs = Array.from(organCbs).map(cb => cb.value);
  
  // Selected Rewards
  const rewardCbs = document.querySelectorAll('.reward-checkbox:checked');
  const rewardsSelected = Array.from(rewardCbs).map(cb => cb.value);

  // Generate Unique ID & Date
  const uniqueId = `LH-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const regDate = new Date().toLocaleDateString('en-US', dateOptions);

  // Package Data
  const newDonor = {
    id: uniqueId,
    name: name,
    dob: dob,
    bloodGroup: bloodGroup,
    email: email,
    phone: phone,
    emergencyPhone: emergencyPhone,
    address: address,
    organs: organs,
    rewards: rewardsSelected,
    registeredDate: regDate
  };

  // Add to local state & save to LocalStorage DB
  appState.database.push(newDonor);
  localStorage.setItem('lifehope-db', JSON.stringify(appState.database));

  // Update application state
  appState.isRegistered = true;
  appState.registeredDonorData = newDonor;

  // Activate Card Visuals
  const cardWrap = document.getElementById('preview-card-wrap');
  cardWrap.classList.add('is-active');
  
  document.getElementById('card-id-label').textContent = uniqueId;
  const statusLabel = document.getElementById('card-status-label');
  statusLabel.textContent = 'Active';
  statusLabel.style.backgroundColor = 'var(--emerald)';

  // Populate Wellness Dashboard Perks
  populatePerksDashboard(newDonor);

  // Populate Appreciation Certificate details
  document.getElementById('cert-holder-name').textContent = name;
  document.getElementById('cert-date-label').textContent = regDate;
  
  // Enable certificate printing
  const printBtn = document.getElementById('print-cert-btn');
  printBtn.removeAttribute('disabled');
  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Success notifications
  showToast('Registration successfully submitted!', 'success');
  
  // Shift automatically to Benefits / Rewards dashboard after 1.5 seconds
  setTimeout(() => {
    switchView('benefits');
    showToast('Congratulations! Healthcare perks are now active.', 'success');
  }, 1200);
}

function populatePerksDashboard(donor) {
  const container = document.getElementById('benefits-rewards-grid');
  container.innerHTML = ''; // Clear empty state
  
  if (donor.rewards.length === 0) {
    container.innerHTML = `
      <div class="reward-item-card">
        <div class="reward-item-icon" style="background-color: var(--primary-light); color: var(--primary);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="reward-item-info">
          <h3>Pledge Verified Successfully</h3>
          <p>You did not opt for specific rewards, but your digital ID card is active in transplant matching networks!</p>
        </div>
      </div>`;
    return;
  }

  donor.rewards.forEach(reward => {
    let title = reward;
    let desc = '';
    let coupon = `LH-PERK-${Math.floor(1000 + Math.random() * 9000)}`;
    let svgIcon = '';

    if (reward.includes('Checkup')) {
      desc = 'Annual health evaluations, diagnostics, and coordinator support are activated. Present digital card LH code at clinics.';
      svgIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
    } else if (reward.includes('Priority')) {
      desc = 'Bypass standard booking lines. Present card at clinic reception desks to notify VIP coordinator liaison desks.';
      svgIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    } else {
      desc = 'Diagnostic discounts. Apply coupon code at diagnostic partners for 30% reduction in billing invoices.';
      svgIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8l-8 8M9 8h7v7"/></svg>';
    }

    const card = document.createElement('div');
    card.className = 'reward-item-card';
    card.innerHTML = `
      <div class="reward-item-icon">${svgIcon}</div>
      <div class="reward-item-info">
        <h3>${title}</h3>
        <p>${desc}</p>
        <div class="reward-coupon-code">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          Active ID: ${coupon}
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// ==========================================
// TRANSPLANT SUPPORT MATCH ENGINE
// ==========================================
const BLOOD_COMPATIBILITY = {
  // Key = RECIPIENT, Value = Array of compatible DONOR groups
  'O Positive': ['O Positive', 'O Negative'],
  'O Negative': ['O Negative'],
  'A Positive': ['A Positive', 'A Negative', 'O Positive', 'O Negative'],
  'A Negative': ['A Negative', 'O Negative'],
  'B Positive': ['B Positive', 'B - Negative', 'B Negative', 'O Positive', 'O Negative'],
  'B Negative': ['B Negative', 'O Negative'],
  'AB Positive': ['O Positive', 'O Negative', 'A Positive', 'A Negative', 'B Positive', 'B Negative', 'AB Positive', 'AB Negative'],
  'AB Negative': ['AB Negative', 'A Negative', 'B Negative', 'O Negative']
};

function initMatchEngine() {
  const findMatchBtn = document.getElementById('find-match-btn');
  findMatchBtn.addEventListener('click', runMatchQuery);
}

function runMatchQuery() {
  const organ = document.getElementById('match-organ').value;
  const recipientBlood = document.getElementById('match-blood').value;
  const urgency = document.getElementById('match-urgency').value;
  const container = document.getElementById('matches-list-container');
  
  // Filter compatible donors based on Blood compatibility and Organ availability
  const compatibleDonors = appState.database.filter(donor => {
    // 1. Must offer the selected organ
    const offersOrgan = donor.organs.includes(organ);
    
    // 2. Must be compatible blood group
    const acceptableDonors = BLOOD_COMPATIBILITY[recipientBlood] || [];
    // Normalize blood type matches (flexible text checks)
    const bloodMatch = acceptableDonors.some(type => 
      donor.bloodGroup.toLowerCase().trim() === type.toLowerCase().trim()
    );

    return offersOrgan && bloodMatch;
  });

  // Render match score cards
  container.innerHTML = '';
  document.getElementById('results-num').textContent = compatibleDonors.length;

  if (compatibleDonors.length === 0) {
    container.innerHTML = `
      <div class="empty-matches">
        <div class="empty-matches-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </div>
        <h3>No compatible donors available</h3>
        <p>No currently registered donor matches these parameters. System alerts will be broadcast to partner registries automatically.</p>
      </div>`;
    return;
  }

  // Sort by calculated mock HLA match percentages
  const scoredDonors = compatibleDonors.map(donor => {
    // Base compatibility (ABO matches always high compatibility base)
    let score = 85; 
    
    // Exact match blood bonus
    if (donor.bloodGroup === recipientBlood) score += 5;
    
    // Random HLA minor index weights
    const hlaWeight = Math.floor(Math.random() * 8);
    score += hlaWeight;

    // Distances
    const mockDistance = Math.floor(2 + Math.random() * 45);

    return {
      ...donor,
      score: score,
      distance: mockDistance
    };
  });

  // Sort descending by score
  scoredDonors.sort((a, b) => b.score - a.score);

  scoredDonors.forEach(donor => {
    const card = document.createElement('div');
    card.className = 'match-card';
    
    // Initial avatars
    const initials = donor.name.split(' ').map(n => n[0]).join('');

    card.innerHTML = `
      <div class="donor-avatar-box">${initials}</div>
      <div class="match-info-box">
        <h3>
          ${donor.name} 
          <span class="match-blood-badge">${donor.bloodGroup}</span>
        </h3>
        <div class="match-details-grid">
          <div><strong>Donor ID:</strong> ${donor.id}</div>
          <div><strong>Distance:</strong> ${donor.distance} km away</div>
          <div><strong>Age:</strong> ${calculateAge(donor.dob)} years</div>
          <div><strong>Registered Date:</strong> ${donor.registeredDate}</div>
        </div>
      </div>
      <div class="match-score-panel">
        <div class="match-percentage">${donor.score}%</div>
        <div class="match-percentage-label">HLA MATCH QUALITY</div>
        <button class="btn btn-primary" onclick="notifyDonor('${donor.name}', '${donor.phone}')" style="padding: 0.4rem 1rem; font-size: 0.8rem; margin-top: 0.5rem; border-radius: var(--radius-sm)">Contact Coordinator</button>
      </div>
    `;
    
    container.appendChild(card);
  });

  showToast(`Database search complete. ${compatibleDonors.length} matches retrieved.`, 'success');
}

function calculateAge(dobString) {
  const birthDate = new Date(dobString);
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function notifyDonor(name, phone) {
  showToast(`Transplant coordination channel opened for ${name}. System coordinates shared.`, 'success');
}

// ==========================================
// TOAST NOTIFICATIONS UTILITY
// ==========================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '';
  if (type === 'success') {
    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
  } else {
    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  }

  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove toast after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'slideInToast 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}
