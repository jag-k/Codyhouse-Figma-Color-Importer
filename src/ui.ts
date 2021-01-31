import './ui.css';
import 'figma-plugin-ds/dist/figma-plugin-ds.css';
import 'figma-plugin-ds/dist/iife/figma-plugin-ds.js';


document.getElementById("circles").onchange = (ev) => {
  // @ts-ignore
  const checked = ev.target.checked;
  document.querySelector('.size').classList.toggle('hidden', !checked);
}

document.querySelector('form').onsubmit = (e: Event) => {
  e.preventDefault();
  const scssInput = document.getElementById('scss');
  const circlesInput = document.getElementById('circles');
  const sizeInput = document.getElementById('size');
  // @ts-ignore
  const scss = scssInput.value;
  // @ts-ignore
  const size = +sizeInput.value;
  // @ts-ignore
  const circles = circlesInput.checked;
  parent.postMessage({ pluginMessage: { type: 'codyhouse-color', scss, circles, size } }, '*');
  return false;
};