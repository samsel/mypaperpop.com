type VibrationPattern = number | number[];

let lastHapticAt = 0;

function vibrate(pattern: VibrationPattern) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  const now = performance.now();
  if (now - lastHapticAt < 60) return;
  lastHapticAt = now;

  navigator.vibrate(pattern);
}

export const haptics = {
  selection() {
    vibrate(6);
  },
  light() {
    vibrate(10);
  },
  submit() {
    vibrate(14);
  },
  success() {
    vibrate([8, 36, 12]);
  },
  error() {
    vibrate([24, 24, 24]);
  },
};
