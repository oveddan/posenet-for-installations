import * as posenet from '@tensorflow-models/posenet';
import * as React from 'react';
import { drawKeypoints, drawSkeleton } from './util';

interface IPosesRendererProps {
  video: HTMLVideoElement,
  showVideo: boolean,
  poses: posenet.Pose[],
  minPoseConfidence: number,
  minPartConfidence: number,
  showPoints: boolean,
  showSkeleton: boolean,
  color: string,
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

    const {width: videoWidth, height: videoHeight} = this.props.video;

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    if (this.props.showVideo) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-videoWidth, 0);
      ctx.drawImage(this.props.video, 0, 0, videoWidth, videoHeight);
      ctx.restore();
    }

    // For each pose (i.e. person) detected in an image, loop through the
    // poses and draw the resulting skeleton and keypoints if over certain
    // confidence scores
    this.props.poses.forEach(({score, keypoints}) => {
      if (score >= this.props.minPoseConfidence) {
        if (this.props.showPoints) {
          drawKeypoints(keypoints, this.props.minPartConfidence, ctx, this.props.color);
        }
        if (this.props.showSkeleton) {
          drawSkeleton(keypoints, this.props.minPartConfidence, ctx, this.props.lineThickness,
            this.props.color);
        }
      }
    });

    requestAnimationFrame(this.updateCanvasFrame);
  }

  public render() {
    return (
      <canvas
        ref={this.canvasRef}
        width={this.props.video.width}
        height={this.props.video.height}
      />
    )
  }
}
