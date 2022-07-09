interface IRgba {
  r: number;
  g: number;
  b: number;
}

const getRandom255 = (): number => {
  return Math.floor(Math.random() * 255);
};

const getRandomSmallerThan = (n: number): number => {
  return Math.floor(Math.random() * n);
};

const asHexFrom255 = (n: number): string => {
  if (0 > n || n > 255)
    console.error('error in asHexFrom255(n): input must 0 to 255');
  const hex = Math.floor(n).toString(16);
  return hex.length == 1 ? '0' + hex : hex;
};

const uniformGenerator = (): IRgba => {
  return { r: getRandom255(), g: getRandom255(), b: getRandom255() };
};

const totalGenerator = (): IRgba => {
  const r = getRandom255();
  const g = getRandomSmallerThan(255 - r);
  const b = 255 - g - r;
  return { r: r, g: g, b: b };
};

const vividGenerator = (): IRgba => {
  const n = Math.random();
  if (n < 0.3333) return { r: 255, g: getRandom255(), b: getRandom255() };
  else if (n < 0.6666) return { r: getRandom255(), g: 255, b: getRandom255() };
  else return { r: getRandom255(), g: getRandom255(), b: 255 };
};

const thinVividGenerator = (): IRgba => {
  const n = Math.random();
  const upperLim = 100;
  const base = 255;
  const k = getRandomSmallerThan(upperLim);
  const col1 = base - k;
  const col2 = base - getRandomSmallerThan(upperLim - k);
  if (n < 0.3333) return { r: base, g: col1, b: col2 };
  else if (n < 0.6666) return { r: col1, g: base, b: col2 };
  else return { r: col1, g: col2, b: base };
};

const toyGenerator = (): IRgba => {
  const n = Math.random();
  const upperLim = 200;
  const base = 255;
  const k = getRandomSmallerThan(upperLim);
  const col1 = base - k;
  const col2 = getRandom255();
  if (n < 0.3333) return { r: col1, g: col1, b: col2 };
  else if (n < 0.6666) return { r: col1, g: col2, b: col1 };
  else return { r: col2, g: col1, b: col1 };
};

export const getRandomColor = (type: string, algorithm: string): string => {
  const rgba = vividGenerator();
  return (
    '#' + asHexFrom255(rgba.r) + asHexFrom255(rgba.g) + asHexFrom255(rgba.b)
  );
};
