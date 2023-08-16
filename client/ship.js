export default class Ship {
  constructor ({ x, y, r, ra, attached, throttle }) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.ra = ra;
    this.vx = 0;
    this.vy = 0;
    this.attached = attached;
    this.throttle = throttle;
  }
}
