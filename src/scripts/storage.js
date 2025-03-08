/**
 * storage.js - Simple local storage for BitUI preferences
 * 
 * Provides basic save/load functions for theme, style values, and panel state
 * without manipulating the DOM directly.
 */

// Storage keys
const KEYS = {
  THEME: 'bitui-theme',
  STYLES: 'bitui-styles',
  PANEL_STATE: 'bitui-panel-state'
};

/**
 * Simple localStorage wrapper with error handling
 */
const storage = {
  save: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },
  
  load: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('Storage error:', e);
      return null;
    }
  }
};

/**
 * BitUI Storage API
 */
const bitUIStorage = {
  // Theme storage
  saveTheme: () => {
    const theme = document.documentElement.dataset.theme || 'light';
    storage.save(KEYS.THEME, theme);
  },
  
  loadTheme: () => {
    return storage.load(KEYS.THEME);
  },
  
  // Style values storage
  saveStyles: () => {
    const styles = {};
    
    // Collect values from style controls
    document.querySelectorAll('.style-control').forEach(control => {
      if (control.id !== 'theme-mode') {
        const property = control.dataset.styleProperty;
        const unit = control.dataset.unit || '';
        styles[property] = { value: control.value, unit };
      }
    });
    
    storage.save(KEYS.STYLES, styles);
  },
  
  loadStyles: () => {
    return storage.load(KEYS.STYLES);
  },
  
  // Panel state (open/closed)
  savePanelState: () => {
    const controlPanel = document.getElementById('controlPanel');
    if (controlPanel) {
      const state = controlPanel.classList.contains('collapsed') ? 'closed' : 'open';
      storage.save(KEYS.PANEL_STATE, state);
    }
  },
  
  loadPanelState: () => {
    return storage.load(KEYS.PANEL_STATE);
  },
  
  // Initialization - setup listeners
  init: () => {
    // Theme change listener
    document.addEventListener('themeChanged', bitUIStorage.saveTheme);
    
    // Style change listeners
    document.querySelectorAll('.style-control').forEach(control => {
      if (control.id !== 'theme-mode') {
        control.addEventListener('change', bitUIStorage.saveStyles);
      }
    });
    
    // Panel toggle listener
    const toggleBtn = document.getElementById('togglePanel');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        setTimeout(bitUIStorage.savePanelState, 50);
      });
    }
  }
};

// Add to window object for access from other scripts
window.bitUIStorage = bitUIStorage;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize storage listeners
  setTimeout(bitUIStorage.init, 500);
});
