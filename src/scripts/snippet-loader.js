// src/scripts/snippet-loader.js
document.addEventListener('DOMContentLoaded', async () => {
  const snippetBases = [
    'layout',
    'position',
    'sticky',
    'structure',
  ];

  for (const base of snippetBases) {
    const snippetId = `snippet-${base}`;
    const container = document.getElementById(snippetId);

    if (!container) {
      console.warn(`No container found for ${snippetId}`);
      continue;
    }

    try {
      const htmlResponse = await fetch(`../src/components/snippets/${base}.html`);
      const html = await htmlResponse.text();
      const reactResponse = await fetch(`../src/components/snippets/${base}-react.html`);
      const react = await reactResponse.text();

      container.className = 'snippet-container';

      // Code block
      const code = document.createElement('pre');
      code.className = 'snippet-code language-html';

      // Toggle buttons (first)
      const toggleContainer = document.createElement('div');
      toggleContainer.className = 'snippet-toggle';

      const htmlBtn = document.createElement('button');
      htmlBtn.textContent = 'HTML';
      htmlBtn.className = 'toggle-btn active';

      const reactBtn = document.createElement('button');
      reactBtn.textContent = 'React';
      reactBtn.className = 'toggle-btn';

      toggleContainer.appendChild(htmlBtn);
      toggleContainer.appendChild(reactBtn);
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

      // Toggle logic
      htmlBtn.addEventListener('click', () => {
        htmlBtn.className = 'toggle-btn active';
        reactBtn.className = 'toggle-btn';
        codeContent.textContent = html.trim();
        code.className = 'snippet-code language-html';
        Prism.highlightElement(codeContent);
      });

      reactBtn.addEventListener('click', () => {
        reactBtn.className = 'toggle-btn active';
        htmlBtn.className = 'toggle-btn';
        codeContent.textContent = react.trim();
        code.className = 'snippet-code language-jsx';
        Prism.highlightElement(codeContent);
      });

      Prism.highlightElement(codeContent);
    } catch (error) {
      console.error(`Failed to load ${base} snippets:`, error);
    }
  }
});