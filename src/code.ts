function toTitleCase(str: string): string {
  return str.replace(
    /\w[^\s/-]*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
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

function createFrame(name: string, layoutMode: "HORIZONTAL" | "VERTICAL", padding: number = 10, layoutSpacing: number = 10): FrameNode {
  const frame = figma.createFrame();
  frame.expanded = false;
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  frame.name = name;

  frame.layoutMode = layoutMode;
  frame.paddingLeft = padding;
  frame.paddingRight = padding;
  frame.paddingTop = padding;
  frame.paddingBottom = padding;
  frame.itemSpacing = layoutSpacing;
  frame.layoutGrow = 0;
  frame.fills = [];

  frame.clipsContent = false;

  return frame;
}

function createColorFrame(name: string, paintId: string, themeFrame: FrameNode, size: number) {
  const frame = createFrame(name, "HORIZONTAL", 0, 10);
  frame.counterAxisAlignItems = "CENTER";

  const text = figma.createText();
  text.characters = name;
  
  const circle = figma.createEllipse();
  circle.name = name + " Color";
  circle.fillStyleId = paintId;
  circle.resize(size, size);
  circle.cornerRadius = size / 2;

  frame.appendChild(circle);
  frame.appendChild(text);
  themeFrame.appendChild(frame);
  text.locked = true;
}

figma.showUI(__html__);
figma.ui.resize(300, 220);
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'codyhouse-color') {
    let colorCount: number = 0;
    let themeCount: number = 0;
    let currentTheme: string;
    let currentThemeFrame: FrameNode;
    let colors: FrameNode;
    const circle = msg.circles;

    if (circle) {
      colors = createFrame("Codyframe Colors", "HORIZONTAL");
      await figma.loadFontAsync({ family: "Roboto", style: "Regular" })
    }

    for (let line of msg.scss.split("\n")) {
      const theme = /(?!:root, )?\[data-theme="([\w-_ ]+)"\] {/gm;
      const color = /@include defineColorHSL\(--color-([\w-_]+), ?(\d{1,3}), ?(\d{1,3})%, ?(\d{1,3})%\);?/gm;

      let result = theme.exec(line);
      if (result !== null) {
        if (currentThemeFrame !== undefined) colors.appendChild(currentThemeFrame);
        currentTheme = toTitleCase(result[1]);
        themeCount++;
        currentThemeFrame = createFrame(currentTheme, "VERTICAL");
        let text = figma.createText();
        text.characters = currentTheme;
        currentThemeFrame.appendChild(text);
        text.locked = true;
        
      } else if (currentTheme !== null) {
        result = color.exec(line);
        if (result !== null) {
          let paint = figma.createPaintStyle();
          let name = toTitleCase(result[1].replace(/-/gm, '/'));
          let id = currentTheme + '/' + name;
          paint.name = id;
          paint.paints = [{ type: 'SOLID', color: hslToRgb(+result[2], +result[3], +result[4]) }];
          if (circle) {
            createColorFrame(name, paint.id, currentThemeFrame, msg.size);
          }
          colorCount++;
        }
      }
    }

    if (currentThemeFrame !== undefined) colors.appendChild(currentThemeFrame);

    figma.notify(`🎨 Imported ${themeCount} theme${themeCount > 1 ? 's' : ''} and ${colorCount} color${colorCount > 1 ? 's' : ''}!`);
  }
  figma.closePlugin();
}
