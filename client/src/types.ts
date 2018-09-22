import * as posenet from '@tensorflow-models/posenet';

export type OutputStride = 8|16|32;

export type loadingStatus = 'loading'|'error'|'loaded'|'idle';

export interface IConnectionState {
  socket?: WebSocket, status: 'open'|'connecting'|'closed'
}

export interface ICameraState {
  currentDevice?: MediaDeviceInfo, devices?: MediaDeviceInfo[],
      video?: HTMLVideoElement
}

export interface IModelState {
  loadingStatus: loadingStatus, net?: posenet.PoseNet
}

export interface IPoseEstimationControls {
  active: boolean, imageScaleFactor: number, maxPoseDetections: number,
      nmsRadius: number, outputStride: '8'|'16', maxDetections: number
  scoreThreshold: number, modelMultiplier: string
}

export interface IOutputControls {
  showVideo: boolean, showSkeleton: boolean, showPoints: boolean,
      backgroundColor: string, lineColor: string, lineThickness: number,
      minPoseConfidence: number, minPartConfidence: number,
}

export interface ICameraControls {
  capture: boolean, deviceId?: string
}

export interface IConnectionControls {
  host: string, port: string
}

export interface IControls {
  input: {
    mobileNetArchitecture: '0.50'|'0.75'|'1.00'|'1.01',
  },
      camera: ICameraControls, connection: IConnectionControls,
      poseEstimation: IPoseEstimationControls, output: IOutputControls,
}


export interface IAppState {
  controls: IControls, poses?: posenet.Pose[],
      imageSize: {width: number, height: number}, model: IModelState,
      camera: ICameraState, connection: IConnectionState, error: string|null,
      fullScreen: boolean
}

export interface IPoseMessage {
  poses: posenet.Pose[], image: {width: number, height: number}
}
