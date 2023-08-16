import deltaPosition from './delta-position.js';
import { pointCircleCollide } from './collision.js';
import { objectRadius } from './variables.js';

export default function drawOrbit (objects, objectPositions, ship) {
  const deltas = [];
  const results = [];

  const { x: x0, y: y0 } = deltaPosition(ship, 0);
  const { x: x1, y: y1 } = deltaPosition(ship, Math.PI / 1440000);

  const dx = x1 - x0;
  const dy = -(y1 - y0);

  let dir = 1;

  if (dx * ship.vx < 0 || dy * ship.vy < 0) {
    dir = -1;
  }

  for (let delta = 0; delta < Math.PI / 256; delta += Math.PI / 720000) {
    deltas.push(delta);
  }

  for (let delta = Math.PI / 256; delta < Math.PI; delta += Math.PI / 9000) {
    deltas.push(delta);
  }

  for (let delta = -Math.PI; delta < -Math.PI / 256; delta += Math.PI / 9000) {
    deltas.push(delta);
  }

  for (let delta = -Math.PI / 256; delta <= 0; delta += Math.PI / 720000) {
    deltas.push(delta);
  }

  for (let i = 0; i < deltas.length; i++) {
    const delta = deltas[i];

    const { x, y, v } = deltaPosition(ship, dir * delta);

    if (Number.isNaN(v)) {
      ship.orbit.hyperbolic = true;
      return results;
    }
    ship.orbit.hyperbolic = false;

    const { x: attachX, y: attachY } = objectPositions[ship.attached];

    results.push({ x, y });

    const { x: planetX, y: planetY } = objectPositions[ship.attached];

    const collide = pointCircleCollide({
      x: attachX + x,
      y: attachY + y
    }, {
      x: planetX,
      y: planetY,
      r: objectRadius[ship.attached]
    });

    if (collide) {
      ship.orbit.collide = true;
      return results;
    }
    ship.orbit.collide = false;
  }

  return results;
}
