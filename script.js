const c = document.getElementById("c");
var w = (c.width = window.innerWidth),
  h = (c.height = window.innerHeight),
  ctx = c.getContext("2d"),
  opts = {
    len: 44, // Distance particles move per step
    count: 10, // Number of particles
    particleSize: Math.min(w, h) / 20, // Responsive particle size
    baseTime: 10, // Base lifespan of particles
    addedTime: 15, // Random additional lifespan
    dieChance: 0.03, // Chance of particle reset
    spawnChance: 0.8, // Chance of spawning new particles
    sparkChance: 0.4, // Chance of spark emission
    sparkDist: 15, // Distance sparks travel
    sparkSize: 1, // Size of spark squares
    color: "hsl(60,90%,light%)", // Yellow for bees
    baseLight: 50, // Adjusted base lightness for yellow
    addedLight: 20, // Lightness variation
    shadowToTimePropMult: 8, // Shadow effect intensity
    baseLightInputMultiplier: 0.01, // Light variation speed
    addedLightInputMultiplier: 0.03,
    cx: w / 2, // Center x-coordinate
    cy: h / 2, // Center y-coordinate
    repaintAlpha: 0.03, // Canvas fade rate for trails
    hueChange: 0.4, // Hue shift per tick (not used directly now)
  },
  tick = 0,
  particles = [],
  dieX = w / 2 / opts.len,
  dieY = h / 2 / opts.len,
  baseRad = Math.PI / 3; // 60 degrees for hexagonal movement

// Initial canvas setup with dark brown background
ctx.fillStyle = "rgb(50, 30, 0)";
ctx.fillRect(0, 0, w, h);

function loop() {
  window.requestAnimationFrame(loop);
  ++tick;

  // Fade canvas for trail effect
  ctx.globalCompositeOperation = "source-over";
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(50,30,0,alp)".replace("alp", opts.repaintAlpha);
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";

  // Spawn new particles if below count
  if (particles.length < opts.count && Math.random() < opts.spawnChance)
    particles.push(new Particle());

  // Update all particles
  particles.forEach((particle) => particle.step());
}

function Particle() {
  this.reset();
}

Particle.prototype.reset = function () {
  this.x = 0;
  this.y = 0;
  this.addedX = 0;
  this.addedY = 0;
  this.rad = 0;

  this.lightInputMultiplier =
    opts.baseLightInputMultiplier +
    opts.addedLightInputMultiplier * Math.random();

  // Set particle color to yellow with varying lightness
  this.color = opts.color.replace("light", 50 + Math.random() * 20);
  this.cumulativeTime = 0;

  this.beginPhase();
};

Particle.prototype.beginPhase = function () {
  this.x += this.addedX;
  this.y += this.addedY;

  this.time = 0;
  this.targetTime = (opts.baseTime + opts.addedTime * Math.random()) | 0;

  // Set movement direction with hexagonal angles and bee-like wobble
  this.rad = baseRad * Math.floor(Math.random() * 6);
  this.rad += (Math.random() - 0.5) * (Math.PI / 12); // Add random deviation
  this.addedX = Math.cos(this.rad) * (0.5 + Math.random());
  this.addedY = Math.sin(this.rad) * (0.5 + Math.random());

  // Reset if out of bounds or random death
  if (
    Math.random() < opts.dieChance ||
    this.x > dieX ||
    this.x < -dieX ||
    this.y > dieY ||
    this.y < -dieY
  )
    this.reset();
};

Particle.prototype.step = function () {
  ++this.time;
  ++this.cumulativeTime;

  if (this.time >= this.targetTime) this.beginPhase();

  var prop = this.time / this.targetTime,
    wave = Math.sin((prop * Math.PI) / 2),
    x = this.addedX * wave,
    y = this.addedY * wave;

  ctx.shadowBlur = prop * opts.shadowToTimePropMult;
  ctx.fillStyle = ctx.shadowColor = this.color;

  // Draw hexagon particle
  ctx.beginPath();
  for (var i = 0; i < 6; i++) {
    var angle = (i * Math.PI) / 3;
    var px =
      opts.cx + (this.x + x) * opts.len + Math.cos(angle) * opts.particleSize;
    var py =
      opts.cy + (this.y + y) * opts.len + Math.sin(angle) * opts.particleSize;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Draw simplified spark as an orange square
  if (Math.random() < opts.sparkChance) {
    var sparkX =
      opts.cx +
      (this.x + x) * opts.len +
      Math.random() * opts.sparkDist * (Math.random() < 0.5 ? 1 : -1) -
      opts.sparkSize / 2;
    var sparkY =
      opts.cy +
      (this.y + y) * opts.len +
      Math.random() * opts.sparkDist * (Math.random() < 0.5 ? 1 : -1) -
      opts.sparkSize / 2;
    ctx.fillStyle = "hsl(30,90%,50%)"; // Orange spark
    ctx.fillRect(sparkX, sparkY, opts.sparkSize, opts.sparkSize);
  }
};

// Start animation
window.onload = function () {
  loop();
};

// Handle window resize
window.addEventListener("resize", function () {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  ctx.fillStyle = "rgb(50, 30, 0)";
  ctx.fillRect(0, 0, w, h);

  opts.cx = w / 2;
  opts.cy = h / 2;
  dieX = w / 2 / opts.len;
  dieY = h / 2 / opts.len;
  opts.particleSize = Math.min(w, h) / 20; // Update particle size on resize
});
