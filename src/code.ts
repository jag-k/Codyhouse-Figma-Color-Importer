function toTitleCase(str: string): string {
  return str.replace(
    /\w[^\s/-]*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

function hexToRgb(hex: string): RGB | null {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs((h / 60) % 2 - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  r += m;
  g += m;
  b += m;

  return { r, g, b };
}


const theme = /(?!:root, )?\[data-theme="([\w-_ ]+)"\] {/gm;
const color = /@include defineColorHSL\(--color-([\w-_]+), (\d{1,3}), (\d{1,3})%, (\d{1,3})%\);/gm;

figma.showUI(__html__);
figma.ui.onmessage = msg => {
  if (msg.type === 'codyhouse-color') {
    let currentTheme: string;
    for (let line of msg.scss.split("\n")) {
      let result = theme.exec(line);
      if (result !== null) {
        currentTheme = result[1];
      } else if (currentTheme !== null) {
        result = color.exec(line);
        console.log(result);
        if (result !== null) {
          let paint = figma.createPaintStyle();
          paint.name = toTitleCase(currentTheme + '/' + result[1].replace(/-/gm, '/'));
          paint.paints = [{ type: 'SOLID', color: hslToRgb(+result[2], +result[3], +result[4]) }];
        }
      }
    }
  }
  figma.closePlugin();
}
