/**
 * Shared left-gutter geometry for the guitar-string coil and the audio button
 * that sits above it in the navbar. Keep in sync with .container-page (68rem, 2rem inset).
 */

export const CONTAINER_MAX_PX = 68 * 16;
export const CONTAINER_INLINE_GUTTER_PX = 32;

export function containerLeftEdge(viewportWidth: number): number {
  const contentWidth = Math.min(viewportWidth - CONTAINER_INLINE_GUTTER_PX, CONTAINER_MAX_PX);
  return Math.max(0, (viewportWidth - contentWidth) / 2);
}

/**
 * Approximate string-group placement (mirrors ScrollStringCoil groupLayout midpoint).
 * Returns left offset (px) and group width for aligning UI above the strings.
 */
export function stringGutterPlacement(viewportWidth: number): {
  left: number;
  width: number;
  mid: number;
} {
  const narrow = viewportWidth < 640;
  const groupWidth = narrow ? 56 : 92;
  // Match coil side pad ballpark (amp ~ 0.95*3*gap was large; placement uses ~half gutter).
  const sidePad = narrow ? 28 : 40;
  const svgWidth = sidePad * 2 + groupWidth;
  const leftGutter = containerLeftEdge(viewportWidth);

  if (leftGutter < groupWidth + sidePad * 2 + 8) {
    const left = Math.max(6, Math.min(12, leftGutter * 0.25));
    return { left, width: svgWidth, mid: left + svgWidth / 2 };
  }

  const gutterMid = leftGutter / 2;
  const groupMidInSvg = sidePad + groupWidth / 2;
  let left = gutterMid - groupMidInSvg;
  const maxRight = leftGutter - 8;
  if (left + svgWidth > maxRight) {
    left = Math.max(4, maxRight - svgWidth);
  }
  left = Math.max(4, left);
  return { left, width: svgWidth, mid: left + svgWidth / 2 };
}
