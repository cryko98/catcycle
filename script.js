(() => {
  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Hero: tap the cat, he purrs
  const heroCat = document.getElementById("heroCat");
  const heroHint = document.getElementById("heroHint");
  const purrs = ["prrrrrr...", "PRRRRRR!", "*ding ding*", "full speed purr", "he likes you", "meme wave incoming"];
  let purrCount = 0;
  if (heroCat) {
    heroCat.addEventListener("click", () => {
      heroCat.classList.remove("is-purring");
      void heroCat.offsetWidth; // restart animation
      heroCat.classList.add("is-purring");
      heroHint.textContent = purrs[purrCount++ % purrs.length];
      heroHint.style.color = "var(--tabby-dark)";
    });
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll(".stage, .step, .spec-sheet, .anatomy__art, .parts li, .lore__quote");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
  }

  // Pedal mini game
  const btn = document.getElementById("pedalBtn");
  const wheel = document.getElementById("wheel");
  const speedEl = document.getElementById("speed");
  const timerEl = document.getElementById("timer");
  const bestEl = document.getElementById("best");
  const msgEl = document.getElementById("pedalMsg");
  if (!btn) return;

  const DURATION = 10000;
  let best = 0;
  try { best = Number(localStorage.getItem("catcycle-best")) || 0; } catch (_) {}
  bestEl.textContent = best;

  let running = false;
  let start = 0;
  let taps = [];
  let speed = 0;
  let angle = 0;
  let topSpeed = 0;
  let last = performance.now();

  function loop(now) {
    const dt = (now - last) / 1000;
    last = now;

    if (running) {
      const elapsed = now - start;
      taps = taps.filter((t) => now - t < 1000);
      const target = taps.length * 6.5; // taps/sec -> km/h
      speed += (target - speed) * Math.min(1, dt * 4);
      topSpeed = Math.max(topSpeed, speed);
      timerEl.textContent = Math.max(0, (DURATION - elapsed) / 1000).toFixed(1);
      if (elapsed >= DURATION) finish();
    } else {
      speed *= Math.max(0, 1 - dt * 1.5);
    }

    angle = (angle + speed * dt * 40) % 360;
    wheel.style.transform = `rotate(${angle}deg)`;
    speedEl.textContent = Math.round(speed);
    requestAnimationFrame(loop);
  }

  function finish() {
    running = false;
    const result = Math.round(topSpeed);
    timerEl.textContent = "0.0";
    btn.textContent = "Ride again";
    if (result > best) {
      best = result;
      bestEl.textContent = best;
      try { localStorage.setItem("catcycle-best", String(best)); } catch (_) {}
      msgEl.textContent = `New record: ${result} km/h. Catcycle is impressed.`;
    } else if (result >= 60) {
      msgEl.textContent = `${result} km/h top speed. Riding the meme wave.`;
    } else if (result >= 30) {
      msgEl.textContent = `${result} km/h top speed. Solid. Pedal harder.`;
    } else {
      msgEl.textContent = `${result} km/h. He's barely awake. Try again.`;
    }
  }

  btn.addEventListener("click", () => {
    const now = performance.now();
    if (!running) {
      running = true;
      start = now;
      taps = [];
      topSpeed = 0;
      btn.textContent = "Pedal!";
      msgEl.textContent = "GO GO GO! Keep tapping!";
    }
    taps.push(now);
  });

  requestAnimationFrame(loop);
})();
