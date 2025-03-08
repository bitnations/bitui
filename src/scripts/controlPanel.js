/**
 * Initializes the theme mode control
 */
function initThemeControls() {
  const themeControl = document.getElementById('theme-mode');
  const themeValueDisplay = document.getElementById('theme-mode-value');
  
  if (themeControl) {
    themeControl.addEventListener('input', () => {
      const value = parseInt(themeControl.value);
      let themeName = 'Light';
      
      // Set theme based on slider value
      if (value < 25) {
        document.documentElement.dataset.theme = 'light';
        themeName = 'Light';
      } else if (value < 50) {
        document.documentElement.dataset.theme = 'warm';
        themeName = 'Warm';
      } else if (value < 75) {
        document.documentElement.dataset.theme = 'dim';
        themeName = 'Dim';
      } else {
        document.documentElement.dataset.theme = 'dark';
        themeName = 'Dark';
      }
      
      if (themeValueDisplay) {
        themeValueDisplay.textContent = themeName;
      }
      
      // Dispatch custom event for theme change
      document.dispatchEvent(new CustomEvent('themeChanged'));
    });
  }
} 

// Control Panel Loader and Handler
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load the control panel template
  await loadControlPanel();
  
  // 2. Initialize control panel functionality
  initControlPanel();
});

/**
 * Loads the control panel template from src/templates/control_panel.html
 * and injects it into the body of the current page
 */
async function loadControlPanel() {
  try {
    // Fetch the control panel template
    const response = await fetch('/src/templates/control_panel.html');
    if (!response.ok) {
      throw new Error(`Failed to load control panel: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract just the control panel div from the template
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const controlPanel = doc.querySelector('.control-panel');
    
    if (!controlPanel) {
      throw new Error('Control panel element not found in template');
    }
    
    // Inject the control panel into the current page
    document.body.appendChild(controlPanel);
    
    console.log('Control panel loaded successfully');
  } catch (error) {
    console.error('Error loading control panel:', error);
  }
}

/**
 * Initializes all control panel functionality
 */
function initControlPanel() {
  // Add a small delay to ensure DOM elements are fully loaded
  setTimeout(() => {
    // Initialize toggle panel functionality
    initTogglePanel();
    
    // Initialize style controls
    initStyleControls();
    
    // Initialize theme controls
    initThemeControls();
    
    // Initialize color controls
    initColorControls();
    
    // Initialize buttons
    initButtons();
  }, 100);
}

/**
 * Initializes the toggle panel button functionality
 */
function initTogglePanel() {
  const toggleBtn = document.getElementById('togglePanel');
  const controlPanel = document.getElementById('controlPanel');
  const toggleIcon = document.querySelector('.toggle-icon');
  
  if (toggleBtn && controlPanel) {
    toggleBtn.addEventListener('click', () => {
      controlPanel.classList.toggle('collapsed');
      
      // Update the toggle icon
      if (controlPanel.classList.contains('collapsed')) {
        toggleIcon.textContent = '‹';
      } else {
        toggleIcon.textContent = '›';
      }
    });
    
    // Make sure the CSS class is properly applied
    // Add this line to ensure the CSS for collapsed state exists
    console.log('Toggle panel initialized');
  } else {
    console.error('Toggle button or control panel not found');
  }
}

/**
 * Initializes the style controls (border radius, column gap, font size)
 */
function initStyleControls() {
  const styleControls = document.querySelectorAll('.style-control');
  
  styleControls.forEach(control => {
    const property = control.dataset.styleProperty;
    const unit = control.dataset.unit || '';
    const valueDisplay = document.getElementById(`${control.id}-value`);
    
    // Set initial value
    updateStyleProperty(property, control.value + unit);
    
    // Update on change
    control.addEventListener('input', () => {
      const value = control.value + unit;
      updateStyleProperty(property, value);
      
      if (valueDisplay) {
        valueDisplay.textContent = value;
      }
    });
  });
}

/**
 * Updates a CSS custom property on the document root element
 */
function updateStyleProperty(property, value) {
  if (property && value) {
    document.documentElement.style.setProperty(property, value);
  }
}

/**
 * Initializes the theme mode control
 */
function initThemeControls() {
  const themeControl = document.getElementById('theme-mode');
  const themeValueDisplay = document.getElementById('theme-mode-value');
  
  if (themeControl) {
    themeControl.addEventListener('input', () => {
      const value = parseInt(themeControl.value);
      let themeName = 'Light';
      
      // Set theme based on slider value
      if (value < 25) {
        document.documentElement.dataset.theme = 'light';
        themeName = 'Light';
      } else if (value < 50) {
        document.documentElement.dataset.theme = 'warm';
        themeName = 'Warm';
      } else if (value < 75) {
        document.documentElement.dataset.theme = 'dim';
        themeName = 'Dim';
      } else {
        document.documentElement.dataset.theme = 'dark';
        themeName = 'Dark';
      }
      
      if (themeValueDisplay) {
        themeValueDisplay.textContent = themeName;
      }
    });
  }
}

/**
 * Initializes the color controls
 */
function initColorControls() {
  const colorTypes = ['danger', 'warning', 'confirm', 'info'];
  
  colorTypes.forEach(type => {
    const input = document.getElementById(`${type}-input`);
    const hexDisplay = document.getElementById(`${type}-hex`);
    const lockBtn = document.getElementById(`${type}-lock`);
    
    if (input && hexDisplay) {
      // Get current color from CSS
      const currentColor = getComputedStyle(document.documentElement)
        .getPropertyValue(`--color-${type}`).trim();
      
      // Set initial color input value
      if (currentColor) {
        input.value = convertCssColorToHex(currentColor);
        hexDisplay.textContent = input.value.toUpperCase();
      }
      
      // Update color on change
      input.addEventListener('input', () => {
        document.documentElement.style.setProperty(`--color-${type}`, input.value);
        hexDisplay.textContent = input.value.toUpperCase();
      });
      
      // Handle lock button
      if (lockBtn) {
        lockBtn.addEventListener('click', () => {
          const isLocked = lockBtn.textContent === '🔒';
          lockBtn.textContent = isLocked ? '🔓' : '🔒';
        });
      }
      
      // Add click-to-copy functionality for hex values
      if (hexDisplay) {
        hexDisplay.style.cursor = 'pointer'; // Show pointer cursor on hover
        hexDisplay.title = 'Click to copy'; // Add tooltip
        
        hexDisplay.addEventListener('click', () => {
          // Get the hex value
          const hexValue = hexDisplay.textContent;
          
          // Copy to clipboard
          navigator.clipboard.writeText(hexValue)
            .then(() => {
              // Show brief visual feedback
              const originalText = hexDisplay.textContent;
              hexDisplay.textContent = 'Copied!';
              
              // Restore original text after a short delay
              setTimeout(() => {
                hexDisplay.textContent = originalText;
              }, 1000);
            })
            .catch(err => {
              console.error('Failed to copy: ', err);
            });
        });
      }
    }
  });
  
  // Initialize color cycle button
  const cycleButton = document.getElementById('cycleButton');
  if (cycleButton) {
    cycleButton.addEventListener('click', cycleColors);
  }
}

/**
 * Converts a CSS color value to hex format
 */
function convertCssColorToHex(color) {
  // Handle rgb/rgba format
  if (color.startsWith('rgb')) {
    const rgbValues = color.match(/\d+/g);
    if (rgbValues && rgbValues.length >= 3) {
      const r = parseInt(rgbValues[0]);
      const g = parseInt(rgbValues[1]);
      const b = parseInt(rgbValues[2]);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }
  
  // If already hex or other format, return as is
  return color;
}

/**
 * Cycles through color schemes
 */
function cycleColors() {
  const colorSchemes = [
    { danger: '#FF0000', warning: '#FF9800', confirm: '#4CAF50', info: '#2196F3' }, // Default
    { danger: '#E91E63', warning: '#9C27B0', confirm: '#3F51B5', info: '#00BCD4' }, // Cool
    { danger: '#FF5722', warning: '#FFC107', confirm: '#8BC34A', info: '#03A9F4' }, // Warm
    { danger: '#795548', warning: '#9E9E9E', confirm: '#607D8B', info: '#00BCD4' }  // Muted
  ];
  
  // Get current scheme index or start with 0
  let currentIndex = parseInt(localStorage.getItem('colorSchemeIndex') || '0');
  currentIndex = (currentIndex + 1) % colorSchemes.length;
  
  // Apply new color scheme
  const newScheme = colorSchemes[currentIndex];
  Object.entries(newScheme).forEach(([type, color]) => {
    // Check if color is locked by looking at the lock emoji
    const lockBtn = document.getElementById(`${type}-lock`);
    const isLocked = lockBtn && lockBtn.textContent === '🔒';
    
    // Skip locked colors
    if (isLocked) return;
    
    document.documentElement.style.setProperty(`--color-${type}`, color);
    
    // Update input and display
    const input = document.getElementById(`${type}-input`);
    const hexDisplay = document.getElementById(`${type}-hex`);
    
    if (input) {
      input.value = color;
    }
    
    if (hexDisplay) {
      hexDisplay.textContent = color.toUpperCase();
    }
  });
  
  // Save current index
  localStorage.setItem('colorSchemeIndex', currentIndex.toString());
}

/**
 * Initializes the control panel buttons
 */
function initButtons() {
  // Download CSS button - using the function from download.js
  const downloadBtn = document.getElementById('download-css');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      // Call the downloadCSS function from download.js
      if (typeof window.downloadCSS === 'function') {
        window.downloadCSS();
      } else {
        console.error('downloadCSS function not found. Make sure download.js is loaded.');
      }
    });
  }
  
  // Reset defaults button
  const resetBtn = document.getElementById('reset-defaults');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetDefaults);
  }
}

/**
 * Resets all styles to default values
 */
function resetDefaults() {
  if (confirm('Reset all styles to default values?')) {
    // Clear all custom properties set on the document
    const styles = document.documentElement.style;
    for (let i = styles.length - 1; i >= 0; i--) {
      const prop = styles[i];
      if (prop.startsWith('--')) {
        styles.removeProperty(prop);
      }
    }
    
    // Reset theme
    document.documentElement.dataset.theme = 'light';
    
    // Reset controls to default values
    document.querySelectorAll('.style-control').forEach(control => {
      control.value = control.defaultValue;
      const valueDisplay = document.getElementById(`${control.id}-value`);
      if (valueDisplay) {
        valueDisplay.textContent = control.value + (control.dataset.unit || '');
      }
    });
    
    // Reset theme mode slider and display
    const themeControl = document.getElementById('theme-mode');
    const themeValueDisplay = document.getElementById('theme-mode-value');
    if (themeControl) {
      themeControl.value = 0;
    }
    if (themeValueDisplay) {
      themeValueDisplay.textContent = 'Light';
    }
    
    // Reset color inputs
    const colorTypes = ['danger', 'warning', 'confirm', 'info'];
    const defaultColors = {
      danger: '#FF0000',
      warning: '#FF9800',
      confirm: '#4CAF50',
      info: '#2196F3'
    };
    
    colorTypes.forEach(type => {
      const input = document.getElementById(`${type}-input`);
      const hexDisplay = document.getElementById(`${type}-hex`);
      
      if (input) {
        input.value = defaultColors[type];
      }
      
      if (hexDisplay) {
        hexDisplay.textContent = defaultColors[type].toUpperCase();
      }
    });
    
    // Reset color scheme index
    localStorage.removeItem('colorSchemeIndex');
  }
} 