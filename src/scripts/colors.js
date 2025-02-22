// colors.js
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(Math.min(k(n) - 3, 9 - k(n)), 1));

  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));

  const toHex = x => x.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const baseHues = {
  error: 0,
  action: 35,
  success: 120,
  info: 210
};

function cycleHue(baseHue, step) {
  return (baseHue + step) % 360;
}

function generateCycledPalette(step) {
  return {
    error: hslToHex(cycleHue(baseHues.error, step), 50, 50),
    errorHover: hslToHex(cycleHue(baseHues.error, step), 50, 55),
    action: hslToHex(cycleHue(baseHues.action, step), 50, 50),
    actionHover: hslToHex(cycleHue(baseHues.action, step), 50, 55),
    success: hslToHex(cycleHue(baseHues.success, step), 50, 50),
    successHover: hslToHex(cycleHue(baseHues.success, step), 50, 55),
    info: hslToHex(cycleHue(baseHues.info, step), 50, 50),
    infoHover: hslToHex(cycleHue(baseHues.info, step), 50, 55)
  };
}

let cycleStep = 0;

function updatePalette() {
  cycleStep += 20;
  const palette = generateCycledPalette(cycleStep);

  const generatedColors = {
    'error': palette.error,
    'error-hover': palette.errorHover,
    'action': palette.action,
    'action-hover': palette.actionHover,
    'success': palette.success,
    'success-hover': palette.successHover,
    'info': palette.info,
    'info-hover': palette.infoHover
  };

  console.log('Generated colors:', generatedColors);

  Object.entries(generatedColors).forEach(([key, color]) => {
    document.documentElement.style.setProperty(`--${key}`, color);
  });

  ['error', 'action', 'success', 'info'].forEach(baseKey => {
    const swatch = document.getElementById(`color-${baseKey}`);
    if (swatch) swatch.style.backgroundColor = generatedColors[baseKey];
  });

  localStorage.setItem('bitui-generated-colors', JSON.stringify(generatedColors));
  console.log('Stored colors:', JSON.parse(localStorage.getItem('bitui-generated-colors')));
}

function initColorCycler() {
  document.addEventListener("DOMContentLoaded", () => {
    const cycleButton = document.getElementById("cycleButton");
    if (!cycleButton) {
      console.warn("Cycle button not found in the DOM.");
      return;
    }
    cycleButton.addEventListener("click", updatePalette);
  });
}

export { initColorCycler };