import './ui.css';
import 'figma-plugin-ds/dist/figma-plugin-ds.css';

document.querySelector('form').onsubmit = (e: Event) => {
  e.preventDefault();
  const scssBox = document.getElementById('scss');
  // @ts-ignore
  const scss = scssBox.value;
  parent.postMessage({ pluginMessage: { type: 'codyhouse-color', scss } }, '*');
  return false;
};