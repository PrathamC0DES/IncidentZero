export const MAX_PULSES = 16;
export const PULSE_DURATION = 0.9;

export class ClickShockwave {
  // Each pulse occupies four values: normalized x/y, creation time, and strength.
  readonly uniforms = new Float32Array(MAX_PULSES * 4);
  private readonly slots = new Float32Array(MAX_PULSES * 4);
  private next = 0;

  emit(x: number, y: number, time: number, strength = 1) {
    const slot = this.next * 4;
    this.slots.set([x, y, time, strength], slot);
    this.next = (this.next + 1) % MAX_PULSES;
  }

  sample(time: number) {
    let count = 0;
    for (let offset = 0; offset < this.slots.length; offset += 4) {
      const start = this.slots[offset + 2];
      const strength = this.slots[offset + 3];
      if (!strength || time - start >= PULSE_DURATION) continue;

      const target = count * 4;
      this.uniforms[target] = this.slots[offset];
      this.uniforms[target + 1] = this.slots[offset + 1];
      this.uniforms[target + 2] = start;
      this.uniforms[target + 3] = strength;
      count++;
    }
    return count;
  }

  clear() {
    this.slots.fill(0);
    this.next = 0;
  }
}
