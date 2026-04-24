// Stock Portfolio Analyzer - Complete Fixed JavaScript

const CONFIG = {
  MOCK_MODE: true,
  STORAGE_PREFIX: 'Exponent_',
};

const AppState = {
  user: null,
  portfolio: {
    holdings: [],
    snapshots: [],
    totalInvested: 0,
    currentValue: 0,
    totalPL: 0,
    dayChange: 0,
  },
  watchlist: [],
  alerts: [],
  currentView: 'dashboard',
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

function initApp() {
  loadUserData();
  if (AppState.user) {
    navigateToPage('dashboardPage');
    loadPortfolioData();
    updateUserInfo();
  } else {
    navigateToPage('landingPage');
  }
}

function setupEventListeners() {
  // Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Signup Form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  // Alert Form
  const alertForm = document.getElementById('alertForm');
  if (alertForm) {
    alertForm.addEventListener('submit', createAlert);
  }

  // File Upload
  const fileInput = document.getElementById('fileInput');
  const fileUpload = document.getElementById('fileUpload');

  if (fileInput && fileUpload) {
    fileUpload.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
  }

  // Stock Search
  const stockSearch = document.getElementById('stockSearch');
  if (stockSearch) {
    stockSearch.addEventListener('input', (e) => searchStocks(e.target.value));
  }

  // Sidebar Navigation
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const view = this.getAttribute('data-view');
      showDashboardView(view);
    });
  });

  // Chart Controls
  const chartBtns = document.querySelectorAll('.chart-control-btn');
  chartBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      chartBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      updatePortfolioChart();
    });
  });

  // Dark Mode Toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', toggleDarkMode);
  }
}

// Page Navigation
function navigateToPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }
}

function showDashboardView(viewName) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(viewName + 'View');
  if (targetView) {
    targetView.classList.add('active');
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  const activeItem = document.querySelector(`[data-view="${viewName}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }

  AppState.currentView = viewName;

  if (viewName === 'dashboard') {
    setTimeout(() => refreshDashboard(), 100);
  } else if (viewName === 'watchlist') {
    loadWatchlist();
  } else if (viewName === 'alerts') {
    loadAlerts();
  }
}

// Authentication
function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  // Check if user exists
  const savedUsers = JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'users') || '[]');
  const user = savedUsers.find(u => u.email === email);

  if (!user) {
    showToast('Account not found. Please sign up first.', 'error');
    return;
  }

  if (user.password !== password) {
    showToast('Incorrect password', 'error');
    return;
  }

  // Login successful
  AppState.user = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  saveToStorage('current_user', AppState.user);
  showToast('Login successful! Welcome back.', 'success');

  setTimeout(() => {
    navigateToPage('dashboardPage');
    loadPortfolioData();
    updateUserInfo();
  }, 500);
}

function handleSignup(event) {
  event.preventDefault();

  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  if (!name || !email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  // Check if user already exists
  const savedUsers = JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'users') || '[]');
  if (savedUsers.find(u => u.email === email)) {
    showToast('Email already registered. Please login.', 'error');
    return;
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  savedUsers.push(newUser);
  localStorage.setItem(CONFIG.STORAGE_PREFIX + 'users', JSON.stringify(savedUsers));

  // Login the user
  AppState.user = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };

  saveToStorage('current_user', AppState.user);
  initializeMockData();
  showToast('Account created successfully!', 'success');

  setTimeout(() => {
    navigateToPage('dashboardPage');
    loadPortfolioData();
    updateUserInfo();
  }, 500);
}

function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    AppState.user = null;
    localStorage.removeItem(CONFIG.STORAGE_PREFIX + 'current_user');
    showToast('Logged out successfully', 'info');
    navigateToPage('landingPage');
  }
}

function updateUserInfo() {
  if (AppState.user) {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const settingsName = document.getElementById('settingsName');
    const settingsEmail = document.getElementById('settingsEmail');

    if (userName) userName.textContent = AppState.user.name;
    if (userEmail) userEmail.textContent = AppState.user.email;
    if (settingsName) settingsName.value = AppState.user.name;
    if (settingsEmail) settingsEmail.value = AppState.user.email;
  }
}

// Storage
function saveToStorage(key, data) {
  const fullKey = AppState.user ? `${CONFIG.STORAGE_PREFIX}${AppState.user.id}_${key}` : `${CONFIG.STORAGE_PREFIX}${key}`;
  localStorage.setItem(fullKey, JSON.stringify(data));
}

function getFromStorage(key) {
  const fullKey = AppState.user ? `${CONFIG.STORAGE_PREFIX}${AppState.user.id}_${key}` : `${CONFIG.STORAGE_PREFIX}${key}`;
  const data = localStorage.getItem(fullKey);
  return data ? JSON.parse(data) : null;
}

function loadUserData() {
  const currentUser = localStorage.getItem(CONFIG.STORAGE_PREFIX + 'current_user');
  if (currentUser) {
    AppState.user = JSON.parse(currentUser);
  }
}

// Portfolio Data
function loadPortfolioData() {
  const saved = getFromStorage('portfolio');
  if (saved) {
    AppState.portfolio = saved;
  } else if (CONFIG.MOCK_MODE) {
    initializeMockData();
  }

  const savedWatchlist = getFromStorage('watchlist');
  if (savedWatchlist) {
    AppState.watchlist = savedWatchlist;
  }

  const savedAlerts = getFromStorage('alerts');
  if (savedAlerts) {
    AppState.alerts = savedAlerts;
  }

  setTimeout(() => refreshDashboard(), 200);
}

function initializeMockData() {
  AppState.portfolio = {
    holdings: [
      {
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries',
        quantity: 10,
        avgBuyPrice: 2400,
        currentPrice: 2456.75,
        investedValue: 24000,
        currentValue: 24567.50,
        profitLoss: 567.50,
        profitLossPercent: 2.36,
        dayChange: 123.50,
        dayChangePercent: 5.29,
        sector: 'Energy',
      },
      {
        symbol: 'TCS',
        companyName: 'Tata Consultancy Services',
        quantity: 5,
        avgBuyPrice: 3500,
        currentPrice: 3678.90,
        investedValue: 17500,
        currentValue: 18394.50,
        profitLoss: 894.50,
        profitLossPercent: 5.11,
        dayChange: 189.45,
        dayChangePercent: 5.41,
        sector: 'IT',
      },
      {
        symbol: 'INFY',
        companyName: 'Infosys',
        quantity: 15,
        avgBuyPrice: 1450,
        currentPrice: 1523.40,
        investedValue: 21750,
        currentValue: 22851,
        profitLoss: 1101,
        profitLossPercent: 5.06,
        dayChange: 367.65,
        dayChangePercent: 2.47,
        sector: 'IT',
      },
      {
        symbol: 'HDFCBANK',
        companyName: 'HDFC Bank',
        quantity: 20,
        avgBuyPrice: 1580,
        currentPrice: 1543.20,
        investedValue: 31600,
        currentValue: 30864,
        profitLoss: -736,
        profitLossPercent: -2.33,
        dayChange: -493.28,
        dayChangePercent: -1.57,
        sector: 'Banking',
      },
    ],
    snapshots: [],
  };

  saveToStorage('portfolio', AppState.portfolio);
}

function calculatePortfolioTotals() {
  let totalInvested = 0;
  let currentValue = 0;
  let totalPL = 0;
  let dayChange = 0;

  AppState.portfolio.holdings.forEach(holding => {
    totalInvested += holding.investedValue;
    currentValue += holding.currentValue;
    totalPL += holding.profitLoss;
    dayChange += holding.dayChange;
  });

  AppState.portfolio.totalInvested = totalInvested;
  AppState.portfolio.currentValue = currentValue;
  AppState.portfolio.totalPL = totalPL;
  AppState.portfolio.dayChange = dayChange;
  AppState.portfolio.dayChangePercent = totalInvested > 0 ? (dayChange / totalInvested) * 100 : 0;
  AppState.portfolio.totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;
}

function refreshDashboard() {
  calculatePortfolioTotals();
  updateStatsCards();
  updateHoldingsTable();
  updatePortfolioChart();
}

function updateStatsCards() {
  const totalInvestedEl = document.getElementById('totalInvested');
  const currentValueEl = document.getElementById('currentValue');
  const totalPLEl = document.getElementById('totalPL');
  const dayChangeEl = document.getElementById('dayChange');

  if (totalInvestedEl) totalInvestedEl.textContent = formatCurrency(AppState.portfolio.totalInvested);
  if (currentValueEl) currentValueEl.textContent = formatCurrency(AppState.portfolio.currentValue);
  if (totalPLEl) totalPLEl.textContent = formatCurrency(AppState.portfolio.totalPL);
  if (dayChangeEl) dayChangeEl.textContent = formatCurrency(AppState.portfolio.dayChange);

  const plPercentEl = document.getElementById('plPercent');
  const dayPercentEl = document.getElementById('dayPercent');

  if (plPercentEl) plPercentEl.textContent = formatPercent(AppState.portfolio.totalPLPercent);
  if (dayPercentEl) dayPercentEl.textContent = formatPercent(AppState.portfolio.dayChangePercent);

  // Update arrow indicators
  updateArrowIndicator('pl', AppState.portfolio.totalPL);
  updateArrowIndicator('day', AppState.portfolio.dayChange);
}

function updateArrowIndicator(prefix, value) {
  const arrow = document.getElementById(prefix + 'Arrow');
  const parentCard = arrow?.closest('.stat-card-change');

  if (!parentCard) return;

  parentCard.classList.remove('positive', 'negative');

  if (value >= 0) {
    parentCard.classList.add('positive');
    if (arrow) arrow.textContent = '↑';
  } else {
    parentCard.classList.add('negative');
    if (arrow) arrow.textContent = '↓';
  }
}

function updateHoldingsTable() {
  const tbody = document.getElementById('holdingsTableBody');

  if (!tbody) return;

  if (AppState.portfolio.holdings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2rem;">
          <div class="empty-state">
            <p>No holdings yet. Upload your portfolio screenshot to get started.</p>
            <button onclick="showDashboardView('upload')" class="btn btn-primary" style="margin-top: 1rem;">
              Upload Now
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = AppState.portfolio.holdings.map(holding => `
    <tr>
      <td>
        <div style="font-weight: 600;">${holding.symbol}</div>
        <div style="font-size: 0.813rem; color: var(--dark-500);">${holding.companyName}</div>
      </td>
      <td>${holding.quantity}</td>
      <td>${formatCurrency(holding.avgBuyPrice)}</td>
      <td>${formatCurrency(holding.currentPrice)}</td>
      <td>${formatCurrency(holding.investedValue)}</td>
      <td>${formatCurrency(holding.currentValue)}</td>
      <td style="color: ${holding.profitLoss >= 0 ? 'var(--success-600)' : 'var(--danger-600)'}; font-weight: 600;">
        ${formatCurrency(holding.profitLoss)}
      </td>
      <td>
        <span class="badge ${holding.profitLossPercent >= 0 ? 'badge-success' : 'badge-danger'}">
          ${formatPercent(holding.profitLossPercent)}
        </span>
      </td>
    </tr>
  `).join('');
}

function updatePortfolioChart() {
  const canvas = document.getElementById('portfolioChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Set canvas size
  canvas.width = canvas.offsetWidth;
  canvas.height = 300;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Generate data
  const data = generateMockChartData();
  drawLineChart(ctx, canvas, data);
}

function drawLineChart(ctx, canvas, data) {
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  if (data.length === 0) return;

  const values = data.map(d => d.value);
  const min = Math.min(...values) * 0.98;
  const max = Math.max(...values) * 1.02;
  const range = max - min;

  // Draw line
  ctx.beginPath();
  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';

  data.forEach((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((point.value - min) / range) * chartHeight;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  // Draw gradient fill
  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, 'rgba(14, 165, 233, 0.2)');
  gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');

  ctx.lineTo(width - padding, height - padding);
  ctx.lineTo(padding, height - padding);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
}

function generateMockChartData() {
  const data = [];
  const baseValue = AppState.portfolio.totalInvested || 100000;

  for (let i = 0; i < 30; i++) {
    const variance = (Math.random() - 0.45) * baseValue * 0.03;
    data.push({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      value: baseValue + variance + (i * baseValue * 0.002),
    });
  }

  return data;
}

// File Upload & OCR
let uploadedFile = null;

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    showToast('File size must be less than 10MB', 'error');
    return;
  }

  uploadedFile = file;
  const reader = new FileReader();

  reader.onload = (e) => {
    const preview = document.getElementById('uploadPreview');
    const img = document.getElementById('previewImage');
    if (preview && img) {
      preview.style.display = 'block';
      img.src = e.target.result;
    }
  };

  reader.readAsDataURL(file);
}

async function processOCR() {
  if (!uploadedFile) {
    showToast('Please select a file first', 'error');
    return;
  }

  const progress = document.getElementById('ocrProgress');
  if (progress) progress.style.display = 'block';

  try {
    let progressValue = 0;
    const progressInterval = setInterval(() => {
      progressValue += 10;
      if (progressValue <= 90) {
        const fillEl = document.getElementById('progressFill');
        const textEl = document.getElementById('progressText');
        if (fillEl) fillEl.style.width = progressValue + '%';
        if (textEl) textEl.textContent = progressValue + '%';
      }
    }, 300);

    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    clearInterval(progressInterval);

    const fillEl = document.getElementById('progressFill');
    const textEl = document.getElementById('progressText');
    if (fillEl) fillEl.style.width = '100%';
    if (textEl) textEl.textContent = '100%';

    const extractedHoldings = [
      { symbol: 'RELIANCE', quantity: 10, avgBuyPrice: 2400, currentPrice: 2456.75 },
      { symbol: 'TCS', quantity: 5, avgBuyPrice: 3500, currentPrice: 3678.90 },
    ];

    setTimeout(() => {
      if (progress) progress.style.display = 'none';
      displayOCRResults(extractedHoldings);
    }, 500);

  } catch (error) {
    console.error('OCR Error:', error);
    showToast('OCR processing failed. Please try again.', 'error');
    if (progress) progress.style.display = 'none';
  }
}

function displayOCRResults(holdings) {
  const tbody = document.getElementById('ocrTableBody');
  const results = document.getElementById('ocrResults');

  if (!tbody || !results) return;

  tbody.innerHTML = holdings.map((holding, index) => `
    <tr data-index="${index}">
      <td><input type="text" class="form-input" value="${holding.symbol}" data-field="symbol"></td>
      <td><input type="number" class="form-input" value="${holding.quantity}" data-field="quantity"></td>
      <td><input type="number" class="form-input" value="${holding.avgBuyPrice}" data-field="avgBuyPrice"></td>
      <td><input type="number" class="form-input" value="${holding.currentPrice}" data-field="currentPrice"></td>
      <td><button onclick="removeOCRRow(this)" class="btn btn-danger btn-sm">Remove</button></td>
    </tr>
  `).join('');

  results.style.display = 'block';
}

function removeOCRRow(button) {
  const row = button.closest('tr');
  if (row) row.remove();
}

function saveSnapshot() {
  const tbody = document.getElementById('ocrTableBody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  const newHoldings = [];

  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const symbol = inputs[0].value;
    const quantity = parseFloat(inputs[1].value);
    const avgBuyPrice = parseFloat(inputs[2].value);
    const currentPrice = parseFloat(inputs[3].value);

    if (symbol && quantity && avgBuyPrice && currentPrice) {
      const investedValue = quantity * avgBuyPrice;
      const currentValue = quantity * currentPrice;
      const profitLoss = currentValue - investedValue;
      const profitLossPercent = (profitLoss / investedValue) * 100;

      newHoldings.push({
        symbol,
        companyName: symbol,
        quantity,
        avgBuyPrice,
        currentPrice,
        investedValue,
        currentValue,
        profitLoss,
        profitLossPercent,
        dayChange: 0,
        dayChangePercent: 0,
        sector: 'Unknown',
      });
    }
  });

  if (newHoldings.length === 0) {
    showToast('Please add at least one holding', 'error');
    return;
  }

  AppState.portfolio.holdings = [...AppState.portfolio.holdings, ...newHoldings];
  saveToStorage('portfolio', AppState.portfolio);

  showToast('Snapshot saved successfully!', 'success');
  cancelOCR();
  showDashboardView('dashboard');
}

function cancelOCR() {
  const results = document.getElementById('ocrResults');
  const preview = document.getElementById('uploadPreview');
  const fileInput = document.getElementById('fileInput');

  if (results) results.style.display = 'none';
  if (preview) preview.style.display = 'none';
  if (fileInput) fileInput.value = '';
  uploadedFile = null;
}

// Market Functions
function searchStocks(query) {
  const resultsEl = document.getElementById('searchResults');
  if (!resultsEl) return;

  if (!query || query.length < 2) {
    resultsEl.innerHTML = '';
    return;
  }

  const mockResults = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2456.75, change: 2.36 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3678.90, change: 5.11 },
    { symbol: 'INFY', name: 'Infosys', price: 1523.40, change: 5.06 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1543.20, change: -2.45 },
  ];

  const filtered = mockResults.filter(stock =>
    stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
    stock.name.toLowerCase().includes(query.toLowerCase())
  );

  resultsEl.innerHTML = filtered.map(stock => `
    <div class="mover-item" style="cursor: pointer; margin-bottom: 0.5rem;">
      <div>
        <div class="mover-symbol">${stock.symbol}</div>
        <div class="mover-price">${stock.name}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 600;">${formatCurrency(stock.price)}</div>
        <div class="badge ${stock.change >= 0 ? 'badge-success' : 'badge-danger'}">
          ${formatPercent(stock.change)}
        </div>
      </div>
    </div>
  `).join('') || '<p style="color: var(--dark-500); padding: 1rem;">No results found</p>';
}

// Watchlist Functions
function loadWatchlist() {
  updateWatchlistDisplay();
}

function addToWatchlistClick() {
  const input = document.getElementById('watchlistSearch');
  if (!input) return;

  const symbol = input.value.trim().toUpperCase();
  if (!symbol) {
    showToast('Please enter a stock symbol', 'error');
    return;
  }

  if (AppState.watchlist.includes(symbol)) {
    showToast(`${symbol} is already in your watchlist`, 'error');
    return;
  }

  AppState.watchlist.push(symbol);
  saveToStorage('watchlist', AppState.watchlist);
  showToast(`${symbol} added to watchlist`, 'success');
  input.value = '';
  updateWatchlistDisplay();
}

function updateWatchlistDisplay() {
  const container = document.getElementById('watchlistContainer');
  if (!container) return;

  if (AppState.watchlist.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>Your watchlist is empty. Add stocks to start tracking.</p></div>';
    return;
  }

  container.innerHTML = AppState.watchlist.map(symbol => `
    <div class="mover-item" style="margin-bottom: 0.5rem;">
      <div>
        <div class="mover-symbol">${symbol}</div>
        <div class="mover-price">NSE</div>
      </div>
      <button onclick="removeFromWatchlist('${symbol}')" class="btn btn-danger btn-sm">Remove</button>
    </div>
  `).join('');
}

function removeFromWatchlist(symbol) {
  AppState.watchlist = AppState.watchlist.filter(s => s !== symbol);
  saveToStorage('watchlist', AppState.watchlist);
  showToast(`${symbol} removed from watchlist`, 'info');
  updateWatchlistDisplay();
}

// Alert Functions
function loadAlerts() {
  updateAlertsDisplay();
}

function createAlert(event) {
  event.preventDefault();

  const symbol = document.getElementById('alertSymbol').value.toUpperCase();
  const condition = document.getElementById('alertCondition').value;
  const value = parseFloat(document.getElementById('alertValue').value);

  if (!symbol || !value) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  const alert = {
    id: Date.now().toString(),
    symbol,
    condition,
    value,
    createdAt: new Date().toISOString(),
    isActive: true,
  };

  AppState.alerts.push(alert);
  saveToStorage('alerts', AppState.alerts);
  showToast('Alert created successfully', 'success');

  event.target.reset();
  updateAlertsDisplay();
}

function updateAlertsDisplay() {
  const container = document.getElementById('alertsList');
  if (!container) return;

  if (AppState.alerts.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No active alerts. Create one to get notified.</p></div>';
    return;
  }

  container.innerHTML = AppState.alerts.map(alert => `
    <div class="insight-item" style="margin-bottom: 1rem;">
      <span class="insight-icon">🔔</span>
      <div class="insight-content">
        <h5>${alert.symbol} - ${alert.condition}</h5>
        <p>Value: ${alert.value}</p>
      </div>
      <button onclick="deleteAlert('${alert.id}')" class="btn btn-danger btn-sm">Delete</button>
    </div>
  `).join('');
}

function deleteAlert(id) {
  AppState.alerts = AppState.alerts.filter(a => a.id !== id);
  saveToStorage('alerts', AppState.alerts);
  showToast('Alert deleted', 'info');
  updateAlertsDisplay();
}

// Settings Functions
function saveSettings() {
  const name = document.getElementById('settingsName').value;
  const email = document.getElementById('settingsEmail').value;

  if (!name || !email) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  AppState.user.name = name;
  AppState.user.email = email;

  saveToStorage('current_user', AppState.user);
  updateUserInfo();
  showToast('Settings saved successfully', 'success');
}

// Utility Functions
function formatCurrency(value) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(2)}K`;
  }
  return `₹${Math.abs(value).toFixed(2)}`;
}

function formatPercent(value) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span style="font-size: 1.25rem;">${icons[type] || 'ℹ'}</span>
    <div class="toast-content">
      <div class="toast-title">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slide-in-right 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function refreshData() {
  const icon = document.getElementById('refreshIcon');
  if (icon) {
    icon.classList.add('spinning');
  }

  showToast('Refreshing data...', 'info');

  setTimeout(() => {
    if (icon) {
      icon.classList.remove('spinning');
    }
    refreshDashboard();
    showToast('Data refreshed successfully', 'success');
  }, 1500);
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('active');
  }
}

function toggleMobileMenu() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.toggle('active');
  }
}

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  showToast('Theme updated', 'info');
}
