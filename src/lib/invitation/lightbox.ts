export function calculateLightboxNavigation(
  currentIndex: number,
  totalPhotos: number,
  direction: "next" | "prev"
): number {
  if (totalPhotos <= 1) return 0;

  if (direction === "next") {
    return (currentIndex + 1) % totalPhotos;
  }

  // Prev
  return (currentIndex - 1 + totalPhotos) % totalPhotos;
}
