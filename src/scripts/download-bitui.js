document.getElementById('download-css').addEventListener('click', function () {
  const cssFiles = [
    'src/styles/main.css',
    'src/styles/base.css',
    'src/styles/grid.css',
    'src/styles/components.css',
    'src/styles/forms.css'
  ];
  const htmlFile = 'public/index.html';
  const licenseFile = '/LICENSE.txt';

  Promise.all([
    ...cssFiles.map(file => fetch(file).then(res => res.text())),
    fetch(htmlFile).then(res => res.text()),
    fetch(licenseFile).then(res => res.text())
  ])
    .then(filesContent => {
      const cssFilesContent = filesContent.slice(0, cssFiles.length);
      const demoHTML = filesContent[cssFiles.length];
      const licenseText = filesContent[cssFiles.length + 1];

      const mergedCSS = cssFilesContent.join("\n\n");

      const rootStyles = getComputedStyle(document.documentElement);
      const variables = [
        '--error', '--error-hover', '--action', '--action-hover', '--success',
        '--success-hover', '--info', '--info-hover',
        '--container-width', '--container-min-width', '--container-max-width',
        '--column-gap', '--border-radius', '--spacing-unit',
        '--panel-padding-x', '--panel-padding-y',
        '--font-family-base', '--font-size-base', '--line-height-base',
        '--bg-color', '--text-color', '--heading-color',
        '--panel-bg', '--panel-dark-bg', '--panel-border',
      ];

      let updatedCSS = mergedCSS;
      variables.forEach(variable => {
        const value = rootStyles.getPropertyValue(variable).trim();
        updatedCSS = updatedCSS.replace(new RegExp(`${variable}:.*?;`, 'g'), `${variable}: ${value};`);
      });

      const zip = new JSZip();
      zip.file("styles.css", updatedCSS);
      zip.file("index.html", demoHTML);
      zip.file("LICENSE.txt", licenseText);

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
      alert("There was an error downloading bitUI. Please check the console for details.");
    });
});