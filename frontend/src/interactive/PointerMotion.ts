export const TRAIL_LENGTH = 6;

const damp = (current: number, target: number, rate: number, delta: number) =>
  current + (target - current) * (1 - Math.exp(-rate * delta));

export function normalizePointer(clientX: number, clientY: number, bounds: DOMRect) {
  return {
    x: Math.max(0, Math.min(1, (clientX - bounds.left) / Math.max(1, bounds.width))),
    y: Math.max(0, Math.min(1, 1 - (clientY - bounds.top) / Math.max(1, bounds.height))),
  };
}

export class PointerMotion {
  readonly shaderPointer = new Float32Array([0.5, 0.5, 0, 0]);
  readonly shaderTrail = new Float32Array(TRAIL_LENGTH * 4);
  strength = 0;
  private x = 0.5;
  private y = 0.5;
  private vx = 0;
  private vy = 0;
  private active = false;
  private previousTime = 0;

  move(x: number, y: number, now: number) {
    if (this.active) {
      const elapsed = Math.max(0.008, (now - this.previousTime) / 1000);
      this.vx = Math.max(-3, Math.min(3, (x - this.x) / elapsed));
      this.vy = Math.max(-3, Math.min(3, (y - this.y) / elapsed));
    } else {
      this.shaderPointer.set([x, y, 0, 0]);
      for (let i = 0; i < TRAIL_LENGTH; i++) this.shaderTrail.set([x, y, 0, 0], i * 4);
    }

    this.x = x;
    this.y = y;
    this.previousTime = now;
    this.active = true;
  }

  leave() {
    this.active = false;
    this.vx = 0;
    this.vy = 0;
  }

  step(delta: number, aspect: number) {
    const cursor = this.shaderPointer;
    cursor[0] = damp(cursor[0], this.x, 27, delta);
    cursor[1] = damp(cursor[1], this.y, 27, delta);
    cursor[2] = damp(cursor[2], this.vx, 19, delta);
    cursor[3] = damp(cursor[3], this.vy, 19, delta);
    this.vx *= Math.exp(-delta * 11);
    this.vy *= Math.exp(-delta * 11);
    this.strength = damp(this.strength, Number(this.active), this.active ? 20 : 8, delta);

    let x = cursor[0];
    let y = cursor[1];
    let direction = Math.atan2(cursor[3], cursor[2] * aspect);
    let energy = Math.min(1.4, Math.hypot(cursor[2] * aspect, cursor[3]) * 0.8);

    for (let offset = 0; offset < this.shaderTrail.length; offset += 4) {
      const trail = this.shaderTrail;
      const rate = 16 - offset * 0.43;
      trail[offset] = damp(trail[offset], x, rate, delta);
      trail[offset + 1] = damp(trail[offset + 1], y, rate, delta);
      if (energy > 0.035) trail[offset + 2] = direction;
      trail[offset + 3] = damp(trail[offset + 3], energy, energy > trail[offset + 3] ? rate : 7, delta);
      x = trail[offset];
      y = trail[offset + 1];
      direction = trail[offset + 2];
      energy = trail[offset + 3] * 0.93;
    }
  }
}
