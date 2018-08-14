import * as posenet from '@tensorflow-models/posenet';
import * as React from 'react';
import { OutputStride } from './types';


interface IPoseEstimatorProps {
  net: posenet.PoseNet,
  video: HTMLVideoElement,
  active: boolean,
  outputStride: OutputStride,
  imageScaleFactor: number,
  maxDetections: number,
  scoreThreshold: number,
  nmsRadius: number,
  onPosesEstimated: (poses: posenet.Pose[]) => void
}

const flipHorizontal = true;

export class PoseEstimator extends React.Component<IPoseEstimatorProps> {
  public componentDidMount() {
    this.poseDetectionFrame();
  }

  public render() {
    return null;
  }

  private poseDetectionFrame = async () => {
    const { active, net } = this.props;

    if (active) {
      const poses = await net.estimateMultiplePoses(this.props.video, this.props.imageScaleFactor,
        flipHorizontal, this.props.outputStride, this.props.maxDetections, this.props.scoreThreshold,
        this.props.nmsRadius);

      this.props.onPosesEstimated(poses);
   }

    requestAnimationFrame(this.poseDetectionFrame);
  }
}
