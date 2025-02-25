function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(Math.min(k(n) - 3, 9 - k(n)), 1));

  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));

  const toHex = x => x.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHex(rgb) {
  if (!rgb || typeof rgb !== 'string') return '#000000'; // Default to black if null/undefined/invalid
  if (rgb.startsWith('#')) return rgb;
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  const [, r, g, b] = match;
  return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
}

const baseHues = {
  error: 0,
  action: 35,
  success: 120,
  info: 210
};

const lockedColors = {
  error: false,
  action: false,
  success: false,
  info: false
};

const colorValues = {
  error: null,
  'error-hover': null,
  action: null,
  'action-hover': null,
  success: null,
  'success-hover': null,
  info: null,
  'info-hover': null
};

const manualColors = {};
let cycleStep = 0;

// Store the base palette for the current cycle step
let currentPalette = null;
// Store the initial palette (before any cycling)
let initialPalette = null;

function cycleHue(baseHue, step) {
  return (baseHue + step) % 360;
}

function generateCycledPalette(step) {
  return {
    error: hslToHex(cycleHue(baseHues.error, step), 50, 50),
    'error-hover': hslToHex(cycleHue(baseHues.error, step), 50, 55),
    action: hslToHex(cycleHue(baseHues.action, step), 50, 50),
    'action-hover': hslToHex(cycleHue(baseHues.action, step), 50, 55),
    success: hslToHex(cycleHue(baseHues.success, step), 50, 50),
    'success-hover': hslToHex(cycleHue(baseHues.success, step), 50, 55),
    info: hslToHex(cycleHue(baseHues.info, step), 50, 50),
    'info-hover': hslToHex(cycleHue(baseHues.info, step), 50, 55)
  };
}

function applyColorsToUI(generatedColors) {
  const hexColors = {};
  Object.entries(generatedColors).forEach(([key, color]) => {
    const hexColor = rgbToHex(color);
    hexColors[key] = hexColor;
    colorValues[key] = hexColor;
    document.documentElement.style.setProperty(`--${key}`, hexColor);
  });

  ['error', 'action', 'success', 'info'].forEach(baseKey => {
    const swatch = document.getElementById(`color-${baseKey}`);
    const input = document.getElementById(`${baseKey}-input`);
    const hexDisplay = document.getElementById(`${baseKey}-hex`);
    const lockBtn = document.getElementById(`${baseKey}-lock`);
    
    if (swatch) {
      swatch.style.backgroundColor = hexColors[baseKey];
      // Determine if text should be white or black based on background color brightness
      const brightness = getBrightness(hexColors[baseKey]);
      swatch.style.color = brightness > 128 ? 'black' : 'white';
    }
    
    if (input) input.value = hexColors[baseKey];
    if (hexDisplay) hexDisplay.textContent = hexColors[baseKey];
    if (lockBtn) lockBtn.textContent = lockedColors[baseKey] ? '🔐' : '🔓';
  });

  localStorage.setItem('bitui-generated-colors', JSON.stringify(hexColors));
}

// Helper function to determine brightness of a color
function getBrightness(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000; // Formula to determine perceived brightness
}

function updatePalette(cycle = false) {
  // Initialize initialPalette if it doesn't exist yet
  if (!initialPalette) {
    initialPalette = generateCycledPalette(0);
  }
  
  // Only regenerate the currentPalette when explicitly cycling
  if (cycle) {
    cycleStep += 20;
    currentPalette = generateCycledPalette(cycleStep);
  } else if (!currentPalette) {
    // If no current palette exists yet, initialize it
    currentPalette = {...initialPalette};
  }
  
  const generatedColors = {};
  
  ['error', 'action', 'success', 'info'].forEach(key => {
    if (manualColors[key]) {
      generatedColors[key] = manualColors[key];
      // Use the improved hover color calculation for manually selected colors
      generatedColors[`${key}-hover`] = createHoverColor(manualColors[key]);
    } else if (lockedColors[key] && colorValues[key]) {
      generatedColors[key] = colorValues[key];
      generatedColors[`${key}-hover`] = colorValues[`${key}-hover`];
    } else {
      generatedColors[key] = currentPalette[key];
      generatedColors[`${key}-hover`] = currentPalette[`${key}-hover`];
    }
  });

  applyColorsToUI(generatedColors);
}

// Improved function to create better hover colors
function createHoverColor(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Convert to HSL
  const [h, s, l] = rgbToHsl(r, g, b);
  
  // For dark colors, make the hover state lighter
  // For light colors, make the hover state slightly darker
  // This ensures better contrast and visibility for hover states
  let newL;
  if (l < 50) {
    // For darker colors, brighten by 10-15%
    newL = Math.min(l + 15, 100);
  } else {
    // For lighter colors, darken slightly or add saturation
    newL = Math.max(l - 5, 0);
  }
  
  // Adjust saturation slightly to make hover state more vibrant
  const newS = Math.min(s + 5, 100);
  
  return hslToHex(h, newS, newL);
}

// Replace the old adjustLightness function with our improved version
function adjustLightness(hex, lightness) {
  return createHoverColor(hex);
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function toggleLock(key) {
  lockedColors[key] = !lockedColors[key];
  
  if (!lockedColors[key]) {
    // If we're unlocking, remove any manual color
    delete manualColors[key];
  } else {
    // If we're locking, save the current value
    manualColors[key] = colorValues[key];
  }
  
  // Just update the UI, don't regenerate colors
  applyColorsToUI({
    error: colorValues.error,
    'error-hover': colorValues['error-hover'],
    action: colorValues.action,
    'action-hover': colorValues['action-hover'],
    success: colorValues.success,
    'success-hover': colorValues['success-hover'],
    info: colorValues.info,
    'info-hover': colorValues['info-hover']
  });
}

function initColorCycler() {
  document.addEventListener("DOMContentLoaded", () => {
    const cycleButton = document.getElementById("cycleButton");
    if (!cycleButton) {
      console.warn("Cycle button not found in the DOM.");
      return;
    }
    cycleButton.addEventListener("click", () => updatePalette(true));

    ['error', 'action', 'success', 'info'].forEach(key => {
      const swatch = document.getElementById(`color-${key}`);
      const input = document.getElementById(`${key}-input`);
      const lockBtn = document.getElementById(`${key}-lock`);

      if (swatch) {
        // Make the swatch clickable to open color picker
        swatch.addEventListener('click', (e) => {
          // Only trigger if not clicking the lock button
          if (e.target !== lockBtn) {
            input.click();
          }
        });
      }

      if (input) {
        // Input is already type="color" from HTML
        input.addEventListener('input', (e) => {
          const hex = e.target.value.trim();
          if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            manualColors[key] = hex;
            lockedColors[key] = true;
            updatePalette(false);
          }
        });
      }

      if (lockBtn) {
        lockBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent swatch click event
          toggleLock(key);
        });
      }
    });

    const savedColors = localStorage.getItem('bitui-generated-colors');
    if (savedColors) {
      const colors = JSON.parse(savedColors);
      Object.keys(colors).forEach(key => {
        colors[key] = rgbToHex(colors[key]);
        colorValues[key] = colors[key];
      });
      applyColorsToUI(colors);
      
      // Ensure we have a current palette that matches the saved colors
      currentPalette = {
        error: colorValues.error,
        'error-hover': colorValues['error-hover'],
        action: colorValues.action,
        'action-hover': colorValues['action-hover'],
        success: colorValues.success,
        'success-hover': colorValues['success-hover'],
        info: colorValues.info,
        'info-hover': colorValues['info-hover']
      };
    } else {
      updatePalette(false);
    }
  });
}

export { initColorCycler };