const themes = {
  light: {
    bg: 'rgb(251, 251, 251)',
    text: 'rgb(77, 77, 77)',
    heading: 'rgb(46, 46, 46)',
    panel: 'rgb(255, 255, 255)',
    panelDark: 'rgb(245, 245, 245)',
    border: 'rgb(230, 230, 230)'
  },
  warm: {
    bg: 'rgb(247, 238, 220)',
    text: 'rgb(90, 75, 58)',
    heading: 'rgb(70, 57, 42)',
    panel: 'rgb(255, 248, 231)',
    panelDark: 'rgb(233, 222, 202)',
    border: 'rgb(203, 184, 163)'
  },
  dim: {
    bg: 'rgb(24, 35, 46)',
    text: 'rgb(196, 201, 208)',
    heading: 'rgb(208, 213, 220)',
    panel: 'rgb(31, 44, 58)',
    panelDark: 'rgb(37, 54, 70)',
    border: 'rgb(60, 76, 94)'
  },
  dark: {
    bg: 'rgb(0, 0, 0)',
    text: 'rgb(255, 255, 255)',
    heading: 'rgb(179, 179, 179)',
    panel: 'rgb(12, 12, 12)',
    panelDark: 'rgb(12, 12, 12)',
    border: 'rgb(51, 51, 51)'
  }
};

document.getElementById('theme-mode').addEventListener('input', function (e) {
  const value = e.target.value / 100;
  let mode, nextMode, progress;

  // Evenly split breakpoints
  if (value <= 0.25) {  
    mode = "light";
    nextMode = "warm";
    progress = value / 0.25;
  } else if (value <= 0.50) {  
    mode = "warm";
    nextMode = "dim";
    progress = (value - 0.25) / 0.25;
  } else if (value <= 0.75) {  
    mode = "dim";
    nextMode = "dark";
    progress = (value - 0.50) / 0.25;
  } else {  
    mode = "dark";
    nextMode = "dark"; // No transition past 75%
    progress = 1;
  }

  const current = themes[mode];
  const next = themes[nextMode];

  // Calculate interpolated colors
  const bgColor = interpolateColor(current.bg, next.bg, progress);
  const textColor = interpolateColor(current.text, next.text, progress);

  // Calculate contrast ratio
  const contrastRatio = calculateContrastRatio(bgColor, textColor);
  const minContrast = 4.5; // WCAG Level AA for normal text
  const snapThreshold = 0.05; // General threshold for other transitions

  // Special handling for Warm → Dim transition (0.25–0.50)
  let shouldSnap = false;
  if (mode === "warm" && nextMode === "dim") {
    // Snap to Dim at progress 0.96 (value 48%) when moving toward Dim
    if (progress >= 0.96 && value > 0.48) {
      applyColors(themes.dim);
      // console.log(`Snapped to Dim - Contrast: ${contrastRatio.toFixed(2)}`);
      return;
    }
    // Snap to Warm at progress 1 (value 50%) when moving toward Warm
    if (progress <= 1 && value < 0.50) {
      applyColors(themes.warm);
      // console.log(`Snapped to Warm - Contrast: ${contrastRatio.toFixed(2)}`);
      return;
    }
    // Check for low contrast in the transition range (progress 0.48–0.96)
    if (contrastRatio < minContrast && progress > 0.48 && progress < 0.96) {
      shouldSnap = true;
    }
  } else if (contrastRatio < minContrast && (progress <= snapThreshold || progress >= (1 - snapThreshold))) {
    // General snapping for other transitions (Light → Warm, Dim → Dark)
    shouldSnap = true;
  }

  if (shouldSnap) {
    // Snap to nearest theme
    const snappedColors = progress < 0.5 ? current : next;
    applyColors(snappedColors);
    // console.log(`Snapped to ${progress < 0.5 ? mode : nextMode} - Contrast: ${contrastRatio.toFixed(2)}`);
  } else {
    // Apply interpolated colors for non-snapped transitions
    applyColors({
      bg: bgColor,
      text: textColor,
      heading: interpolateColor(current.heading, next.heading, progress),
      panel: interpolateColor(current.panel, next.panel, progress),
      panelDark: interpolateColor(current.panelDark, next.panelDark, progress),
      border: interpolateColor(current.border, next.border, progress)
    });
    // console.log(`Interpolating: ${mode} → ${nextMode}`, { progress, contrast: contrastRatio.toFixed(2) });
  }

  localStorage.setItem('bitui-theme-progress', value);
});

// Apply colors to CSS variables
function applyColors(colors) {
  document.documentElement.style.setProperty('--bg-color', colors.bg);
  document.documentElement.style.setProperty('--text-color', colors.text);
  document.documentElement.style.setProperty('--heading-color', colors.heading);
  document.documentElement.style.setProperty('--panel-bg', colors.panel);
  document.documentElement.style.setProperty('--panel-dark-bg', colors.panelDark);
  document.documentElement.style.setProperty('--panel-border', colors.border);
}

// Interpolate RGB colors
function interpolateColor(color1, color2, progress) {
  if (!color1 || !color2) return color1;
  const rgb1 = color1.match(/\d+/g).map(Number);
  const rgb2 = color2.match(/\d+/g).map(Number);
  const interpolatedRGB = rgb1.map((c1, i) => Math.round(c1 + (rgb2[i] - c1) * progress));
  return `rgb(${interpolatedRGB.join(', ')})`;
}

// Calculate relative luminance (WCAG formula)
function getLuminance(rgb) {
  const [r, g, b] = rgb.match(/\d+/g).map(Number).map(v => v / 255);
  const sRGB = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * sRGB(r) + 0.7152 * sRGB(g) + 0.0722 * sRGB(b);
}

// Calculate contrast ratio between two colors
function calculateContrastRatio(color1, color2) {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Load saved progress
document.addEventListener('DOMContentLoaded', function () {
  const savedProgress = localStorage.getItem('bitui-theme-progress');
  if (savedProgress) {
    document.getElementById('theme-mode').value = savedProgress * 100;
    document.getElementById('theme-mode').dispatchEvent(new Event('input'));
  }
});

// FUNCTIONALITY
class StyleController {
  constructor() {
    this.root = document.documentElement;
    this.controls = document.querySelectorAll('.style-control');
    this.themeSlider = document.getElementById('theme-mode');
    this.resetButton = document.getElementById('reset-defaults');
    this.storageKey = 'bitui-preferences';
    this.panelStateKey = 'bitui-panel-state';
    this.controlPanel = document.getElementById('controlPanel');
    this.toggleButton = document.getElementById('togglePanel');

    this.defaultValues = {
      'border-radius': '15',
      'container': '50',
      'column-gap': '0.5',
      'spacing': '1',
      'panel-padding-x': '15',
      'panel-padding-y': '10',
      'font-size': '16'
    };

    this.init();
  }

  init() {
    this.loadPreferences();

    // Attach event listeners to controls
    this.controls.forEach(control => {
      this.updateStyle(control);
      control.addEventListener('input', () => {
        this.updateStyle(control);
        this.savePreferences();
      });
    });

    // Theme mode control
    this.themeSlider.addEventListener('input', (e) => {
      this.updateTheme(e.target.value / 100);
      this.savePreferences();
    });

    // Reset button
    this.resetButton.addEventListener('click', () => this.resetToDefaults());

    // Panel toggle functionality
    this.loadPanelState();
    this.toggleButton.addEventListener('click', () => {
      this.controlPanel.classList.toggle('closed');
      this.savePanelState();
    });
  }

  updateStyle(control) {
    const property = control.dataset.styleProperty;
    const unit = control.dataset.unit || '';
    this.root.style.setProperty(property, control.value + unit);

    // Update displayed value
    const valueDisplay = document.getElementById(`${control.id}-value`);
    if (valueDisplay) {
      valueDisplay.textContent = control.value + unit;
    }
  }

  updateTheme(value) {
    let theme;
    if (value <= 0.33) theme = "light";
    else if (value <= 0.50) theme = "warm";
    else if (value <= 0.66) theme = "dim";
    else theme = "dark";

    document.documentElement.setAttribute('data-theme', theme);

    // Update display text
    const display = document.getElementById('theme-mode-value');
    if (display) {
      display.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    }

    localStorage.setItem('bitui-theme', theme);
  }

  savePreferences() {
    const preferences = {};
    this.controls.forEach(control => {
      preferences[control.id] = control.value;
    });
    localStorage.setItem(this.storageKey, JSON.stringify(preferences));
  }

  loadPreferences() {
    const saved = localStorage.getItem(this.storageKey);
    if (!saved) return;

    const preferences = JSON.parse(saved);
    Object.entries(preferences).forEach(([id, value]) => {
      const control = document.getElementById(id);
      if (control) {
        control.value = value;
        if (id === 'theme-mode') {
          this.updateTheme(value / 100);
        } else {
          this.updateStyle(control);
        }
      }
    });

    // Load stored theme
    const savedTheme = localStorage.getItem('bitui-theme') || "light";
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  savePanelState() {
    localStorage.setItem(this.panelStateKey, this.controlPanel.classList.contains('closed'));
  }

  loadPanelState() {
    if (localStorage.getItem(this.panelStateKey) === 'true') {
      this.controlPanel.classList.add('closed');
    }
  }

  resetToDefaults() {
    Object.entries(this.defaultValues).forEach(([id, value]) => {
      const control = document.getElementById(id);
      if (control) {
        control.value = value;
        if (id === 'theme-mode') {
          this.updateTheme(value / 100);
        } else {
          this.updateStyle(control);
        }
      }
    });

    // Clear localStorage
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.panelStateKey);
    this.controlPanel.classList.remove('closed');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => new StyleController());


// class StyleController {
//   constructor() {
//     this.root = document.documentElement;
//     this.controls = document.querySelectorAll('.style-control');
//     this.themeSlider = document.getElementById('theme-mode');
//     this.resetButton = document.getElementById('reset-defaults');
//     this.storageKey = 'bitui-preferences';
//     this.panelStateKey = 'bitui-panel-state';  // New storage key for panel state
//     this.controlPanel = document.getElementById('controlPanel');
//     this.toggleButton = document.getElementById('togglePanel');
//     this.defaultValues = {
//       'border-radius': '15',
//       'container': '50',
//       'column-gap': '0.5',
//       'spacing': '1',
//       'panel-padding-x': '15',
//       'panel-padding-y': '10',
//       'font-size': '16',
//       'theme-mode': '0'
//     };

//     // Define theme mode colors
//     this.themeModes = {
//       light: {
//         bg: 'rgb(251, 251, 251)',
//         panel: 'rgb(255, 255, 255)',
//         panelDark: 'rgb(245, 245, 245)',
//         text: '#4D4D4D',
//         heading: '#2E2E2E'
//         // add panel border #E6E6E6
//       },
//       warm: {
//         bg: 'rgb(255, 243, 230)',         // Warmer, more orange tint
//         panel: 'rgb(255, 248, 240)',      // Slightly warmer panels
//         panelDark: 'rgb(250, 240, 230)',  // Warmer dark panels
//         text: '#4D4D4D',
//         heading: '#2E2E2E'
//       },
//       dim: {
//         bg: 'rgb(38, 38, 42)',            // Slightly blue-ish dark
//         panel: 'rgb(45, 45, 50)',         // Darker panels with hint of blue
//         panelDark: 'rgb(35, 35, 40)',     // Even darker panels
//         text: '#FBFBFB',
//         heading: '#FFFFFF'
//       },
//       dark: {
//         bg: '#000000',
//         panel: '0C0C0C',
//         panelDark: '0C0C0C',
//         text: '#FFFFFF',
//         heading: '#B3B3B3'
//         // add panel border #333333
//       }
//     };

//     this.init();
//   }

//   init() {
//     // Load saved preferences
//     this.loadPreferences();

//     // Setup control listeners
//     this.controls.forEach(control => {
//       this.updateStyle(control);
//       control.addEventListener('input', () => {
//         this.updateStyle(control);
//         this.savePreferences();
//       });
//     });

//     // Theme control
//     this.themeSlider.addEventListener('input', (e) => {
//       const value = e.target.value / 100;
//       this.updateTheme(value);
//       this.savePreferences();
//     });

//     // Reset button
//     this.resetButton.addEventListener('click', () => this.resetToDefaults());

//     // Panel toggle functionality with state persistence
//     this.loadPanelState();
//     this.toggleButton.addEventListener('click', () => {
//       this.controlPanel.classList.toggle('closed');
//       this.savePanelState();
//     });
//   }

//   updateStyle(control) {
//     const property = control.dataset.styleProperty;
//     const unit = control.dataset.unit || '';
//     const value = control.value + unit;

//     this.root.style.setProperty(property, value);

//     const valueDisplay = document.getElementById(`${control.id}-value`);
//     if (valueDisplay) {
//       valueDisplay.textContent = value;
//     }
//   }

//   updateTheme(value) {
//     let mode, nextMode, progress;

//     // Adjust breakpoints for smoother transitions
//     if (value <= 0.33) {  // Light to Warm (0-33%)
//       mode = 'light';
//       nextMode = 'warm';
//       progress = value / 0.33;
//     } else if (value <= 0.50) {  // Warm (33-50%)
//       mode = 'warm';
//       nextMode = 'warm';
//       progress = 1;
//     } else if (value <= 0.66) {  // Dim (50-66%)
//       mode = 'dim';
//       nextMode = 'dim';
//       progress = 0;
//     } else {  // Dim to Dark (66-100%)
//       mode = 'dim';
//       nextMode = 'dark';
//       progress = (value - 0.66) / 0.34;
//     }

//     // Interpolate between modes
//     const current = this.themeModes[mode];
//     const next = this.themeModes[nextMode];

//     // Helper function to interpolate RGB colors
//     const interpolateRGB = (color1, color2, progress) => {
//       const rgb1 = color1.match(/\d+/g).map(Number);
//       const rgb2 = color2.match(/\d+/g).map(Number);
//       const rgb = rgb1.map((c1, i) => {
//         const c2 = rgb2[i];
//         return Math.round(c1 + (c2 - c1) * progress);
//       });
//       return `rgb(${rgb.join(', ')})`;
//     };

//     // Update colors
//     this.root.style.setProperty('--bg-color',
//       interpolateRGB(current.bg, next.bg, progress));
//     this.root.style.setProperty('--panel-bg',
//       interpolateRGB(current.panel, next.panel, progress));
//     this.root.style.setProperty('--panel-dark-bg',
//       interpolateRGB(current.panelDark, next.panelDark, progress));

//     // Text colors switch at midpoints
//     if (value > 0.5) {
//       this.root.style.setProperty('--text-color', next.text);
//       this.root.style.setProperty('--heading-color', next.heading);
//     } else {
//       this.root.style.setProperty('--text-color', current.text);
//       this.root.style.setProperty('--heading-color', current.heading);
//     }

//     // Update display text
//     const display = document.getElementById('theme-mode-value');
//     if (value <= 0.15) display.textContent = 'Light';
//     else if (value <= 0.45) display.textContent = 'Warm';
//     else if (value <= 0.80) display.textContent = 'Dim';
//     else display.textContent = 'Dark';
//   }

//   savePreferences() {
//     const preferences = {};

//     // Save all control values
//     this.controls.forEach(control => {
//       preferences[control.id] = control.value;
//     });

//     localStorage.setItem(this.storageKey, JSON.stringify(preferences));
//   }

//   loadPreferences() {
//     const saved = localStorage.getItem(this.storageKey);
//     if (!saved) return;

//     const preferences = JSON.parse(saved);

//     // Apply saved values to controls
//     Object.entries(preferences).forEach(([id, value]) => {
//       const control = document.getElementById(id);
//       if (control) {
//         control.value = value;
//         if (id === 'theme-mode') {
//           this.updateTheme(value / 100);
//         } else {
//           this.updateStyle(control);
//         }
//       }
//     });
//   }

//   savePanelState() {
//     localStorage.setItem(this.panelStateKey,
//       this.controlPanel.classList.contains('closed'));
//   }

//   loadPanelState() {
//     const isClosed = localStorage.getItem(this.panelStateKey) === 'true';
//     if (isClosed) {
//       this.controlPanel.classList.add('closed');
//     }
//   }

//   resetToDefaults() {
//     // Apply default values to all controls
//     Object.entries(this.defaultValues).forEach(([id, value]) => {
//       const control = document.getElementById(id);
//       if (control) {
//         control.value = value;
//         if (id === 'theme-mode') {
//           this.updateTheme(value / 100);
//         } else {
//           this.updateStyle(control);
//         }
//       }
//     });

//     // Clear localStorage
//     localStorage.removeItem(this.storageKey);

//     // Also clear panel state
//     localStorage.removeItem(this.panelStateKey);
//     this.controlPanel.classList.remove('closed');
//   }
// }

// // Initialize when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//   new StyleController();

//   // Copy button functionality
//   document.querySelectorAll('.code-block').forEach(block => {
//     const copyBtn = block.querySelector('.copy-btn');
//     const code = block.querySelector('code');

//     copyBtn.addEventListener('click', async () => {
//       try {
//         // Get text content and clean it up
//         const text = code.textContent
//           .replace(/^\n+|\n+$/g, '') // Remove leading/trailing newlines
//           .replace(/^[ \t]+/gm, ''); // Remove leading spaces/tabs

//         await navigator.clipboard.writeText(text);

//         // Show success state
//         copyBtn.textContent = 'Copied!';
//         copyBtn.classList.add('success');

//         // Reset after 2 seconds
//         setTimeout(() => {
//           copyBtn.textContent = 'Copy';
//           copyBtn.classList.remove('success');
//         }, 2000);
//       } catch (err) {
//         console.error('Failed to copy:', err);
//         copyBtn.textContent = 'Failed';

//         setTimeout(() => {
//           copyBtn.textContent = 'Copy';
//         }, 2000);
//       }
//     });
//   });
// }); 