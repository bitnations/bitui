/**
 * Downloads the bitui.css file directly
 */
function downloadCSS() {
  // Direct download of the bitui.css file
  fetch('/src/styles/bitui.css')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch bitui.css: ${response.status}`);
      }
      return response.text();
    })
    .then(cssContent => {
      // Create a blob from the CSS content
      const blob = new Blob([cssContent], { type: 'text/css' });
      
      // Create a download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = 'bitui.css';
      
      // Trigger the download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);
    })
    .catch(error => {
      console.error('Error downloading bitui.css:', error);
      alert('Failed to download bitui.css. See console for details.');
    });
}

// Attach event listener if this script is loaded directly
document.addEventListener('DOMContentLoaded', () => {
  const downloadButton = document.getElementById('download-css');
  if (downloadButton) {
    downloadButton.addEventListener('click', downloadCSS);
  }
});

// Make downloadCSS available globally so it can be used by other scripts
window.downloadCSS = downloadCSS;