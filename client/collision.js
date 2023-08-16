export function pointCircleCollide (point, circle) {
  if (circle.r === 0) {
    return false;
  }
  const dx = circle.x - point.x;
  const dy = circle.y - point.y;

  return dx * dx + dy * dy <= circle.r * circle.r;
}

export function lineCircleCollide (a, b, circle, nearest) {
  if (pointCircleCollide(a, circle)) {
    if (nearest) {
      nearest.x = a.x;
      nearest.y = a.y;
    }
    return true;
  }
  if (pointCircleCollide(b, circle)) {
    if (nearest) {
      nearest.x = b.x;
      nearest.y = b.y;
    }
    return true;
  }

  const x1 = a.x;
  const y1 = a.y;
  const x2 = b.x;
  const y2 = b.y;
  const cx = circle.x;
  const cy = circle.y;

  const dx = x2 - x1;
  const dy = y2 - y1;

  const lcx = cx - x1;
  const lcy = cy - y1;

  const dLen2 = dx * dx + dy * dy;
  let px = dx;
  let py = dy;

  if (dLen2 > 0) {
    const dp = (lcx * dx + lcy * dy) / dLen2;
    px *= dp;
    py *= dp;
  }

  if (!nearest) {
    nearest = {
      x: 0,
      y: 0
    };
  }

  nearest.x = x1 + px;
  nearest.y = y1 + py;

  const pLen2 = px * px + py * py;

  return pointCircleCollide(nearest, circle) &&
          pLen2 <= dLen2 && (px * dx + py * dy) >= 0;
}
