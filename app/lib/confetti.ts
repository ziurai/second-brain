const COLORS = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#c77dff", "#ff9ff3", "#f9844a", "#ffffff"];

export function burst(originEl: HTMLElement) {
  const rect = originEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  Array.from({ length: 22 }).forEach((_, i) => {
    const el = document.createElement("div");
    const color = COLORS[i % COLORS.length];
    const angle = (Math.PI * 2 * i) / 22 + (Math.random() - 0.5) * 0.6;
    const dist = 28 + Math.random() * 52;
    const size = 4 + Math.random() * 6;
    const isCircle = Math.random() > 0.45;
    const rotation = Math.random() * 540 - 270;

    Object.assign(el.style, {
      position: "fixed",
      left: `${cx}px`,
      top: `${cy}px`,
      width: `${size}px`,
      height: `${size}px`,
      background: color,
      borderRadius: isCircle ? "50%" : "2px",
      pointerEvents: "none",
      zIndex: "9999",
    });

    document.body.appendChild(el);

    el.animate(
      [
        { transform: "translate(-50%,-50%) scale(1.4)", opacity: 1 },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0) rotate(${rotation}deg)`,
          opacity: 0,
        },
      ],
      { duration: 580 + Math.random() * 180, easing: "ease-out", fill: "forwards" }
    );

    setTimeout(() => el.remove(), 800);
  });
}
