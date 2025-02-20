class StyleController {
    constructor() {
        this.root = document.documentElement;
        this.controls = document.querySelectorAll('.style-control');
        this.themeSlider = document.getElementById('theme-mode');
        this.init();
    }

    init() {
        this.controls.forEach(control => {
            this.updateStyle(control);
            control.addEventListener('input', () => this.updateStyle(control));
        });

        // Theme control
        this.themeSlider.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            
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
        });
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