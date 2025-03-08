/**
 * BitUI Download Module - Complete Version
 */

// Files to include in the zip
const FILES_TO_INCLUDE = [
  '/index.html',
  '/src/styles/bitui.css',
  '/src/styles/code.css',
  '/src/styles/controlPanel.css',
  '/src/scripts/storage.js',
  '/src/scripts/preferences.js',
  '/src/scripts/download.js',
  '/src/scripts/controlPanel.js',
  '/src/fonts/NotoColorEmoji.ttf',
  '/src/fonts/RobotoMono-Italic-VariableFont_wght.ttf',
  '/src/fonts/RobotoMono-Regular.ttf',
  '/src/fonts/RobotoMono-VariableFont_wght.ttf'
];

/**
 * Downloads the current CSS with all custom properties
 */
function downloadCSS() {
  console.log('Download CSS function called');
  
  // Generate custom CSS with user's settings
  const customCSS = generateCustomCSS();
  
  // Create a blob from the CSS content
  const blob = new Blob([customCSS], { type: 'text/css' });
  
  // Create a download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'bitui-custom.css';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  
  console.log('Custom CSS downloaded');
}

/**
 * Gets the current theme from the document
 */
function getCurrentTheme() {
  return document.documentElement.dataset.theme || 'light';
}

/**
 * Generates custom CSS with current user settings
 */
function generateCustomCSS() {
  console.log('Generating custom CSS');
  
  // Get all custom properties from the root element
  const styles = getComputedStyle(document.documentElement);
  const customProperties = {};
  
  // Debug: Log all localStorage items
  console.log('All localStorage items:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`${key}: ${localStorage.getItem(key)}`);
  }
  
  // Get color settings from localStorage
  try {
    const colorStorageKey = 'bitui-custom-colors';
    const savedColors = localStorage.getItem(colorStorageKey);
    if (savedColors) {
      console.log('Found color settings:', savedColors);
      const colors = JSON.parse(savedColors);
      Object.entries(colors).forEach(([type, color]) => {
        customProperties[`--${type}`] = color;
        customProperties[`--${type}-hover`] = color;
      });
    }
  } catch (e) {
    console.error('Error getting colors from localStorage:', e);
  }
  
  // Get style settings from localStorage
  try {
    const styleStorageKey = 'bitui-style-settings';
    const savedStyles = localStorage.getItem(styleStorageKey);
    if (savedStyles) {
      console.log('Found style settings:', savedStyles);
      const styles = JSON.parse(savedStyles);
      Object.entries(styles).forEach(([property, data]) => {
        const { value, unit } = data;
        customProperties[property] = value + unit;
      });
    }
  } catch (e) {
    console.error('Error getting styles from localStorage:', e);
  }
  
  // Get container settings from localStorage
  try {
    const containerStorageKey = 'bitui-container-settings';
    const savedContainerSettings = localStorage.getItem(containerStorageKey);
    if (savedContainerSettings) {
      console.log('Found container settings:', savedContainerSettings);
      const containerStyles = JSON.parse(savedContainerSettings);
      Object.entries(containerStyles).forEach(([property, data]) => {
        const { value, unit } = data;
        customProperties[property] = value + unit;
      });
    }
  } catch (e) {
    console.error('Error getting container settings from localStorage:', e);
  }
  
  // If no custom properties were found in localStorage, get them from the computed style
  if (Object.keys(customProperties).length === 0) {
    console.log('No settings found in localStorage, using computed styles');
    // Extract custom properties from computed style
    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      if (prop.startsWith('--')) {
        const value = styles.getPropertyValue(prop).trim();
        if (value) {
          customProperties[prop] = value;
        }
      }
    }
  }
  
  // Also get specific style properties we care about from the computed style
  const importantProperties = [
    '--border-radius',
    '--column-gap',
    '--font-size-base',
    '--container-width',
    '--container-padding'
  ];
  
  importantProperties.forEach(prop => {
    if (!customProperties[prop]) {
      const value = styles.getPropertyValue(prop).trim();
      if (value) {
        console.log(`Adding important property from computed style: ${prop} = ${value}`);
        customProperties[prop] = value;
      }
    }
  });
  
  // Get current theme
  const currentTheme = getCurrentTheme();
  
  // Debug: Log all custom properties
  console.log('All custom properties:');
  Object.entries(customProperties).forEach(([prop, value]) => {
    console.log(`${prop}: ${value}`);
  });
  
  // Generate CSS content
  let cssContent = `/* BitUI Custom CSS */
/* Generated on ${new Date().toLocaleString()} */
/* This file contains your custom settings and will override the default styles */

:root {
`;
  
  // Add each custom property
  Object.entries(customProperties).forEach(([prop, value]) => {
    if (value) {
      cssContent += `  ${prop}: ${value};\n`;
    }
  });
  
  // Add theme information
  cssContent += `}

/* Current theme: ${currentTheme} */
[data-theme="${currentTheme}"] {
  /* Theme-specific overrides can be added here */
}
`;
  
  return cssContent;
}

/**
 * Downloads all files as a zip package
 */
async function downloadAllFiles() {
  console.log('Download All Files function called');
  
  // Update button state
  const button = document.getElementById('download-all');
  if (button) {
    button.textContent = 'Creating Package...';
    button.disabled = true;
  }
  
  try {
    // Check if JSZip is available
    if (typeof JSZip !== 'function') {
      throw new Error('JSZip is not available. Please include the JSZip library.');
    }
    
    // Create a new JSZip instance
    const zip = new JSZip();
    console.log('JSZip instance created');
    
    // Get current theme
    const currentTheme = getCurrentTheme();
    console.log('Current theme:', currentTheme);
    
    // Add README file
    const readmeContent = `# BitUI Framework

A lightweight, customizable UI framework.

## Quick Start

1. Include the CSS files in your HTML:
   \`\`\`html
   <link rel="stylesheet" href="src/styles/bitui.css">
   <link rel="stylesheet" href="src/styles/code.css">
   <link rel="stylesheet" href="src/styles/custom-settings.css">
   \`\`\`

2. Include the JavaScript files:
   \`\`\`html
   <script src="src/scripts/storage.js"></script>
   <script src="src/scripts/preferences.js"></script>
   \`\`\`

3. Start using BitUI components in your HTML.

## Customization

The custom-settings.css file contains your personalized settings.
It will override the default styles from bitui.css.

## Theme

This package is configured with the "${currentTheme}" theme.
You can change the theme by modifying the data-theme attribute on the html element.
`;
    zip.file('README.md', readmeContent);
    
    // Generate custom CSS with user's settings
    const customCSS = generateCustomCSS();
    zip.file('src/styles/custom-settings.css', customCSS);
    
    // Fetch all files and add them to the zip
    const fetchPromises = FILES_TO_INCLUDE.map(async (filePath) => {
      try {
        console.log(`Fetching ${filePath}...`);
        const response = await fetch(filePath);
        if (!response.ok) {
          console.error(`Failed to fetch ${filePath}: ${response.status}`);
          return false;
        }
        
        // Handle binary files differently
        if (filePath.endsWith('.ttf')) {
          const buffer = await response.arrayBuffer();
          zip.file(filePath.substring(1), buffer, { binary: true });
          console.log(`Added binary file ${filePath} to zip`);
        } else {
          let text = await response.text();
          
          // For index.html, update the theme and add the custom CSS link
          if (filePath === '/index.html') {
            // Update the theme in the HTML tag
            text = text.replace(/<html([^>]*)data-theme="[^"]*"([^>]*)>/, 
                               `<html$1data-theme="${currentTheme}"$2>`);
            
            // If there's no data-theme attribute, add it
            if (!text.includes('data-theme=')) {
              text = text.replace(/<html([^>]*)>/, 
                                 `<html$1 data-theme="${currentTheme}">`);
            }
            
            // Add custom CSS link as the last item in head
            text = text.replace('</head>', 
              `  <!-- Custom settings - will override default styles -->\n  <link rel="stylesheet" href="src/styles/custom-settings.css">\n</head>`);
            
            zip.file(filePath.substring(1), text);
            console.log(`Modified and added ${filePath} to zip with theme: ${currentTheme}`);
          } else {
            zip.file(filePath.substring(1), text);
            console.log(`Added text file ${filePath} to zip`);
          }
        }
        
        return true;
      } catch (error) {
        console.error(`Error fetching ${filePath}:`, error);
        return false;
      }
    });
    
    // Wait for all files to be fetched
    console.log('Waiting for all files to be fetched...');
    const results = await Promise.all(fetchPromises);
    
    if (results.some(result => !result)) {
      console.warn('Some files could not be fetched');
    }
    
    // Generate the zip file
    console.log('Generating zip file...');
    const content = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
    
    console.log('Zip generated, size:', content.size);
    
    // Download the zip file
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'bitui.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    console.log('Complete package downloaded successfully');
  } catch (error) {
    console.error('Error creating package:', error);
    alert('Failed to create package: ' + error.message);
  } finally {
    // Restore button state
    if (button) {
      button.textContent = 'Download';
      button.disabled = false;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Download module initialized');
  
  // Find all buttons with class "btn" and id containing "download"
  const buttons = document.querySelectorAll('button.btn[id*="download"]');
  console.log('Found download buttons:', buttons.length);
  
  // Log each button for debugging
  buttons.forEach(button => {
    console.log('Button found:', button.id, button.textContent);
  });
  
  // Set up event listeners for all download buttons
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Button clicked:', this.id);
      
      if (this.id === 'download-css') {
        downloadCSS();
      } else if (this.id.includes('download-all') || this.id.includes('download-package')) {
        downloadAllFiles();
      }
    });
  });
});

// Export functions
window.downloadCSS = downloadCSS;
window.downloadAllFiles = downloadAllFiles;

console.log('Download script loaded');
