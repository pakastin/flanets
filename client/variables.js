const AU = 149597870.7;

export const SOI = [
  100000,
  0.117,
  0.616,
  0.924,
  0.0661,
  0.578,
  48.2,
  54.5,
  51.9,
  86.2,
  0.0661
].map(val => {
  const km = val * Math.pow(10, 6);

  return km / AU;
});

export const objectRadius = [
  696340,
  2439.7,
  6051.8,
  6371,
  1737.4,
  3389.5,
  69911,
  58232,
  25362,
  24622,
  1188.3
].map(km => (km / AU));

export const objects = [
  'Sun',
  'Mercury',
  'Venus',
  'Earth',
  'Moon',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto'
];

export const objectColors = [
  'hsl(60, 80%, 50%)',
  'hsl(0, 0%, 60%)',
  'hsl(0, 30%, 60%)',
  'hsl(220, 80%, 60%)',
  'hsl(0, 0%, 75%)',
  'hsl(0, 80%, 60%)',
  'hsl(30, 80%, 60%)',
  'hsl(45, 80%, 60%)',
  'hsl(190, 80%, 60%)',
  'hsl(200, 80%, 60%)',
  'hsl(30, 10%, 60%)'
];
