class StyleController {
    constructor() {
        this.root = document.documentElement;
        this.controls = document.querySelectorAll('.style-control');
        this.themeSlider = document.getElementById('theme-mode');
        this.resetButton = document.getElementById('reset-defaults');
        this.storageKey = 'bitui-preferences';
        this.defaultValues = {
            'border-radius': '15',
            'spacing': '20',
            'panel-padding-x': '15',
            'panel-padding-y': '15',
            'font-size': '16',
            'theme-mode': '0'
        };

        // Define theme mode colors
        this.themeModes = {
            light: {
                bg: 'rgb(251, 251, 251)',
                panel: 'rgb(255, 255, 255)',
                panelDark: 'rgb(245, 245, 245)',
                text: '#4D4D4D',
                heading: '#2E2E2E'
            },
            warm: {
                bg: 'rgb(255, 243, 230)',         // Warmer, more orange tint
                panel: 'rgb(255, 248, 240)',      // Slightly warmer panels
                panelDark: 'rgb(250, 240, 230)',  // Warmer dark panels
                text: '#4D4D4D',
                heading: '#2E2E2E'
            },
            dim: {
                bg: 'rgb(38, 38, 42)',            // Slightly blue-ish dark
                panel: 'rgb(45, 45, 50)',         // Darker panels with hint of blue
                panelDark: 'rgb(35, 35, 40)',     // Even darker panels
                text: '#FBFBFB',
                heading: '#FFFFFF'
            },
            dark: {
                bg: 'rgb(31, 31, 31)',
                panel: 'rgb(46, 46, 46)',
                panelDark: 'rgb(38, 38, 38)',
                text: '#FBFBFB',
                heading: '#FFFFFF'
            }
        };

        this.init();
    }

    init() {
        // Load saved preferences
        this.loadPreferences();

        // Setup control listeners
        this.controls.forEach(control => {
            this.updateStyle(control);
            control.addEventListener('input', () => {
                this.updateStyle(control);
                this.savePreferences();
            });
        });

        // Theme control
        this.themeSlider.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            this.updateTheme(value);
            this.savePreferences();
        });

        // Reset button
        this.resetButton.addEventListener('click', () => this.resetToDefaults());
    }

    updateStyle(control) {
        const property = control.dataset.styleProperty;
        const unit = control.dataset.unit || '';
        const value = control.value + unit;
        
        this.root.style.setProperty(property, value);
        
        const valueDisplay = document.getElementById(`${control.id}-value`);
        if (valueDisplay) {
            valueDisplay.textContent = value;
        }
    }

    updateTheme(value) {
        let mode, nextMode, progress;
        
        // Adjust breakpoints for smoother transitions
        if (value <= 0.33) {  // Light to Warm (0-33%)
            mode = 'light';
            nextMode = 'warm';
            progress = value / 0.33;
        } else if (value <= 0.50) {  // Warm (33-50%)
            mode = 'warm';
            nextMode = 'warm';
            progress = 1;
        } else if (value <= 0.66) {  // Dim (50-66%)
            mode = 'dim';
            nextMode = 'dim';
            progress = 0;
        } else {  // Dim to Dark (66-100%)
            mode = 'dim';
            nextMode = 'dark';
            progress = (value - 0.66) / 0.34;
        }

        // Interpolate between modes
        const current = this.themeModes[mode];
        const next = this.themeModes[nextMode];

        // Helper function to interpolate RGB colors
        const interpolateRGB = (color1, color2, progress) => {
            const rgb1 = color1.match(/\d+/g).map(Number);
            const rgb2 = color2.match(/\d+/g).map(Number);
            const rgb = rgb1.map((c1, i) => {
                const c2 = rgb2[i];
                return Math.round(c1 + (c2 - c1) * progress);
            });
            return `rgb(${rgb.join(', ')})`;
        };

        // Update colors
        this.root.style.setProperty('--bg-color', 
            interpolateRGB(current.bg, next.bg, progress));
        this.root.style.setProperty('--panel-bg', 
            interpolateRGB(current.panel, next.panel, progress));
        this.root.style.setProperty('--panel-dark-bg', 
            interpolateRGB(current.panelDark, next.panelDark, progress));

        // Text colors switch at midpoints
        if (value > 0.5) {
            this.root.style.setProperty('--text-color', next.text);
            this.root.style.setProperty('--heading-color', next.heading);
        } else {
            this.root.style.setProperty('--text-color', current.text);
            this.root.style.setProperty('--heading-color', current.heading);
        }

        // Update display text
        const display = document.getElementById('theme-mode-value');
        if (value <= 0.15) display.textContent = 'Light';
        else if (value <= 0.45) display.textContent = 'Warm';
        else if (value <= 0.80) display.textContent = 'Dim';
        else display.textContent = 'Dark';
    }

    savePreferences() {
        const preferences = {};
        
        // Save all control values
        this.controls.forEach(control => {
            preferences[control.id] = control.value;
        });

        localStorage.setItem(this.storageKey, JSON.stringify(preferences));
    }

    loadPreferences() {
        const saved = localStorage.getItem(this.storageKey);
        if (!saved) return;

        const preferences = JSON.parse(saved);
        
        // Apply saved values to controls
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
    }

    resetToDefaults() {
        // Apply default values to all controls
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
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StyleController();

    // Panel toggle functionality
    const controlPanel = document.getElementById('controlPanel');
    const toggleButton = document.getElementById('togglePanel');
    
    toggleButton.addEventListener('click', () => {
        controlPanel.classList.toggle('closed');
    });

    // Copy button functionality
    document.querySelectorAll('.code-block').forEach(block => {
        const copyBtn = block.querySelector('.copy-btn');
        const code = block.querySelector('code');

        copyBtn.addEventListener('click', async () => {
            try {
                // Get text content and clean it up
                const text = code.textContent
                    .replace(/^\n+|\n+$/g, '') // Remove leading/trailing newlines
                    .replace(/^[ \t]+/gm, ''); // Remove leading spaces/tabs

                await navigator.clipboard.writeText(text);
                
                // Show success state
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('success');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.classList.remove('success');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                copyBtn.textContent = 'Failed';
                
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            }
        });
    });
}); 