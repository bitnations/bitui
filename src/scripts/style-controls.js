class StyleController {
    constructor() {
        this.root = document.documentElement;
        this.controls = document.querySelectorAll('.style-control');
        this.init();
    }

    init() {
        this.controls.forEach(control => {
            this.updateStyle(control);
            control.addEventListener('input', () => this.updateStyle(control));
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