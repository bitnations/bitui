function formatCode(code) {
  let indentLevel = 0;
  const indent = '  '; // 2 spaces
  return code
    .split('\n')
    .map(line => {
      line = line.trim();
      if (line.match(/<\/[a-z]+>/i)) indentLevel--;
      const formatted = indent.repeat(Math.max(0, indentLevel)) + line;
      if (line.match(/<[a-z]+[^>]*>/i) && !line.match(/\/>/)) indentLevel++;
      return formatted;
    })
    .join('\n');
}

document.addEventListener('DOMContentLoaded', () => {
  const htmlInput = document.getElementById('htmlInput');
  const reactOutput = document.getElementById('reactOutput').querySelector('code');
  const copyBtn = document.getElementById('copyBtn');

  htmlInput.addEventListener('input', () => {
    const html = htmlInput.value;
    const reactCode = htmlToReact(html); // From react-converter.js
    const formattedCode = formatCode(reactCode);
    reactOutput.textContent = formattedCode;
  });

  copyBtn.addEventListener('click', () => {
    const text = reactOutput.textContent;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 2000);
    });
  });
});