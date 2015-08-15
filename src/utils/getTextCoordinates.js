import getAnglePoint from './getAnglePoint';
import getSliceRadiusRange from './getSliceRadiusRange';

export default function getTextCoordinates(slice, coreRadius, ringWidth, center, factor) {
  const sliceRadiusRange = getSliceRadiusRange(coreRadius, ringWidth, slice.level, factor);
  const c = getAnglePoint(
    (slice.start + slice.end) / 2, 0,
    coreRadius && (sliceRadiusRange.start + sliceRadiusRange.end) / 2, center, center
  );

  if (!slice.level) {
    return { x: 50, y: 50 };
  }

  return {
    x: c.x1 / (center * 2) * 100,
    y: c.y1 / (center * 2) * 100
  };
}
