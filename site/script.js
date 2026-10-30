'use strict';
const workspace = document.querySelector('#workspace');
const directionButton = document.querySelector('#direction');
const status = document.querySelector('#preview-status');
const swatches = document.querySelectorAll('[data-brand].swatch');
function updateStatus() {
  const brand = workspace.dataset.brand;
  status.textContent = `${brand.charAt(0).toUpperCase() + brand.slice(1)} accent · ${workspace.dir === 'rtl' ? 'Right-to-left' : 'Left-to-right'} preview. No production component claims.`;
}
swatches.forEach((button) => {
  button.addEventListener('click', () => {
    workspace.dataset.brand = button.dataset.brand;
    swatches.forEach((swatch) => swatch.setAttribute('aria-pressed', String(swatch === button)));
    updateStatus();
  });
});
directionButton.addEventListener('click', () => {
  const rtl = workspace.dir !== 'rtl';
  workspace.dir = rtl ? 'rtl' : 'ltr';
  directionButton.setAttribute('aria-pressed', String(rtl));
  directionButton.textContent = rtl ? 'Preview LTR' : 'Preview RTL';
  updateStatus();
});
