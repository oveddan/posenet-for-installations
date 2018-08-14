import * as posenet from "@tensorflow-models/posenet";
import * as React from 'react';
import './App.css';

import { PoseEstimator } from "./PoseEstimator";
import PosesRenderer from "./PosesRenderer";
import { OutputStride } from "./types";
import {isMobile} from './util';
import WebCamCapture from "./WebCamCapture";

interface IAppState {
  input: {
    mobileNetArchitecture: '0.50'|'0.75'|'1.00'|'1.01',
  },
  poseEstimation: {
    active: boolean,
    imageScaleFactor: 0.5,
    maxPoseDetections: 5,
    nmsRadius: number,
    outputStride: OutputStride,
    maxDetections: number
    scoreThreshold: number,
  },
  output: {
    showVideo: boolean,
    showSkeleton: boolean,
    showPoints: boolean,
    color: string,
    lineThickness: number,
    minPoseConfidence: number,
    minPartConfidence: number,
  },
  poses: posenet.Pose[],
  changeToArchitecture: boolean,
  net: posenet.PoseNet | null,
  camera: string | null,
  socket: WebSocket | null,
  goFullScreen: (() => void) | null,
  error: string | null,
  video: HTMLVideoElement | null,
}

const defaultAppState: IAppState = {
  input: {
    mobileNetArchitecture: isMobile() ? '0.50' : '0.75',
  },
  output: {
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    color: '#00FFFF',
    lineThickness: 5,
    minPartConfidence: 0.1,
    minPoseConfidence: 0.15,
   },
  poseEstimation: {
    active: true,
    imageScaleFactor: 0.5,
    maxPoseDetections: 5,
    nmsRadius: 30.0,
    outputStride: 16,
    maxDetections: 5,
    scoreThreshold: 0.1
  },
  changeToArchitecture: false,
  net: null,
  video: null,
  camera: null,
  socket: null,
  goFullScreen: null,
  error: null,
  poses: []
};

class App extends React.Component<{}, IAppState> {
  public state = defaultAppState;

  public async componentDidMount() {
    // Load the PoseNet model weights with architecture 0.75
    const net = await posenet.load(0.75);

    this.setState({net});

  }

  public webCamCaptureLoaded = (video: HTMLVideoElement) => {
    this.setState({video});
  }

  public onError = (error: string) => {
    this.setState({error});
  }

  public posesEstimated = (poses: posenet.Pose[]) => {
    this.setState({poses});
  }

  public render() {
    if (this.state.error) {
      return (<div id="info">{this.state.error}</div>)
    }

    return (
      <div>
        {!this.state.net && (
          <div id="loading">
            Loading the model...
          </div>
          )
        }

        <WebCamCapture onLoaded={this.webCamCaptureLoaded} onError={this.onError} />

        {this.state.net && this.state.video && (
          <PoseEstimator
            net={this.state.net}
            video={this.state.video}
            {...this.state.poseEstimation}
            onPosesEstimated={this.posesEstimated}
          />
        )}

        {this.state.video && (
          <PosesRenderer
            poses={this.state.poses}
            video={this.state.video}
            {...this.state.output}
          />
        )}
      </div>
    );
  }
}

export default App;
