import { pointCircleCollide } from './collision.js';
import distance from './distance.js';
import drawOrbit from './draw-orbit.js';
import calculateGravity from './gravity.js';
import orbit from './orbit.js';
import Ship from './ship.js';
import { objectColors, objectRadius, objects, SOI } from './variables.js';
import deltaPosition from './delta-position.js';

const timeModes = [1, 5, 25, 100, 500, 1000, 5000, 10000, 50000];
let timeMode = 1;

const { BaryState, Body, MassProduct } = window.Astronomy;

const AU = 1.496 * Math.pow(10, 8);
const DAY = 86400;
const BASE_FPS = 60;
const SHIP_UPDATE_FPS = BASE_FPS;

const $scene = document.querySelector('#scene');
const $canvas = document.querySelector('#canvas');
const $speed = document.querySelector('#speed');
const $ship = document.querySelector('#ship');
const $fire = document.querySelector('#fire');
const $throttle = document.querySelector('#throttle');
const $locate = document.querySelector('.button.locate');
const $intro = document.querySelector('#intro');
const $keys = document.querySelector('#keys');

$keys.textContent = 'up = throttle, left/right = turn, 1–9 speed of simulation, +/- = zoom';

let FOCUS = 0;
let lastSOIChange = 0;

const cameraDiff = {
  x: 0,
  y: 0
};

const ctx = $canvas.getContext('2d');

const keyDown = {};

const objectPositions = [];

$locate.onclick = () => {
  $locate.classList.add('disabled');
  if (intro) {
    intro = false;
    SCALE = INIT_SCALE;
    $intro.textContent = '';
  }
  FOCUS = 0;
  cameraDiff.x = 0;
  cameraDiff.y = 0;
};

$throttle.onmousedown = $throttle.ontouchstart = (e) => {
  const $bar = $throttle.querySelector('.bar');
  const $amount = $throttle.querySelector('.amount');
  const height = $throttle.clientHeight;
  const startPos = {
    y: (e.touches ? e.touches[0] : e).pageY
  };
  const startThrottle = ship.throttle;
  function mousemove (e) {
    const pos = {
      y: (e.touches ? e.touches[0] : e).pageY
    };
    const diff = {
      y: pos.y - startPos.y
    };
    ship.throttle = startThrottle - (diff.y / height);
    ship.throttle = Math.max(0, Math.min(1, ship.throttle));
    $amount.textContent = `${Math.round(ship.throttle * 100)} %`;
    $bar.style.height = ship.throttle * 100 + '%';
  }
  function mouseup (e) {
    window.removeEventListener('mousemove', mousemove);
    window.removeEventListener('mouseup', mouseup);
    $throttle.removeEventListener('touchmove', mousemove);
    $throttle.removeEventListener('touchend', mouseup);
  }
  window.addEventListener('mousemove', mousemove);
  window.addEventListener('mouseup', mouseup);
  $throttle.addEventListener('touchmove', mousemove);
  $throttle.addEventListener('touchend', mouseup);
};

[['up', 38], ['left', 37], ['right', 39], ['plus', '+'], ['minus', '-']].forEach(([className, keyCode]) => {
  const $button = document.querySelector(`.${className}`);

  const keyUp = function () {
    keyDown[keyCode] = false;
    $button.onmouseup = $button.onmouseleave = $button.ontouchend = null;
    $button.classList.remove('active');
  };

  $button.onmousedown = $button.ontouchstart = () => {
    keyDown[keyCode] = true;
    $button.onmouseup = $button.onmouseleave = $button.ontouchend = keyUp;
    $button.classList.add('active');
  };
});

['backward', 'forward'].forEach(className => {
  const $button = document.querySelector(`.${className}`);
  const keyUp = function () {
    $button.onmouseup = $button.onmouseleave = $button.ontouchend = null;
    $button.classList.remove('active');
  };

  $button.onmousedown = $button.ontouchstart = () => {
    $button.onmouseup = $button.onmouseleave = $button.ontouchend = keyUp;
    if (className === 'forward') {
      timeMode += 1;
    } else if (className === 'backward') {
      timeMode -= 1;
    }
    timeMode = Math.max(1, timeMode);
    timeMode = Math.min(9, timeMode);
    $button.classList.add('active');
  };
});

window.addEventListener('keydown', (e) => {
  if (e.key === '+' || e.key === '-') {
    keyDown[e.key] = true;
    if (e.key === '+') {
      document.querySelector('.button.plus').classList.add('active');
    } else {
      document.querySelector('.button.minus').classList.add('active');
    }
  } else {
    keyDown[e.which] = true;
    if (e.which === 38) {
      document.querySelector('.button.up').classList.add('active');
    } else if (e.which === 37) {
      document.querySelector('.button.left').classList.add('active');
    } else if (e.which === 39) {
      document.querySelector('.button.right').classList.add('active');
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === '+' || e.key === '-') {
    keyDown[e.key] = false;
    if (e.key === '+') {
      document.querySelector('.button.plus').classList.remove('active');
    } else {
      document.querySelector('.button.minus').classList.remove('active');
    }
  } else {
    keyDown[e.which] = false;
    if (e.which === 38) {
      document.querySelector('.button.up').classList.remove('active');
    } else if (e.which === 37) {
      document.querySelector('.button.left').classList.remove('active');
    } else if (e.which === 39) {
      document.querySelector('.button.right').classList.remove('active');
    }
  }
});

const MIN_SCALE = 5;
const MAX_SCALE = 50000000000;
const INIT_SCALE = 50000000000;
let SCALE = 5;

let intro = true;

const startTime = Date.now();
let launchTime = 0;
let currentTime = startTime;
let lastTime = Date.now();
let accumulator = 0;

const ship = new Ship({
  // x: objectRadius[2] * 1,
  // y: -objectRadius[2] * 2,
  // r: 0,
  r: -90.2,
  x: objectRadius[3] * 0,
  y: objectRadius[3] * 1,
  ra: 0,
  attached: 3,
  throttle: 1
});

const scene = {
  x: 0,
  y: 0
};

ship.future = [];

updatePositions();
updateShip(1000 / SHIP_UPDATE_FPS);

function updateShip (deltaTime, once) {
  const dpr = window.devicePixelRatio || 1;

  currentTime += deltaTime;
  const FPD = DAY * (1000 / deltaTime);
  const FPS = 1000 / deltaTime;
  ship.future = [];

  let shipX = ship.x;
  let shipY = ship.y;

  let shipVx = ship.vx;
  let shipVy = ship.vy;

  const { x: attachX, y: attachY } = objectPositions[ship.attached];

  ship.gravity = calculateGravity({
    x: attachX + ship.x,
    y: attachY + ship.y
  }, {
    x: attachX,
    y: attachY,
    gm: MassProduct(objects[ship.attached])
  });

  shipVx += ship.gravity.x / FPD;
  shipVy += ship.gravity.y / FPD;

  shipX += shipVx / FPD;
  shipY += shipVy / FPD;

  const planet = { x: attachX, y: attachY, r: objectRadius[ship.attached] };

  if (pointCircleCollide({
    x: attachX + shipX,
    y: attachY + shipY
  }, planet)) {
    const dx = -ship.x;
    const dy = -ship.y;

    const angle = Math.atan2(dy, dx);

    const diffX = Math.cos(angle) * objectRadius[ship.attached];
    const diffY = Math.sin(angle) * objectRadius[ship.attached];

    shipX = (dx * diffX > 0 ? -1 : 1) * diffX;
    shipY = (dy * diffY > 0 ? -1 : 1) * diffY;

    shipVx = 0;
    shipVy = 0;
  }

  ship.x = shipX;
  ship.y = shipY;
  ship.vx = shipVx;
  ship.vy = shipVy;
  ship.v = Math.sqrt(Math.pow(ship.vx, 2) + Math.pow(ship.vy, 2));

  if (!intro && keyDown[38]) {
    if (!launchTime) {
      launchTime = Date.now();
    }
    if (timeMode > 3) {
      timeMode = 3;
    }
    const acc = ship.throttle * 4 * 0.5;
    const sax = (Math.cos((ship.r) * Math.PI / 180)) * acc;
    const say = (-Math.sin((ship.r) * Math.PI / 180)) * acc;

    ship.vx += sax / FPD;
    ship.vy += say / FPD;
    ship.acc = 1;
  } else {
    ship.acc = 0;
  }

  if (!once) {
    if (keyDown[49]) {
      timeMode = 1;
    } else if (keyDown[50]) {
      timeMode = 2;
    } else if (keyDown[51]) {
      timeMode = 3;
    } else if (keyDown[52]) {
      timeMode = 4;
    } else if (keyDown[53]) {
      timeMode = 5;
    } else if (keyDown[54]) {
      timeMode = 6;
    } else if (keyDown[55]) {
      timeMode = 7;
    } else if (keyDown[56]) {
      timeMode = 8;
    } else if (keyDown[57]) {
      timeMode = 9;
    }
    if (keyDown[38] && timeMode > 3) {
      timeMode = 3;
    }
    if (timeMode > 1) {
      const iterations = timeModes[timeMode - 1] / 3;

      for (let i = 0; i < iterations; i++) {
        updateShip(1000 / SHIP_UPDATE_FPS * 3, true);
      }
    }
    if (keyDown[37]) {
      ship.r -= 60 / FPS;
    }
    if (keyDown[39]) {
      ship.r += 60 / FPS;
    }
    if (!intro) {
      if (FOCUS === 0 && (keyDown['+'] || keyDown['-'])) {
        cameraDiff.x = 0;
        cameraDiff.y = 0;
        FOCUS = -1;
        $locate.classList.remove('disabled');
      }
      if (keyDown['+']) {
        zoom(5, {
          x: 0.5,
          y: 0.5
        });
      }
      if (keyDown['-']) {
        zoom(-5, {
          x: 0.5,
          y: 0.5
        });
      }
    }

    ship.orbit = orbit(objects[ship.attached], ship, currentTime);
    ship.orbitPoints = drawOrbit(objects, objectPositions, ship);

    if (ship.orbitPoints.length > 2) {
      const minX = Math.min(...ship.orbitPoints.map(({ x, y }) => x));
      const maxX = Math.max(...ship.orbitPoints.map(({ x, y }) => x));
      const minY = Math.min(...ship.orbitPoints.map(({ x, y }) => y));
      const maxY = Math.max(...ship.orbitPoints.map(({ x, y }) => y));

      ship.orbit.x = minX + (maxX - minX) / 2;
      ship.orbit.y = -(minY + (maxY - minY) / 2);
      ship.orbit.w = maxX - minX;
      ship.orbit.h = maxY - minY;
    } else {
      ship.orbit.x = null;
      ship.orbit.y = null;
    }

    if (intro) {
      $locate.classList.remove('disabled');
      if (keyDown[27]) {
        intro = false;
        SCALE = INIT_SCALE;
        $locate.classList.add('disabled');
      }
      if (SCALE < INIT_SCALE) {
        const diff = Date.now() - startTime;
        if (diff < 1000) {
          $intro.textContent = '';
        } else if (diff < 3000) {
          $intro.textContent = 'Welcome to Flanets!';
        } else if (diff < 5500) {
          $intro.textContent = 'Fly around in your space ship with realistic gravity';
        } else if (diff < 8000) {
          $intro.textContent = 'and planets where they actually are right now in our galaxy';
        } else {
          $intro.textContent = 'Have fun!';
        }
        const rate = SCALE < 20
          ? 1 + 1 * (SCALE / 20)
          : SCALE < 200 ? (2 + 2 * SCALE / 200) : 4;

        zoom(rate, {
          x: 0.5,
          y: 0.5
        });
      } else {
        $locate.classList.add('disabled');
        intro = false;
        $intro.textContent = '';
      }
    }
  }

  if (FOCUS === 0) {
    if (!ship.orbit.hyperbolic && ship.orbitPoints.length > 2) {
      const targetScale = Math.min(MAX_SCALE, Math.min((0.4 * window.innerWidth * dpr) / ship.orbit.w, (0.4 * window.innerHeight * dpr) / ship.orbit.h));

      SCALE += (targetScale - SCALE) * 0.01;
    }
  }
}

function updatePositions () {
  objects.forEach((object, i) => {
    if (i === 0) {
      objectPositions[i] = { x: 0, y: 0 };
      return;
    }
    const { x, y } = getPosition(objects[i], currentTime);

    objectPositions[i] = { x, y };
  });

  let newSOI;

  objects.forEach((object, i) => {
    const radius = SOI[i];

    const { length: dist } = distance({
      x: objectPositions[ship.attached].x + ship.x,
      y: objectPositions[ship.attached].y + ship.y
    }, objectPositions[i]);

    if (dist < radius) {
      newSOI = i;
    }
  });

  if (newSOI != null && newSOI !== ship.attached) {
    if (lastSOIChange < currentTime - 60 * 60 * 1000) {
      lastSOIChange = currentTime;
      const x = objectPositions[ship.attached].x + ship.x;
      const y = objectPositions[ship.attached].y + ship.y;

      ship.attached = newSOI;
      ship.x = x - objectPositions[ship.attached].x;
      ship.y = y - objectPositions[ship.attached].y;
    }
  }
}

setInterval((step) => {
  const deltaTime = Date.now() - lastTime;

  accumulator += deltaTime;

  while (accumulator > step) {
    accumulator -= step;
    updateShip(step);
  }

  lastTime = Date.now();
}, 1000 / SHIP_UPDATE_FPS, 1000 / SHIP_UPDATE_FPS);
setInterval(updatePositions, 1000 / BASE_FPS);

function render () {
  window.requestAnimationFrame(render);

  const dpr = window.devicePixelRatio || 1;

  ctx.scale(dpr, dpr);

  const trueCenter = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  };

  const center = {
    x: window.innerWidth * dpr / 2,
    y: window.innerHeight * dpr / 2
  };

  if (FOCUS === 0) {
    scene.x = -(objectPositions[ship.attached].x + ship.x);
    scene.y = objectPositions[ship.attached].y + ship.y;
  } else {
    scene.x = -(objectPositions[ship.attached].x + ship.x) + cameraDiff.x;
    scene.y = objectPositions[ship.attached].y + ship.y + cameraDiff.y;
  }

  const shipScale = Math.max(intro ? 0 : 15, SCALE / 1000000000);

  const shipX = objectPositions[ship.attached].x + ship.x;
  const shipY = objectPositions[ship.attached].y + ship.y;

  const shipTransform = `translate(${trueCenter.x + (scene.x + shipX) * SCALE / dpr}px, ${trueCenter.y + (scene.y - shipY) * SCALE / dpr}px) rotate(${ship.r}deg) scale(${shipScale})`;

  $ship.style.transform = shipTransform;

  if (keyDown[38] && !keyDown[16] && ship.throttle) {
    $fire.style.opacity = '';
  } else {
    $fire.style.opacity = 0;
  }

  $canvas.style.width = window.innerWidth + 'px';
  $canvas.style.height = window.innerHeight + 'px';

  $canvas.width = window.innerWidth * dpr;
  $canvas.height = window.innerHeight * dpr;

  const points = ship.orbitPoints.map(({ x, y }, i) => {
    return {
      x: center.x + (scene.x + objectPositions[ship.attached].x + x) * SCALE,
      y: center.y + (scene.y - objectPositions[ship.attached].y + y) * SCALE
    };
  });

  ctx.fillStyle = 'hsl(270, 60%, 10%)';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.beginPath();
  points.forEach(({ x, y }, i) => {
    ctx[i ? 'lineTo' : 'moveTo'](x, y);
  });
  ctx.lineWidth = 1.5 * dpr;
  ctx.strokeStyle = 'hsl(0, 0%, 90%)';
  ctx.stroke();

  objects.forEach((object, i) => {
    const { x, y } = objectPositions[i];
    const scale = Math.max(3, objectRadius[i] * SCALE);

    if (objects[i] === 'Earth') {
      ctx.beginPath();
      ctx.arc(center.x + (scene.x + x) * SCALE, center.y + (scene.y - y) * SCALE, scale * 1.015, 0, 2 * Math.PI);
      ctx.fillStyle = objectColors[i].replace('hsl', 'hsla').replace(')', ', 0.25)');
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(center.x + (scene.x + x) * SCALE, center.y + (scene.y - y) * SCALE, scale, 0, 2 * Math.PI);
    ctx.fillStyle = objectColors[i];
    ctx.fill();

    ctx.font = `${dpr > 1 ? 16 : 8}px -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, roboto, noto, arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const tx = center.x + (scene.x + x) * SCALE;
    const ty = center.y + (scene.y - y) * SCALE + scale + (dpr > 1 ? 12 : 9);

    ctx.fillStyle = 'hsla(0, 0%, 0%, 0.9)';
    ctx.fillText(objects[i], tx - 1, ty - 1);
    ctx.fillText(objects[i], tx + 1, ty - 1);
    ctx.fillText(objects[i], tx - 1, ty + 1);
    ctx.fillText(objects[i], tx + 1, ty + 1);

    ctx.fillStyle = 'hsla(0, 0%, 100%, 0.9)';
    ctx.fillText(objects[i], tx, ty);
  });

  const velocity = Math.sqrt(Math.pow(ship.vx, 2) + Math.pow(ship.vy, 2));
  const altitude = Math.sqrt(Math.pow(ship.x, 2) + Math.pow(ship.y, 2)) - objectRadius[ship.attached];
  const direction = Math.atan2(ship.vx, ship.vy) * 180 / Math.PI;
  let offsetAngle = Math.round((90 + ship.r) - direction);

  if (offsetAngle < -180) {
    offsetAngle += 360;
  } else if (offsetAngle > 180) {
    offsetAngle -= 360;
  }

  $speed.innerHTML = `${new Date(currentTime).toLocaleString()}${(timeMode > 1) ? ` (${humanTimeMode(timeMode)})` : ''}<br>${humanDirection(direction)} (${(offsetAngle > 0 ? '+' : '') + offsetAngle}° → ${humanDirection(90 + ship.r)})<br>${humanVelocity(velocity)}${ship.acc ? ` (+${(ship.throttle * 4).toFixed(2)} G)` : ''}, ${humanAltitude(altitude)}<br>${(launchTime) ? humanT(currentTime - launchTime) : ''}`;
}

window.addEventListener('touchstart', (e) => {
  e.preventDefault();
});

window.addEventListener('touchmove', (e) => {
  e.preventDefault();
});

$scene.onmousedown = $scene.ontouchstart = e => {
  e.preventDefault();

  let lastTouches;
  let lastScale;
  let lastCameraDiff;
  const mouseStart = {
    x: (e.touches ? e.touches[0] : e).pageX,
    y: (e.touches ? e.touches[0] : e).pageY
  };
  const diff = {};
  const cameraDiffStart = {
    x: cameraDiff.x,
    y: cameraDiff.y
  };
  const onmousemove = (e) => {
    e.preventDefault();

    if (intro) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;

    if (e.touches && e.touches.length === 2) {
      const touch1 = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      };

      const touch2 = {
        x: e.touches[1].pageX,
        y: e.touches[1].pageY
      };

      const touchCenter = {
        x: touch1.x + (touch2.x - touch1.x),
        y: touch1.y + (touch2.y - touch2.y)
      };

      const touchDistance = Math.sqrt(Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2));

      if (lastTouches && lastTouches.length === 2) {
        const previousTouch1 = {
          x: lastTouches[0].pageX,
          y: lastTouches[0].pageY
        };
        const previousTouch2 = {
          x: lastTouches[1].pageX,
          y: lastTouches[1].pageY
        };
        const previousTouchDistance = Math.sqrt(Math.pow(previousTouch2.x - previousTouch1.x, 2) + Math.pow(previousTouch2.y - previousTouch1.y, 2));
        const factor = touchDistance / previousTouchDistance;
        const oldScale = lastScale;
        SCALE = factor * SCALE;
        const diff = {
          x: (touchCenter.x - window.innerWidth / 2),
          y: (touchCenter.y - window.innerHeight / 2)
        };
        const sceneDiff = {
          x: diff.x / SCALE - diff.x / oldScale,
          y: diff.y / SCALE - diff.y / oldScale
        };
        if (FOCUS === 0) {
          cameraDiff.x = 0;
          cameraDiff.y = 0;
          cameraDiffStart.x = 0;
          cameraDiffStart.y = 0;
          FOCUS = -1;
          $locate.classList.remove('disabled');
        }
        cameraDiff.x = lastCameraDiff.x + sceneDiff.x;
        cameraDiff.y = lastCameraDiff.y + sceneDiff.y;
      }
      lastTouches = e.touches;
      lastScale = SCALE;
      lastCameraDiff = {
        ...cameraDiff
      };
      return;
    }
    lastTouches = e.touches;
    lastScale = SCALE;
    lastCameraDiff = {
      ...cameraDiff
    };

    if (FOCUS === 0) {
      cameraDiff.x = 0;
      cameraDiff.y = 0;
      cameraDiffStart.x = 0;
      cameraDiffStart.y = 0;
      FOCUS = -1;
      $locate.classList.remove('disabled');
    }

    const mouse = {
      x: (e.touches ? e.touches[0] : e).pageX,
      y: (e.touches ? e.touches[0] : e).pageY
    };

    diff.x = (mouse.x - mouseStart.x) / SCALE * dpr;
    diff.y = (mouse.y - mouseStart.y) / SCALE * dpr;

    cameraDiff.x = cameraDiffStart.x + diff.x;
    cameraDiff.y = cameraDiffStart.y + diff.y;
  };
  const onmouseup = () => {
    window.removeEventListener('mousemove', onmousemove);
    window.removeEventListener('touchmove', onmousemove);
    window.removeEventListener('mouseup', onmouseup);
    window.removeEventListener('touchend', onmouseup);
  };
  window.addEventListener('mousemove', onmousemove);
  window.addEventListener('touchmove', onmousemove);
  window.addEventListener('mouseup', onmouseup);
  window.addEventListener('touchend', onmouseup);
};

window.addEventListener('wheel', (e) => {
  if (e.deltaY === 0 || intro) {
    return;
  }

  if (FOCUS > -1) {
    cameraDiff.x = 0;
    cameraDiff.y = 0;
    FOCUS = -1;
    $locate.classList.remove('disabled');
  }

  zoom(-e.deltaY / 16, {
    x: (e.pageX / window.innerWidth),
    y: (e.pageY / window.innerHeight)
  });
}, { passive: false });

function zoom (delta, center) {
  const dpr = window.devicePixelRatio || 1;
  const oldScale = SCALE;

  SCALE += delta * SCALE * 0.01;

  if (SCALE < MIN_SCALE) {
    SCALE = MIN_SCALE;
  } else if (SCALE > MAX_SCALE) {
    SCALE = MAX_SCALE;
  }

  const diff = {
    x: (center.x * window.innerWidth - window.innerWidth / 2) * dpr,
    y: (center.y * window.innerHeight - window.innerHeight / 2) * dpr
  };

  const sceneDiff = {
    x: diff.x / SCALE - diff.x / oldScale,
    y: diff.y / SCALE - diff.y / oldScale
  };

  cameraDiff.x += sceneDiff.x;
  cameraDiff.y += sceneDiff.y;
}

render();

function parseQuery () {
  const results = {};

  if (location.search.length) {
    location.search.slice(1).split('&').map(param => param.split('=')).forEach(([key, value = true]) => {
      results[key] = value;
    });
  }

  return results;
}

function getPosition (object, date) {
  return BaryState(Body[object], new Date(date));
}

function humanT (time) {
  const s = Math.floor((time / 1000)) % 60;
  const m = Math.floor((time / 1000 / 60)) % 60;
  const h = Math.floor((time / 1000 / 60 / 60)) % 24;
  const d = Math.floor((time / 1000 / 60 / 60 / 24));

  if (d) {
    return `T+${d}:${pad(h)}:${pad(m)}:${pad(s)}`;
  } else {
    return `T+${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function pad (val) {
    return ('0' + val).slice(-2);
  }
}

function humanVelocity (auperday) {
  const kmh = auperday * AU / 24;

  return Math.round(kmh) + ' km/h';
}

function humanAltitude (au) {
  const km = au * AU;

  if (km < 2) {
    return Math.round(km * 1000) + ' m';
  } else if (km < 10) {
    return km.toFixed(2) + ' km';
  } else if (km < 100) {
    return km.toFixed(1) + ' km';
  } else {
    return Math.round(km) + ' km';
  }
}

function humanDirection (deg) {
  if (deg < 0) {
    deg += 360;
  }
  return ('00' + Math.round(deg || 0) % 360).slice(-3) + '°';
}

function humanTimeMode (timeMode) {
  if (timeMode > 1) {
    return timeModes[timeMode - 1] + 'x';
  } else {
    return '';
  }
}
