import * as posenet from '@tensorflow-models/posenet';
import * as React from 'react';
import { drawKeypoints, drawSkeleton } from './util';

interface IPosesRendererProps {
  video?: HTMLVideoElement,
  imageSize: {width: number, height: number},
  showVideo: boolean,
  poses?: posenet.Pose[],
  minPoseConfidence: number,
  minPartConfidence: number,
  showPoints: boolean,
  showSkeleton: boolean,
  lineColor: string,
  backgroundColor: string,
  lineThickness: number
}

export default class PosesRenderer extends React.Component<IPosesRendererProps> {
  private canvasRef: React.RefObject<HTMLCanvasElement>;

  constructor(props: IPosesRendererProps) {
    super(props);

    this.canvasRef = React.createRef();
  }

  public componentDidMount() {
    this.updateCanvasFrame();
  }

  public updateCanvasFrame = () => {
    const canvas = this.canvasRef.current;
    if (!canvas) { return }

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const {width, height} = this.props.imageSize;

    ctx.clearRect(0, 0, width, height);

    if (this.props.showVideo && this.props.video) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-width, 0);
      ctx.drawImage(this.props.video, 0, 0, width, height);
      ctx.restore();
    } else {
      ctx.fillStyle = this.props.backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    // For each pose (i.e. person) detected in an image, loop through the
    // poses and draw the resulting skeleton and keypoints if over certain
    // confidence scores
    if (this.props.poses) {
      this.props.poses.forEach(({score, keypoints}) => {
        if (score >= this.props.minPoseConfidence) {
          if (this.props.showPoints) {
            drawKeypoints(keypoints, this.props.minPartConfidence, ctx, this.props.lineColor, this.props.lineThickness / 2);
          }
          if (this.props.showSkeleton) {
            drawSkeleton(keypoints, this.props.minPartConfidence, ctx, this.props.lineThickness,
              this.props.lineColor);
          }
        }
      });
    }

    requestAnimationFrame(this.updateCanvasFrame);
  }

  public render() {
    return (
      <canvas
        ref={this.canvasRef}
        width={this.props.imageSize.width}
        height={this.props.imageSize.height}
      />
    )
  }
}
