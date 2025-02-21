document.getElementById('download-css').addEventListener('click', function () {
    const cssFiles = [
        'src/styles/main.css',
        'src/styles/base.css',
        'src/styles/grid.css',
        'src/styles/components.css'
    ];
    const demoFile = 'src/screens/demo.html';
    const licenseFile = '/LICENSE.txt'; // Optional: You can define this, but it’s not strictly needed unless reused
  
    // Fetch all stylesheets, demo.html, and LICENSE file
    Promise.all([
        ...cssFiles.map(file => fetch(file).then(res => res.text())),  // Fetch CSS files
        fetch(demoFile).then(res => res.text()),                       // Fetch demo.html
        fetch(licenseFile).then(res => res.text())                     // Fetch LICENSE file
    ])
    .then(filesContent => {
        const cssFilesContent = filesContent.slice(0, cssFiles.length); // CSS files content
        const demoHTML = filesContent[cssFiles.length];                 // demo.html content
        const licenseText = filesContent[cssFiles.length + 1];          // LICENSE file content
  
        // Merge only CSS files
        const mergedCSS = cssFilesContent.join("\n\n");
  
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
            '--panel-bg', '--panel-dark-bg', '--panel-border'
        ];
  
        // Replace CSS variables with computed values
        let updatedCSS = mergedCSS;
        variables.forEach(variable => {
            const value = rootStyles.getPropertyValue(variable).trim();
            updatedCSS = updatedCSS.replace(new RegExp(`${variable}:.*?;`, 'g'), `${variable}: ${value};`);
        });
  
        // Create ZIP archive
        const zip = new JSZip();
        zip.file("bitui.css", updatedCSS);    // Add CSS
        zip.file("demo.html", demoHTML);      // Add demo.html
        zip.file("LICENSE.txt", licenseText); // Add LICENSE as LICENSE.txt in the ZIP
  
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
    .catch(error => {
        console.error("Error fetching files:", error);
        // Optional: Notify user or handle the error gracefully (e.g., show an alert)
        alert("There was an error downloading BitUI. Please check the console for details.");
    });
  });