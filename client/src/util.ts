import * as posenet from '@tensorflow-models/posenet';

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isMobile() {
  return isAndroid() || isiOS();
}

function toTuple({y, x}: {x: number, y: number}): NumberTuple {
  return [y, x];
}

export function drawPoint(
    ctx: CanvasRenderingContext2D, y: number, x: number, r: number,
    color: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

type NumberTuple = [number, number];

/**
 * Draws a line on a canvas, i.e. a joint
 */
export function drawSegment(
    [ay, ax]: NumberTuple, [by, bx]: NumberTuple, lineWidth: number,
    color: string, scale: number, ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

/**
 * Draws a pose skeleton by looking up all adjacent keypoints/joints
 */
export function drawSkeleton(
    keypoints: posenet.Keypoint[], minConfidence: number,
    ctx: CanvasRenderingContext2D, lineThickness: number, color: string,
    scale = 1) {
  const adjacentKeyPoints =
      posenet.getAdjacentKeyPoints(keypoints, minConfidence);

  adjacentKeyPoints.forEach((adjacentKeyPoint) => {
    drawSegment(
        toTuple(adjacentKeyPoint[0].position),
        toTuple(adjacentKeyPoint[1].position), lineThickness, color, scale,
        ctx);
  });
}

/**
 * Draw pose keypoints onto a canvas
 */
export function drawKeypoints(
    keypoints: posenet.Keypoint[], minConfidence: number,
    ctx: CanvasRenderingContext2D, color: string, size = 3, scale = 1) {
  for (const keypoint of keypoints) {
    if (keypoint.score < minConfidence) {
      continue;
    }

    const {y, x} = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, size, color);
  }
}

/**
 * Draw an image on a canvas
 */
export function renderImageToCanvas(
    image: HTMLImageElement, size: [number, number],
    canvas: HTMLCanvasElement) {
  canvas.width = size[0];
  canvas.height = size[1];
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  ctx.drawImage(image, 0, 0);
}
