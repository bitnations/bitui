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
        // Background color
        this.root.style.setProperty(
            '--bg-color', 
            `rgb(${251 - (251 - 30) * value}, ${251 - (251 - 30) * value}, ${251 - (251 - 30) * value})`
        );
        
        // Panel backgrounds
        this.root.style.setProperty(
            '--panel-bg', 
            `rgb(${255 - (255 - 46) * value}, ${255 - (255 - 46) * value}, ${255 - (255 - 46) * value})`
        );
        
        this.root.style.setProperty(
            '--panel-dark-bg', 
            `rgb(${245 - (245 - 38) * value}, ${245 - (245 - 38) * value}, ${245 - (245 - 38) * value})`
        );

        // Text colors
        if (value > 0.5) {
            this.root.style.setProperty('--text-color', '#FBFBFB');
            this.root.style.setProperty('--heading-color', '#FFFFFF');
        } else {
            this.root.style.setProperty('--text-color', '#4D4D4D');
            this.root.style.setProperty('--heading-color', '#2E2E2E');
        }

        // Update value display
        const display = document.getElementById('theme-mode-value');
        display.textContent = value > 0.5 ? 'Dark' : 'Light';
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
}); 