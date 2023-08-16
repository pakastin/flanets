export default function distance (a, b) {
  const x = b.x - a.x;
  const y = b.y - a.y;

  return {
    x,
    y,
    length: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  };
}
