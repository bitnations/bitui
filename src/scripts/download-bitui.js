document.getElementById('download-css').addEventListener('click', function () {
  const cssFiles = [
      '/src/styles/main.css',        // Ensure main.css loads first
      '/src/styles/base.css',
      '/src/styles/grid.css',
      '/src/styles/components.css'   // Load components.css last
  ];

  // Fetch all stylesheets in the correct order
  Promise.all(cssFiles.map(file => fetch(file).then(res => res.text())))
      .then(filesContent => {
          let mergedCSS = filesContent.join("\n\n"); // Combine files in order

          // Get computed styles from the root element
          const rootStyles = getComputedStyle(document.documentElement);
          
          // List of all variables to replace dynamically
          const variables = [
              /* Colors */
              '--red', '--red-hover', '--orange', '--green', '--green-hover',
              '--blue', '--blue-hover', '--purple', '--purple-hover', '--graph-green', '--graph-blue',
              /* Layout */
              '--container-width', '--container-min-width', '--container-max-width',
              '--column-gap', '--border-radius', '--spacing-unit',
              '--panel-padding-x', '--panel-padding-y',
              /* Typography */
              '--font-family-base', '--font-size-base', '--line-height-base',
              /* Theme Colors */
              '--bg-color', '--text-color', '--heading-color',
              '--panel-bg', '--panel-dark-bg'
          ];

          // Replace each CSS variable with its live computed value
          variables.forEach(variable => {
              const value = rootStyles.getPropertyValue(variable).trim();
              mergedCSS = mergedCSS.replace(new RegExp(`${variable}:.*?;`, 'g'), `${variable}: ${value};`);
          });

          // Create and download the updated CSS file
          const blob = new Blob([mergedCSS], { type: 'text/css' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'bitui.css';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      })
      .catch(error => console.error('Error fetching CSS files:', error));
});
