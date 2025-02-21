document.getElementById('download-css').addEventListener('click', function () {
  const cssFiles = [
      'src/styles/main.css',
      'src/styles/base.css',
      'src/styles/grid.css',
      'src/styles/components.css'
  ];
  const demoFile = 'src/screens/demo.html';

  // Fetch all stylesheets + demo.html
  Promise.all([
      ...cssFiles.map(file => fetch(file).then(res => res.text())),  // Fetch CSS files
      fetch(demoFile).then(res => res.text())                        // Fetch demo.html
  ])
  .then(filesContent => {
      const mergedCSS = filesContent.slice(0, cssFiles.length).join("\n\n"); // Merge only CSS files
      const demoHTML = filesContent[cssFiles.length]; // Get the last fetched file (demo.html)

      // Get computed styles from the root element
      const rootStyles = getComputedStyle(document.documentElement);
      const variables = [
          '--red', '--red-hover', '--orange', '--green', '--green-hover',
          '--blue', '--blue-hover', '--purple', '--purple-hover', '--graph-green', '--graph-blue',
          '--container-width', '--container-min-width', '--container-max-width',
          '--column-gap', '--border-radius', '--spacing-unit',
          '--panel-padding-x', '--panel-padding-y',
          '--font-family-base', '--font-size-base', '--line-height-base',
          '--bg-color', '--text-color', '--heading-color',
          '--panel-bg', '--panel-dark-bg'
      ];

      // Replace CSS variables with computed values
      let updatedCSS = mergedCSS;
      variables.forEach(variable => {
          const value = rootStyles.getPropertyValue(variable).trim();
          updatedCSS = updatedCSS.replace(new RegExp(`${variable}:.*?;`, 'g'), `${variable}: ${value};`);
      });

      // Create ZIP archive
      const zip = new JSZip();
      zip.file("bitui.css", updatedCSS);  // Add CSS
      zip.file("demo.html", demoHTML);    // Add demo.html

      // Generate ZIP and trigger download
      zip.generateAsync({ type: "blob" }).then(function (zipFile) {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(zipFile);
          link.download = "bitui.zip";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      });
  })
  .catch(error => console.error("Error fetching files:", error));
});
