export type RovingKey =
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Home"
  | "End";

export type ActivationKey = "Enter" | " ";

export function getNextFocusIndex(
  currentIndex: number,
  key: string,
  total: number
): number {
  if (total <= 0 || currentIndex < 0) {
    return -1;
  }

  const normalized = (index: number) => (index + total) % total;

  switch (key) {
    case "ArrowDown":
    case "ArrowRight":
      return normalized(currentIndex + 1);
    case "ArrowUp":
    case "ArrowLeft":
      return normalized(currentIndex - 1);
    case "Home":
      return 0;
    case "End":
      return total - 1;
    default:
      return currentIndex;
  }
}

export function isActivationKey(key: string): key is ActivationKey {
  return key === "Enter" || key === " ";
}

export function isRovingKey(key: string): key is RovingKey {
  return (
    key === "ArrowUp" ||
    key === "ArrowDown" ||
    key === "ArrowLeft" ||
    key === "ArrowRight" ||
    key === "Home" ||
    key === "End"
  );
}
