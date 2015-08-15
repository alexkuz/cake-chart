function radiusFactor(level, factor) {
  return Array.apply(null, { length: level }).reduce((sum, v, k) => sum + Math.pow(factor, k), 0);
}

export default function getSliceRadiusRange(coreRadius, ringWidth, level, factor) {
  return {
    start: level ? coreRadius + ringWidth * radiusFactor(level - 1, factor) : 0,
    end: coreRadius + ringWidth * radiusFactor(level, factor)
  };
}
