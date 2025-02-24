// src/scripts/snippet-loader.js
document.addEventListener('DOMContentLoaded', async () => {
  const snippetFiles = [
    'example.html',
    'position.html',
    'structure.html', 
    'sticky.html',
    'layout.html'
  ];

  for (const file of snippetFiles) {
    const snippetId = `snippet-${file.replace('.html', '')}`;
    const container = document.getElementById(snippetId);

    if (!container) {
      console.warn(`No container found for ${snippetId}`);
      continue;
    }

    try {
      const response = await fetch(`../src/components/snippets/${file}`);
      const html = await response.text();

      container.className = 'snippet-container';

      const code = document.createElement('pre');
      code.className = 'snippet-code language-html';
      const codeContent = document.createElement('code');
      codeContent.textContent = html.trim();
      code.appendChild(codeContent);

      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(html.trim()).then(() => {
          copyBtn.className = 'copy-btn success';
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = 'Copy';
          }, 2000);
        });
      });
      code.appendChild(copyBtn);

      container.appendChild(code);

      Prism.highlightElement(codeContent);
    } catch (error) {
      console.error(`Failed to load ${file}:`, error);
    }
  }
});