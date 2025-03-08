document.addEventListener('DOMContentLoaded', async () => {
  const snippetBases = [
    'structure',
    'columns',
    'layout',
    'position',
    'flex',
  ];

  for (const base of snippetBases) {
    const snippetId = `snippet-${base}`;
    const container = document.getElementById(snippetId);

    if (!container) {
      console.warn(`No container found for ${snippetId}`);
      continue;
    }

    try {
      const htmlResponse = await fetch(`../src/snippets/${base}.html`);
      const html = await htmlResponse.text();
      container.className = 'snippet-container';

      // Code block
      const code = document.createElement('pre');
      code.className = 'snippet-code language-html';

      // Toggle buttons (first)
      const toggleContainer = document.createElement('div');
      toggleContainer.className = 'snippet-toggle';

      code.appendChild(toggleContainer);

      // Code content (second)
      const codeContent = document.createElement('code');
      codeContent.textContent = html.trim(); // Start with HTML
      code.appendChild(codeContent);

      // Copy button (last)
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(codeContent.textContent).then(() => {
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
      console.error(`Failed to load ${base} snippets:`, error);
    }
  }
});