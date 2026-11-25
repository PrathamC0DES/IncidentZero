const glyphs = '0123456789ABCDEF#%/<>{}@+=:.-';
export const ATLAS_COLUMNS = 8;
export const ATLAS_ROWS = Math.ceil(glyphs.length / ATLAS_COLUMNS);
export const GLYPH_COUNT = glyphs.length;

export function createGlyphAtlas() {
  const tileSize = 48;
  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_COLUMNS * tileSize;
  canvas.height = ATLAS_ROWS * tileSize;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Cannot create the ASCII glyph atlas');

  context.font = '37px Consolas, monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#fff';
  [...glyphs].forEach((glyph, index) => {
    const column = index % ATLAS_COLUMNS;
    const row = Math.floor(index / ATLAS_COLUMNS);
    context.fillText(glyph, (column + 0.5) * tileSize, (row + 0.52) * tileSize);
  });
  return canvas;
}

function random(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export function drawAsciiFallback(canvas: HTMLCanvasElement, width: number, height: number, ratio: number) {
  const context = canvas.getContext('2d');
  if (!context) return;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.fillStyle = '#08090d';
  context.fillRect(0, 0, width, height);
  context.font = '10px Consolas, monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  for (let y = 7; y < height; y += 13) {
    for (let x = 5; x < width; x += 9) {
      const u = x / width;
      const v = y / height;
      const curve = 0.47 + Math.sin(u * 9) * 0.13;
      const opacity = Math.exp(-Math.abs(v - curve) * 8) * random(x, y) * 0.36;
      if (opacity < 0.04) continue;
      context.fillStyle = `rgba(168, 179, 210, ${opacity})`;
      context.fillText(glyphs[Math.floor(random(y, x) * glyphs.length)], x, y);
    }
  }
}
