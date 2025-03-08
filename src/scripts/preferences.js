/**
 * preferences.js - Applies saved preferences to the UI
 * 
 * This script works with storage.js to load saved preferences
 * and apply them to the page.
 */

// Apply saved preferences to the UI
const applyPreferences = {
  // Apply theme
  applyTheme: () => {
    const theme = window.bitUIStorage.loadTheme();
    if (!theme) return;
    
    // Set theme on document
    document.documentElement.dataset.theme = theme;
    
    // Update theme slider if it exists
    const themeSlider = document.getElementById('theme-mode');
    const themeValueDisplay = document.getElementById('theme-mode-value');
    
    if (themeSlider) {
      // Map theme names to slider values
      const themeValues = {
        'light': 0,
        'warm': 33,
        'dim': 66,
        'dark': 100
      };
      
      themeSlider.value = themeValues[theme] || 0;
      
      if (themeValueDisplay) {
        themeValueDisplay.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
      }
    }
  },
  
  // Apply style values
  applyStyles: () => {
    const styles = window.bitUIStorage.loadStyles();
    if (!styles) return;
    
    // Apply each saved style
    Object.entries(styles).forEach(([property, data]) => {
      const { value, unit } = data;
      
      // Apply to document
      document.documentElement.style.setProperty(property, value + unit);
      
      // Update control if it exists
      const control = document.querySelector(`.style-control[data-style-property="${property}"]`);
      if (control) {
        control.value = value;
        
        // Update value display if it exists
        const valueDisplay = document.getElementById(`${control.id}-value`);
        if (valueDisplay) {
          valueDisplay.textContent = value + unit;
        }
      }
    });
  },
  
  // Apply panel state
  applyPanelState: () => {
    const state = window.bitUIStorage.loadPanelState();
    if (!state) return;
    
    const controlPanel = document.getElementById('controlPanel');
    const toggleIcon = document.querySelector('.toggle-icon');
    
    if (controlPanel) {
      if (state === 'closed') {
        controlPanel.classList.add('collapsed');
        if (toggleIcon) toggleIcon.textContent = '‹';
      } else {
        controlPanel.classList.remove('collapsed');
        if (toggleIcon) toggleIcon.textContent = '›';
      }
    }
  },
  
  // Apply all preferences
  applyAll: () => {
    applyPreferences.applyTheme();
    applyPreferences.applyStyles();
    applyPreferences.applyPanelState();
  }
};

// Apply preferences when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Apply preferences after a small delay to ensure elements are loaded
  setTimeout(applyPreferences.applyAll, 100);
}); 