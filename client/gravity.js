import distance from './distance.js';

export default function calculateGravity (ship, planet) {
  const dist = distance(ship, planet);

  const gravity = planet.gm / Math.pow(dist.length, 2);

  const x = gravity * dist.x / dist.length;
  const y = gravity * dist.y / dist.length;

  const direction = Math.atan2(x, y);

  return {
    x,
    y,
    direction,
    length: gravity
  };
}
