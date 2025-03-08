// Add this at the top of the file, with other constants
const COLOR_STORAGE_KEY = 'bitui-custom-colors';
const DEFAULT_COLORS = {
  danger: '#FF0000',
  warning: '#FF9800',
  confirm: '#4CAF50',
  info: '#2196F3'
};
const STYLE_STORAGE_KEY = 'bitui-style-settings';
const CONTAINER_STORAGE_KEY = 'bitui-container-settings';

// Essential files list moved to download.js

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
  // First try to load style settings from localStorage
  const stylesLoaded = loadStyleSettings();
  
  const styleControls = document.querySelectorAll('.style-control');
  
  styleControls.forEach(control => {
    // Skip theme control
    if (control.id === 'theme-mode') return;
    
    const property = control.dataset.styleProperty;
    const unit = control.dataset.unit || '';
    const valueDisplay = document.getElementById(`${control.id}-value`);
    
    // If styles weren't loaded from localStorage, set initial value
    if (!stylesLoaded) {
      updateStyleProperty(property, control.value + unit);
      
      if (valueDisplay) {
        valueDisplay.textContent = control.value + unit;
      }
    }
    
    // Update on change
    control.addEventListener('input', () => {
      const value = control.value + unit;
      updateStyleProperty(property, value);
      
      if (valueDisplay) {
        valueDisplay.textContent = value;
      }
      
      // Save to localStorage
      saveStyleSettings();
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
 * Cycles through color schemes without applying to the DOM
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
  
  // Apply new color scheme to the control panel only
  const newScheme = colorSchemes[currentIndex];
  Object.entries(newScheme).forEach(([type, color]) => {
    // Check if color is locked by looking at the lock emoji
    const lockBtn = document.getElementById(`${type}-lock`);
    const isLocked = lockBtn && lockBtn.textContent === '🔒';
    
    // Skip locked colors
    if (isLocked) return;
    
    // Update the color swatch background
    const colorSwatch = document.getElementById(`color-${type}`);
    if (colorSwatch) {
      colorSwatch.style.backgroundColor = color;
    }
    
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
 * Apply colors to the entire DOM
 */
function applyColors() {
  const colorTypes = ['danger', 'warning', 'confirm', 'info'];
  
  // Apply each color from the inputs to the CSS variables
  colorTypes.forEach(type => {
    const input = document.getElementById(`${type}-input`);
    if (input && input.value) {
      // Set the CSS variable with the correct name
      document.documentElement.style.setProperty(`--${type}`, input.value, 'important');
      document.documentElement.style.setProperty(`--${type}-hover`, input.value, 'important');
    }
  });
  
  // Force a repaint to ensure changes take effect
  document.body.style.display = 'none';
  document.body.offsetHeight; // Trigger a reflow
  document.body.style.display = '';
  
  // Save to localStorage
  saveColorsToStorage();
}

/**
 * Reset colors to defaults without confirmation and apply them
 */
function resetColors() {
  const colorTypes = ['danger', 'warning', 'confirm', 'info'];
  
  // Reset color inputs to defaults
  colorTypes.forEach(type => {
    const defaultColor = DEFAULT_COLORS[type];
    
    // Update the color swatch background
    const colorSwatch = document.getElementById(`color-${type}`);
    if (colorSwatch) {
      colorSwatch.style.backgroundColor = defaultColor;
    }
    
    // Update input and display
    const input = document.getElementById(`${type}-input`);
    const hexDisplay = document.getElementById(`${type}-hex`);
    
    if (input) {
      input.value = defaultColor;
    }
    
    if (hexDisplay) {
      hexDisplay.textContent = defaultColor.toUpperCase();
    }
    
    // Set the CSS variable with the correct name
    document.documentElement.style.setProperty(`--${type}`, defaultColor, 'important');
    document.documentElement.style.setProperty(`--${type}-hover`, defaultColor, 'important');
  });
  
  // Force a repaint to ensure changes take effect
  document.body.style.display = 'none';
  document.body.offsetHeight; // Trigger a reflow
  document.body.style.display = '';
  
  // Reset color scheme index and save to localStorage
  localStorage.removeItem('colorSchemeIndex');
  saveColorsToStorage();
}

/**
 * Initializes the color controls
 */
function initColorControls() {
  const colorTypes = ['danger', 'warning', 'confirm', 'info'];
  
  // First try to load colors from localStorage
  const colorsLoaded = loadColorsFromStorage();
  
  colorTypes.forEach(type => {
    const input = document.getElementById(`${type}-input`);
    const hexDisplay = document.getElementById(`${type}-hex`);
    const lockBtn = document.getElementById(`${type}-lock`);
    
    if (input && hexDisplay) {
      // If colors weren't loaded from localStorage, set from CSS or defaults
      if (!colorsLoaded) {
        // Get current color from CSS
        let currentColor = getComputedStyle(document.documentElement)
          .getPropertyValue(`--${type}`).trim();
        
        // Use default if not found
        if (!currentColor) {
          currentColor = DEFAULT_COLORS[type];
          // Set the CSS variable
          document.documentElement.style.setProperty(`--${type}`, currentColor, 'important');
          document.documentElement.style.setProperty(`--${type}-hover`, currentColor, 'important');
        }
        
        // Set initial color input value
        input.value = convertCssColorToHex(currentColor);
        hexDisplay.textContent = input.value.toUpperCase();
      }
      
      // Update color on change (only updates the control panel, not the DOM)
      input.addEventListener('input', () => {
        // Update the color swatch background
        const colorSwatch = document.getElementById(`color-${type}`);
        if (colorSwatch) {
          colorSwatch.style.backgroundColor = input.value;
        }
        
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
  
  // Initialize apply colors button
  const applyButton = document.getElementById('applyButton');
  if (applyButton) {
    applyButton.addEventListener('click', applyColors);
  }
  
  // Initialize reset colors button
  const resetColorsButton = document.getElementById('resetColorsButton');
  if (resetColorsButton) {
    resetColorsButton.addEventListener('click', resetColors);
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
  
  // Download all essential files button
  const downloadAllBtn = document.getElementById('download-all');
  if (downloadAllBtn) {
    if (typeof window.downloadAllFiles === 'function') {
      downloadAllBtn.addEventListener('click', window.downloadAllFiles);
    } else {
      console.error('downloadAllFiles function not found. Make sure download.js is loaded.');
      downloadAllBtn.disabled = true;
      downloadAllBtn.title = 'Download functionality not available';
    }
  }
  
  // Reset defaults button
  const resetBtn = document.getElementById('reset-defaults');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetDefaults);
  }
}

/**
 * Resets style controls to default values without confirmation
 */
function resetDefaults() {
  console.log('Resetting styles to defaults');
  
  // Clear only style-related custom properties
  const styleProperties = ['--border-radius', '--column-gap', '--font-size-base', '--container-width', '--container-padding'];
  styleProperties.forEach(prop => {
    document.documentElement.style.removeProperty(prop);
    console.log(`Removed property: ${prop}`);
  });
  
  // Reset style controls to default values
  document.querySelectorAll('.style-control').forEach(control => {
    // Skip theme control
    if (control.id === 'theme-mode') return;
    
    // Only reset controls with style properties
    if (control.dataset.styleProperty && styleProperties.includes(control.dataset.styleProperty)) {
      control.value = control.defaultValue;
      const valueDisplay = document.getElementById(`${control.id}-value`);
      if (valueDisplay) {
        valueDisplay.textContent = control.value + (control.dataset.unit || '');
      }
      
      // Apply the default value
      const property = control.dataset.styleProperty;
      const unit = control.dataset.unit || '';
      document.documentElement.style.setProperty(property, control.value + unit);
      console.log(`Reset control: ${control.id} to ${control.value}${unit}`);
    }
  });
  
  // Clear style-related localStorage items
  localStorage.removeItem(STYLE_STORAGE_KEY);
  localStorage.removeItem(CONTAINER_STORAGE_KEY);
  console.log('Cleared localStorage items:', STYLE_STORAGE_KEY, CONTAINER_STORAGE_KEY);
  
  // Force save empty settings to ensure they're cleared
  saveStyleSettings();
  
  // Force a repaint to ensure changes take effect
  document.body.style.display = 'none';
  document.body.offsetHeight; // Trigger a reflow
  document.body.style.display = '';
  
  console.log('Reset completed');
}

/**
 * Save current colors to localStorage
 */
function saveColorsToStorage() {
  try {
    const colors = {};
    const colorTypes = ['danger', 'warning', 'confirm', 'info'];
    
    // Get current colors from inputs or CSS variables
    colorTypes.forEach(type => {
      const input = document.getElementById(`${type}-input`);
      if (input && input.value) {
        colors[type] = input.value;
      } else {
        // Fallback to computed style
        const color = getComputedStyle(document.documentElement)
          .getPropertyValue(`--${type}`).trim();
        colors[type] = color || DEFAULT_COLORS[type];
      }
    });
    
    // Save to localStorage
    localStorage.setItem(COLOR_STORAGE_KEY, JSON.stringify(colors));
  } catch (error) {
    console.error('Error saving colors to localStorage:', error);
  }
}

/**
 * Load colors from localStorage
 */
function loadColorsFromStorage() {
  try {
    const savedColors = localStorage.getItem(COLOR_STORAGE_KEY);
    if (savedColors) {
      const colors = JSON.parse(savedColors);
      const colorTypes = ['danger', 'warning', 'confirm', 'info'];
      
      // Apply each color
      colorTypes.forEach(type => {
        if (colors[type]) {
          // Set the CSS variable
          document.documentElement.style.setProperty(`--${type}`, colors[type], 'important');
          document.documentElement.style.setProperty(`--${type}-hover`, colors[type], 'important');
          
          // Update input and display if they exist
          const input = document.getElementById(`${type}-input`);
          const hexDisplay = document.getElementById(`${type}-hex`);
          
          if (input) {
            input.value = colors[type];
          }
          
          if (hexDisplay) {
            hexDisplay.textContent = colors[type].toUpperCase();
          }
        }
      });
      
      return true;
    }
  } catch (error) {
    console.error('Error loading colors from localStorage:', error);
  }
  
  return false;
}

/**
 * Save style settings to localStorage
 */
function saveStyleSettings() {
  try {
    const styles = {};
    const containerSettings = {};
    
    // Get all style controls
    document.querySelectorAll('.style-control').forEach(control => {
      // Skip theme control
      if (control.id === 'theme-mode') return;
      
      const property = control.dataset.styleProperty;
      if (property) {
        const unit = control.dataset.unit || '';
        
        // Separate container settings from other style settings
        if (property.includes('container')) {
          containerSettings[property] = { value: control.value, unit };
        } else {
          styles[property] = { value: control.value, unit };
        }
      }
    });
    
    // Save to localStorage
    localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(styles));
    localStorage.setItem(CONTAINER_STORAGE_KEY, JSON.stringify(containerSettings));
  } catch (error) {
    console.error('Error saving style settings to localStorage:', error);
  }
}

/**
 * Load style settings from localStorage
 */
function loadStyleSettings() {
  try {
    const savedStyles = localStorage.getItem(STYLE_STORAGE_KEY);
    const savedContainerSettings = localStorage.getItem(CONTAINER_STORAGE_KEY);
    let settingsLoaded = false;
    
    if (savedStyles) {
      const styles = JSON.parse(savedStyles);
      
      // Apply each style
      Object.entries(styles).forEach(([property, data]) => {
        const { value, unit } = data;
        
        // Set the CSS variable
        document.documentElement.style.setProperty(property, value + unit);
        
        // Update control if it exists
        const control = document.querySelector(`.style-control[data-style-property="${property}"]`);
        if (control) {
          control.value = value;
          
          // Update value display
          const valueDisplay = document.getElementById(`${control.id}-value`);
          if (valueDisplay) {
            valueDisplay.textContent = value + unit;
          }
        }
      });
      
      settingsLoaded = true;
    }
    
    if (savedContainerSettings) {
      const containerStyles = JSON.parse(savedContainerSettings);
      
      // Apply each container style
      Object.entries(containerStyles).forEach(([property, data]) => {
        const { value, unit } = data;
        
        // Set the CSS variable
        document.documentElement.style.setProperty(property, value + unit);
        
        // Update control if it exists
        const control = document.querySelector(`.style-control[data-style-property="${property}"]`);
        if (control) {
          control.value = value;
          
          // Update value display
          const valueDisplay = document.getElementById(`${control.id}-value`);
          if (valueDisplay) {
            valueDisplay.textContent = value + unit;
          }
        }
      });
      
      settingsLoaded = true;
    }
    
    return settingsLoaded;
  } catch (error) {
    console.error('Error loading style settings from localStorage:', error);
  }
  
  return false;
} 