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
    panel: 'rgb(37, 54, 70)',
    panelDark: 'rgb(31, 44, 58)',
    border: 'rgb(60, 76, 94)'
  },
  dark: {
    bg: 'rgb(0, 0, 0)',
    text: 'rgb(255, 255, 255)',
    heading: 'rgb(179, 179, 179)',
    panel: 'rgb(16, 16, 16)',
    panelDark: 'rgb(0, 0, 0)',
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

function resetColorsToDefaults() {
  const defaultColors = {
    error: 'rgb(225, 85, 84)',
    errorHover: 'rgb(225, 123, 123)',
    action: 'rgb(255, 165, 0)',
    actionHover: 'rgb(255, 185, 0)',
    success: 'rgb(59, 178, 115)',
    successHover: 'rgb(59, 178, 115, 0.85)',
    info: 'rgb(77, 157, 224)',
    infoHover: 'rgb(77, 163, 234)'
  };

  Object.entries(defaultColors).forEach(([key, color]) => {
    document.documentElement.style.setProperty(`--${key}`, color);
    const swatch = document.getElementById(`color-${key.replace('Hover', '').toLowerCase()}`);
    if (swatch) swatch.style.backgroundColor = color;
  });

  localStorage.removeItem('bitui-generated-colors');  // ✅ Clears stored colors
}

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
    this.loadStoredColors();

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

  loadStoredColors() {
    const savedColors = localStorage.getItem('bitui-generated-colors');
    if (savedColors) {
      const colors = JSON.parse(savedColors);
      Object.entries(colors).forEach(([key, color]) => {
        document.documentElement.style.setProperty(`--${key}`, color);
        const swatch = document.getElementById(`color-${key.replace('Hover', '').toLowerCase()}`);
        if (swatch) swatch.style.backgroundColor = color;
      });
    }
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

    resetColorsToDefaults();

    // Clear localStorage
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.panelStateKey);
    localStorage.removeItem('bitui-generated-colors');
    this.controlPanel.classList.remove('closed');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => new StyleController());