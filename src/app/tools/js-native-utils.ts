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
