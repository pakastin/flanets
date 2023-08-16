export default function orbitPosition (ship, trueAnomaly) {
  const { GM, semimajor, eccentricity, periapsisArgument } = ship.orbit;
  const r = (semimajor * (1 - Math.pow(eccentricity, 2))) /
  (1 + eccentricity * Math.cos(trueAnomaly));
  const flightAngle = Math.atan2(
    (eccentricity * Math.sin(trueAnomaly)),
    (1 + eccentricity * Math.cos(trueAnomaly))
  );
  const v = Math.sqrt(GM * ((2 / r) - (1 - semimajor)));

  const angle = (trueAnomaly + periapsisArgument);

  const x = Math.cos(angle) * r;
  const y = -Math.sin(angle) * r;

  return { x, y, flightAngle, v };
}
