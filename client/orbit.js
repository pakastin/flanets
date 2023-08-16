const { MassProduct } = window.Astronomy;

export default function orbit (object, ship, currentTime) {
  const r = Math.sqrt(Math.pow(ship.x, 2) + Math.pow(ship.y, 2));
  const v = Math.sqrt(Math.pow(ship.vx, 2) + Math.pow(ship.vy, 2));
  const GM = MassProduct(object);

  const positionAngle = Math.atan2(ship.x, ship.y);
  const velocityAngle = Math.atan2(ship.vx, ship.vy);

  const zenithAngle = positionAngle - velocityAngle;

  const flightAngle = Math.PI / 2 - zenithAngle;

  const C = (2 * GM) / (r * Math.pow(v, 2));
  const root = Math.pow(C, 2) - 4 * (1 - C) * -Math.pow(Math.sin(zenithAngle), 2);

  const rp = r * ((-C + Math.sqrt(root)) / (2 * (1 - C)));
  const ra = r * ((-C - Math.sqrt(root)) / (2 * (1 - C)));

  const eccentricity = Math.sqrt(Math.pow(((r * Math.pow(v, 2)) / GM) - 1, 2) * Math.pow(Math.sin(zenithAngle), 2) + Math.pow(Math.cos(zenithAngle), 2));

  const semimajor = 1 / ((2 / r) - (Math.pow(v, 2) / GM));

  const trueAnomaly = Math.atan2(
    (
      ((r * Math.pow(v, 2)) / GM) * Math.sin(zenithAngle) * Math.cos(zenithAngle)
    ),
    (
      ((r * Math.pow(v, 2)) / GM) * Math.pow(Math.sin(zenithAngle), 2) - 1
    )
  );

  const semiminor = Math.sqrt(Math.pow(semimajor, 2) * (1 - eccentricity));

  const periapsisArgument = Math.atan2(ship.y, ship.x) - trueAnomaly;

  const eccentricAnomaly = Math.acos((eccentricity + Math.cos(trueAnomaly)) / (1 + eccentricity * Math.cos(trueAnomaly)));
  const meanMotion = Math.sqrt(GM / Math.pow(semimajor, 3));
  const meanAnomaly = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly);

  return { calculatedAt: currentTime, eccentricity, rp, ra, trueAnomaly, flightAngle, semimajor, semiminor, periapsisArgument, GM, zenithAngle, meanMotion, meanAnomaly };
}
