import * as posenet from '@tensorflow-models/posenet';
import * as React from 'react';
import { OutputStride, IModelState } from './types';


interface IPoseEstimatorProps {
  model: IModelState,
  video: HTMLVideoElement,
  active: boolean,
  outputStride: string,
  imageScaleFactor: number,
  maxDetections: number,
  scoreThreshold: number,
  nmsRadius: number,
  onPosesEstimated: (poses: posenet.Pose[], imageSize: {width: number, height: number}) => void
}

const flipHorizontal = true;

export class PoseEstimator extends React.Component<IPoseEstimatorProps> {
  private mounted?: boolean

  public componentDidMount() {
    this.mounted = true;
    this.poseDetectionFrame();
  }

  public componentWillUnmount() {
    this.mounted = false;
  }

  public render() {
    return null;
  }

  private poseDetectionFrame = async () => {
    const { active, model: { net, loadingStatus }}  = this.props;

    if (net && active && loadingStatus === "loaded") {
      const poses = await net.estimateMultiplePoses(this.props.video, this.props.imageScaleFactor,
        flipHorizontal, Number(this.props.outputStride) as OutputStride, this.props.maxDetections, this.props.scoreThreshold,
        this.props.nmsRadius);

      const { width, height } = this.props.video;
      this.props.onPosesEstimated(poses, { width, height });
   }

    if (this.mounted) {
      requestAnimationFrame(this.poseDetectionFrame);
    }
  }
}
