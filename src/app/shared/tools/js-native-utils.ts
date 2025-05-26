export function setTimeoutAsync(
  callback: (() => void) | undefined,
  ms: number,
): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(() => {
      callback?.();
      resolve();
    }, ms),
  );
}

export function getRandomArbitrary(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
