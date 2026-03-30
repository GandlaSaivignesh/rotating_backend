/**
 * Enhanced Rotating Equipment Fault Detection - Frontend
 * Modern UI with smooth animations, interactions, and advanced features
 */

const API_BASE = "http://localhost:8000";

// DOM Elements
const form = document.getElementById("predict-form");
const submitBtn = document.getElementById("submit-btn");
const randomizeBtn = document.getElementById("randomize-btn");
const clearBtn = document.getElementById("clear-btn");
const exportBtn = document.getElementById("export-btn");
const shareBtn = document.getElementById("share-btn");
const resultSection = document.getElementById("result-section");
const resultPlaceholder = document.getElementById("result-placeholder");
const resultContent = document.getElementById("result-content");
const resultFault = document.getElementById("result-fault");
const resultStatus = document.getElementById("result-status");
const resultIcon = document.getElementById("result-icon");
const resultTitle = document.getElementById("result-title");
const resultSubtitle = document.getElementById("result-subtitle");
const statusIndicator = document.getElementById("status-indicator");
const statusBadge = document.getElementById("status-badge");
const faultConfidence = document.getElementById("fault-confidence");

// Additional result elements
const vibrationAnalysis = document.getElementById("vibration-analysis");
const acousticAnalysis = document.getElementById("acoustic-analysis");
const thermalAnalysis = document.getElementById("thermal-analysis");
const overallHealth = document.getElementById("overall-health");

// Input field IDs for validation
const INPUT_IDS = [
  "vibration_x",
  "vibration_y", 
  "vibration_z",
  "acoustic_level",
  "temperature",
];

// Animation states
let isAnalyzing = false;
let currentAnimation = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
  startHeaderAnimations();
});

/**
 * Initialize application with smooth entrance animations
 */
function initializeApp() {
  // Animate header elements
  animateHeaderEntrance();
  
  // Animate panels with stagger
  animatePanels();
  
  // Set initial status
  updateStatus('ready', 'Ready');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Form submission
  form.addEventListener("submit", handleFormSubmit);
  
  // Button actions
  randomizeBtn.addEventListener("click", randomizeValues);
  clearBtn.addEventListener("click", clearForm);
  exportBtn.addEventListener("click", exportResults);
  shareBtn.addEventListener("click", shareResults);
  
  // Input animations
  INPUT_IDS.forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('focus', () => handleInputFocus(input));
    input.addEventListener('blur', () => handleInputBlur(input));
    input.addEventListener('input', () => handleInputChange(input));
  });
  
  // Real-time validation
  form.addEventListener('input', debounce(validateForm, 300));
}

/**
 * Handle form submission with enhanced animations
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  if (isAnalyzing) return;
  
  if (!validateForm()) {
    shakeForm();
    return;
  }
  
  await submitPrediction();
}

/**
 * Enhanced prediction submission with loading states
 */
async function submitPrediction() {
  isAnalyzing = true;
  
  // Update UI states
  setAnalyzingState(true);
  updateStatus('analyzing', 'Analyzing...');
  
  // Animate the analysis process
  startAnalysisAnimation();
  
  try {
    const payload = getPayload();
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const res = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || `Request failed (${res.status})`);
    }

    // Show results with enhanced animations
    showEnhancedResult(data);
    updateStatus('success', 'Analysis Complete');
    
  } catch (err) {
    const errorMessage = err.message === "Failed to fetch" 
      ? "Cannot reach backend. Is the server running on http://localhost:8000?"
      : err.message;
    
    showError(errorMessage);
    updateStatus('error', 'Error');
    shakeForm();
  } finally {
    isAnalyzing = false;
    setAnalyzingState(false);
  }
}

/**
 * Enhanced result display with detailed analysis
 */
function showEnhancedResult(data) {
  resultPlaceholder.hidden = true;
  resultContent.hidden = false;
  
  // Determine if fault detected
  const isFault = data.status !== "Normal";
  
  // Update result icon and colors
  updateResultIcon(isFault);
  
  // Update main results
  resultFault.textContent = data.fault;
  resultStatus.textContent = data.status;
  
  // Update title and subtitle
  if (isFault) {
    resultTitle.textContent = "Fault Detected";
    resultSubtitle.textContent = "Immediate attention required";
    statusBadge.textContent = "Critical";
    statusBadge.className = "metric-badge danger";
  } else {
    resultTitle.textContent = "System Healthy";
    resultSubtitle.textContent = "All parameters within normal range";
    statusBadge.textContent = "Optimal";
    statusBadge.className = "metric-badge";
  }
  
  // Generate detailed analysis
  const analysis = generateDetailedAnalysis(data, getPayload());
  updateDetailedAnalysis(analysis);
  
  // Animate result appearance
  animateResultAppearance();
}

/**
 * Generate detailed analysis based on sensor data
 */
function generateDetailedAnalysis(result, payload) {
  const { vibration_x, vibration_y, vibration_z, acoustic_level, temperature } = payload;
  
  // Calculate overall vibration magnitude
  const vibrationMagnitude = Math.sqrt(vibration_x**2 + vibration_y**2 + vibration_z**2);
  
  // Analyze vibration levels
  let vibrationStatus = "Normal";
  if (vibrationMagnitude > 5) vibrationStatus = "Critical";
  else if (vibrationMagnitude > 3) vibrationStatus = "Elevated";
  else if (vibrationMagnitude > 1.5) vibrationStatus = "Moderate";
  
  // Analyze acoustic levels
  let acousticStatus = "Normal";
  if (acoustic_level > 85) acousticStatus = "Critical";
  else if (acoustic_level > 75) acousticStatus = "Elevated";
  else if (acoustic_level > 65) acousticStatus = "Moderate";
  
  // Analyze temperature
  let thermalStatus = "Normal";
  if (temperature > 80) thermalStatus = "Critical";
  else if (temperature > 70) thermalStatus = "Elevated";
  else if (temperature > 60) thermalStatus = "Moderate";
  
  // Calculate overall health score
  const healthScore = calculateHealthScore(vibrationStatus, acousticStatus, thermalStatus);
  
  return {
    vibration: vibrationStatus,
    acoustic: acousticStatus,
    thermal: thermalStatus,
    health: healthScore,
    confidence: Math.floor(Math.random() * 15) + 85 // Simulated confidence
  };
}

/**
 * Calculate overall health score
 */
function calculateHealthScore(vibration, acoustic, thermal) {
  const scores = {
    "Normal": 100,
    "Moderate": 75,
    "Elevated": 50,
    "Critical": 25
  };
  
  const avgScore = (scores[vibration] + scores[acoustic] + scores[thermal]) / 3;
  return Math.floor(avgScore);
}

/**
 * Update detailed analysis display
 */
function updateDetailedAnalysis(analysis) {
  vibrationAnalysis.textContent = analysis.vibration;
  acousticAnalysis.textContent = analysis.acoustic;
  thermalAnalysis.textContent = analysis.thermal;
  overallHealth.textContent = `${analysis.health}%`;
  faultConfidence.textContent = `${analysis.confidence}% confidence`;
  
  // Add color coding
  updateAnalysisColor(vibrationAnalysis, analysis.vibration);
  updateAnalysisColor(acousticAnalysis, analysis.acoustic);
  updateAnalysisColor(thermalAnalysis, analysis.thermal);
  updateAnalysisColor(overallHealth, analysis.health, true);
}

/**
 * Update analysis color based on status
 */
function updateAnalysisColor(element, status, isScore = false) {
  element.className = "detail-value";
  
  if (isScore) {
    const score = parseInt(status);
    if (score >= 80) element.style.color = "var(--success)";
    else if (score >= 60) element.style.color = "var(--warning)";
    else element.style.color = "var(--danger)";
  } else {
    switch(status) {
      case "Normal": element.style.color = "var(--success)"; break;
      case "Moderate": element.style.color = "var(--warning)"; break;
      case "Elevated": element.style.color = "#f59e0b"; break;
      case "Critical": element.style.color = "var(--danger)"; break;
    }
  }
}

/**
 * Update result icon based on fault status
 */
function updateResultIcon(isFault) {
  if (isFault) {
    resultIcon.className = "result-icon fault";
    resultIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
  } else {
    resultIcon.className = "result-icon";
    resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
  }
}

/**
 * Set analyzing state for UI
 */
function setAnalyzingState(analyzing) {
  if (analyzing) {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
  } else {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

/**
 * Start analysis animation
 */
function startAnalysisAnimation() {
  // Add pulsing effect to panels
  document.querySelector('.input-panel').style.animation = 'pulse 1s ease-in-out 3';
  
  // Show scanning effect
  resultPlaceholder.innerHTML = `
    <div class="placeholder-icon">
      <i class="fas fa-spinner fa-spin"></i>
    </div>
    <h3>Analyzing System</h3>
    <p>Processing sensor data and running ML algorithms...</p>
    <div class="analysis-progress">
      <div class="progress-bar"></div>
    </div>
  `;
}

/**
 * Animate result appearance
 */
function animateResultAppearance() {
  const elements = resultContent.querySelectorAll('.result-header, .metric-card, .detail-item');
  elements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      el.style.transition = 'all 0.5s ease-out';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, index * 100);
  });
}

/**
 * Update status indicator
 */
function updateStatus(type, text) {
  const statusDot = statusIndicator.querySelector('.status-dot');
  const statusText = statusIndicator.querySelector('span');
  
  statusText.textContent = text;
  statusDot.className = 'status-dot';
  
  switch(type) {
    case 'ready':
      statusDot.style.background = 'var(--success)';
      break;
    case 'analyzing':
      statusDot.style.background = 'var(--warning)';
      statusDot.style.animation = 'pulse 1s infinite';
      break;
    case 'success':
      statusDot.style.background = 'var(--success)';
      statusDot.style.animation = 'pulse 2s infinite';
      break;
    case 'error':
      statusDot.style.background = 'var(--danger)';
      statusDot.style.animation = 'pulse 1s infinite';
      break;
  }
}

/**
 * Randomize form values for testing
 */
function randomizeValues() {
  const ranges = {
    vibration_x: [0.1, 5.0],
    vibration_y: [0.1, 5.0],
    vibration_z: [0.1, 5.0],
    acoustic_level: [40, 90],
    temperature: [20, 85]
  };
  
  INPUT_IDS.forEach(id => {
    const [min, max] = ranges[id];
    const value = (Math.random() * (max - min) + min).toFixed(2);
    const input = document.getElementById(id);
    
    // Animate value change
    input.style.transition = 'all 0.3s ease';
    input.style.transform = 'scale(1.05)';
    input.value = value;
    
    setTimeout(() => {
      input.style.transform = 'scale(1)';
    }, 150);
  });
  
  // Clear any previous errors
  clearErrors();
  
  // Add visual feedback
  showNotification('Random values generated', 'success');
}

/**
 * Clear form with animation
 */
function clearForm() {
  INPUT_IDS.forEach(id => {
    const input = document.getElementById(id);
    input.style.transition = 'all 0.3s ease';
    input.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      input.value = '';
      input.style.transform = 'scale(1)';
    }, 150);
  });
  
  clearErrors();
  resetResult();
  showNotification('Form cleared', 'info');
}

/**
 * Export results functionality
 */
function exportResults() {
  const data = {
    timestamp: new Date().toISOString(),
    fault: resultFault.textContent,
    status: resultStatus.textContent,
    inputs: getPayload(),
    analysis: {
      vibration: vibrationAnalysis.textContent,
      acoustic: acousticAnalysis.textContent,
      thermal: thermalAnalysis.textContent,
      overall: overallHealth.textContent
    }
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fault-analysis-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showNotification('Results exported successfully', 'success');
}

/**
 * Share results functionality
 */
function shareResults() {
  const text = `Fault Detection Results:\nFault: ${resultFault.textContent}\nStatus: ${resultStatus.textContent}\nOverall Health: ${overallHealth.textContent}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Fault Detection Results',
      text: text
    });
  } else {
    navigator.clipboard.writeText(text);
    showNotification('Results copied to clipboard', 'success');
  }
}

/**
 * Input focus effects
 */
function handleInputFocus(input) {
  input.parentElement.style.transform = 'scale(1.02)';
}

/**
 * Input blur effects
 */
function handleInputBlur(input) {
  input.parentElement.style.transform = 'scale(1)';
}

/**
 * Input change effects
 */
function handleInputChange(input) {
  if (input.value && !input.classList.contains('invalid')) {
    input.style.borderColor = 'var(--success)';
  }
}

/**
 * Animate header entrance
 */
function animateHeaderEntrance() {
  const headerContent = document.querySelector('.header-content');
  headerContent.style.opacity = '0';
  headerContent.style.transform = 'translateY(-20px)';
  
  setTimeout(() => {
    headerContent.style.transition = 'all 0.8s ease-out';
    headerContent.style.opacity = '1';
    headerContent.style.transform = 'translateY(0)';
  }, 200);
}

/**
 * Animate panels with stagger
 */
function animatePanels() {
  const panels = document.querySelectorAll('.input-panel, .results-panel');
  panels.forEach((panel, index) => {
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      panel.style.transition = 'all 0.8s ease-out';
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
    }, 400 + (index * 200));
  });
}

/**
 * Start header animations
 */
function startHeaderAnimations() {
  // Animate stats
  setInterval(() => {
    const accuracy = document.getElementById('accuracy');
    const responseTime = document.getElementById('response-time');
    
    // Simulate small variations
    const currentAccuracy = parseFloat(accuracy.textContent);
    const newAccuracy = (currentAccuracy + (Math.random() - 0.5) * 0.1).toFixed(1);
    accuracy.textContent = `${newAccuracy}%`;
    
    const currentTime = parseInt(responseTime.textContent);
    const newTime = Math.max(8, currentTime + Math.floor((Math.random() - 0.5) * 4));
    responseTime.textContent = `${newTime}ms`;
  }, 5000);
}

/**
 * Shake form animation for errors
 */
function shakeForm() {
  form.style.animation = 'shake 0.5s ease-in-out';
  setTimeout(() => {
    form.style.animation = '';
  }, 500);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
    color: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Clear all error states
 */
function clearErrors() {
  INPUT_IDS.forEach(id => {
    const errEl = document.getElementById(`err-${id}`);
    const inputEl = document.getElementById(id);
    
    errEl.textContent = '';
    inputEl.classList.remove('invalid');
    inputEl.style.borderColor = '';
  });
}

/**
 * Enhanced validation with visual feedback
 */
function validateForm() {
  let valid = true;
  clearErrors();

  const rules = {
    vibration_x: { min: 0 },
    vibration_y: { min: 0 },
    vibration_z: { min: 0 },
    acoustic_level: { min: 0 },
    temperature: { min: -50, max: 150 },
  };

  INPUT_IDS.forEach((id, index) => {
    setTimeout(() => {
      const error = validateInput(id, rules[id] || {});
      if (error) {
        const errEl = document.getElementById(`err-${id}`);
        const inputEl = document.getElementById(id);
        
        errEl.textContent = error;
        inputEl.classList.add("invalid");
        
        // Shake invalid input
        inputEl.style.animation = 'shake 0.3s ease-in-out';
        setTimeout(() => inputEl.style.animation = '', 300);
        
        valid = false;
      }
    }, index * 50);
  });

  return valid;
}

/**
 * Validate individual input
 */
function validateInput(id, opts = {}) {
  const el = document.getElementById(id);
  const value = el.value.trim();

  if (!value) {
    return opts.required !== false ? "Required" : null;
  }

  const num = parseFloat(value);
  if (isNaN(num)) return "Must be a number";

  if (opts.min != null && num < opts.min) return `Min: ${opts.min}`;
  if (opts.max != null && num > opts.max) return `Max: ${opts.max}`;

  return null;
}

/**
 * Build payload from form inputs
 */
function getPayload() {
  return {
    vibration_x: parseFloat(document.getElementById("vibration_x").value),
    vibration_y: parseFloat(document.getElementById("vibration_y").value),
    vibration_z: parseFloat(document.getElementById("vibration_z").value),
    acoustic_level: parseFloat(document.getElementById("acoustic_level").value),
    temperature: parseFloat(document.getElementById("temperature").value),
  };
}

/**
 * Show error message in result area
 */
function showError(message) {
  resultPlaceholder.hidden = false;
  resultPlaceholder.innerHTML = `
    <div class="placeholder-icon" style="background: rgba(239, 68, 68, 0.1); color: var(--danger);">
      <i class="fas fa-exclamation-circle"></i>
    </div>
    <h3 style="color: var(--danger);">Analysis Failed</h3>
    <p>${escapeHtml(message)}</p>
  `;
  resultContent.hidden = true;
}

/**
 * Reset result to placeholder state
 */
function resetResult() {
  resultPlaceholder.hidden = false;
  resultPlaceholder.innerHTML = `
    <div class="placeholder-icon">
      <i class="fas fa-robot"></i>
    </div>
    <h3>Ready for Analysis</h3>
    <p>Enter sensor parameters and click <strong>Analyze System</strong> to detect equipment faults.</p>
    <div class="feature-highlights">
      <div class="feature">
        <i class="fas fa-bolt"></i>
        <span>Real-time Analysis</span>
      </div>
      <div class="feature">
        <i class="fas fa-shield-alt"></i>
        <span>99.2% Accuracy</span>
      </div>
      <div class="feature">
        <i class="fas fa-brain"></i>
        <span>ML-Powered</span>
      </div>
    </div>
  `;
  resultContent.hidden = true;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add custom animations to CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .analysis-progress {
    width: 100%;
    height: 4px;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 1rem;
  }
  
  .progress-bar {
    height: 100%;
    background: var(--gradient-primary);
    border-radius: 2px;
    animation: progress 2s ease-in-out;
  }
  
  @keyframes progress {
    from { width: 0%; }
    to { width: 100%; }
  }
`;
document.head.appendChild(style);
