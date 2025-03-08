/**
 * colors.js - Simple color palette cycling for bitUI
 * 
 * Features:
 * - Cycle through color variations when button is clicked
 * - Skip locked colors
 * - Maintain color picker functionality
 * - Load/save colors from localStorage
 */

// Color types we're managing
const COLOR_TYPES = ['danger', 'warning', 'confirm', 'info'];

// Color palettes - variations of the original colors
const COLOR_PALETTES = [
  // Original palette (from bitui.css)
  {
    danger: '#E15554',   // rgba(225, 85, 84, 1)
    warning: '#FFA500',  // rgba(255, 165, 0, 1)
    confirm: '#3BB273',  // rgba(59, 178, 115, 1)
    info: '#4D9DE0'      // rgba(77, 157, 224, 1)
  },
  // Pastel variation
  {
    danger: '#FF9999',
    warning: '#FFCC99',
    confirm: '#99DDBB',
    info: '#99CCFF'
  },
  // Deep variation
  {
    danger: '#CC3333',
    warning: '#E69500',
    confirm: '#2D8A5E',
    info: '#2D6DA9'
  },
  // Muted variation
  {
    danger: '#D47777',
    warning: '#D4A877',
    confirm: '#77D49A',
    info: '#77A8D4'
  }
];

// Current palette index
let currentPaletteIndex = 0;

// Storage key
const STORAGE_KEY = 'bitui-colors';

/**
 * Check if a color is locked
 */
function isColorLocked(type) {
  const lockBtn = document.getElementById(`${type}-lock`);
  return lockBtn && lockBtn.textContent === '🔒';
}

/**
 * Apply a color to CSS and update UI
 */
function applyColor(type, color) {
  // Skip if locked
  if (isColorLocked(type)) return;
  
  // Update CSS variable
  document.documentElement.style.setProperty(`--${type}`, color);
  document.documentElement.style.setProperty(`--${type}-hover`, color);
  
  // Update hex display 
  const hexDisplay = document.getElementById(`${type}-hex`);
  if (hexDisplay) hexDisplay.textContent = color.toUpperCase();

  // Update color input
  const input = document.getElementById(`${type}-input`);
  if (input) input.value = color;
  
  // Save to localStorage
  saveColors();
}

/**
 * Get the hex color
 */
function getHexColor(color) {
  if (!color) return '#000000';
  if (color.startsWith('#')) return color;
  
  // Handle rgb format
  if (color.startsWith('rgb')) {
    const rgbValues = color.match(/\d+/g);
    if (rgbValues && rgbValues.length >= 3) {
      const r = parseInt(rgbValues[0]);
      const g = parseInt(rgbValues[1]);
      const b = parseInt(rgbValues[2]);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }
  
  return '#000000';
}

/**
 * Save colors to localStorage
 */
function saveColors() {
  try {
    const colors = {};
    COLOR_TYPES.forEach(type => {
      const input = document.getElementById(`${type}-input`);
      colors[type] = input ? input.value : '';
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  } catch (e) {
    console.error('Error saving colors:', e);
  }
}

/**
 * Load colors from localStorage
 */
function loadColors() {
  try {
    const savedColors = localStorage.getItem(STORAGE_KEY);
    if (savedColors) {
      const colors = JSON.parse(savedColors);
      Object.entries(colors).forEach(([type, color]) => {
        if (COLOR_TYPES.includes(type) && color) {
          // Apply directly, bypass lock check
          document.documentElement.style.setProperty(`--${type}`, color);
          document.documentElement.style.setProperty(`--${type}-hover`, color);
          
          const input = document.getElementById(`${type}-input`);
          if (input) input.value = color;
          
          const hexDisplay = document.getElementById(`${type}-hex`);
          if (hexDisplay) hexDisplay.textContent = color.toUpperCase();
        }
      });
      return true;
    }
  } catch (e) {
    console.error('Error loading colors:', e);
  }
  return false;
}

/**
 * Handle color cycling button
 */
function cycleColors() {
  // Move to next palette
  currentPaletteIndex = (currentPaletteIndex + 1) % COLOR_PALETTES.length;
  const newPalette = COLOR_PALETTES[currentPaletteIndex];
  
  // Apply each color (skipping locked ones)
  COLOR_TYPES.forEach(type => {
    applyColor(type, newPalette[type]);
  });
}

/**
 * Initialize color functionality
 */
export function initColorCycler() {
  // Setup color pickers
  COLOR_TYPES.forEach(type => {
    const input = document.getElementById(`${type}-input`);
    if (input) {
      // Ensure inputs are never disabled
      input.removeAttribute('disabled');
      
      // Set up event listener
      input.addEventListener('input', () => {
        applyColor(type, input.value);
      });
    }
  });
  
  // Setup lock buttons
  COLOR_TYPES.forEach(type => {
    const lockBtn = document.getElementById(`${type}-lock`);
    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        // Toggle emoji
        const isLocked = lockBtn.textContent === '🔒';
        lockBtn.textContent = isLocked ? '🔓' : '🔒';
      });
    }
  });
  
  // Setup cycle button
  const cycleButton = document.getElementById('cycleButton');
  if (cycleButton) {
    cycleButton.addEventListener('click', cycleColors);
  }
  
  // Load colors from localStorage or set defaults
  if (!loadColors()) {
    // Apply the first palette as default
    COLOR_TYPES.forEach(type => {
      applyColor(type, COLOR_PALETTES[0][type]);
    });
  }
  
  // Use a MutationObserver to prevent the disabled attribute
  COLOR_TYPES.forEach(type => {
    const input = document.getElementById(`${type}-input`);
    if (input) {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'disabled') {
            input.removeAttribute('disabled');
          }
        });
      });
      
      observer.observe(input, { attributes: true });
    }
  });
}