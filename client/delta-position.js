import orbitPosition from './orbit-position.js';

export default function deltaPosition (ship, delta) {
  const { trueAnomaly } = ship.orbit;

  return orbitPosition(ship, trueAnomaly + delta);
}
