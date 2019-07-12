import * as posenet from '@tensorflow-models/posenet';
import {MobileNetMultiplier} from '@tensorflow-models/posenet';
import {PoseNetArchitecture, PoseNetInputResolution} from '@tensorflow-models/posenet/dist/posenet_model';

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

export interface IModelControls {
  architecture: PoseNetArchitecture, modelMultiplier: MobileNetMultiplier,
      inputResolution: PoseNetInputResolution,
      outputStride: posenet.PoseNetOutputStride
}

export interface IPoseEstimationControls {
  active: boolean, maxPoseDetections: number, nmsRadius: number,
      scoreThreshold: number
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

// export type PoseNetInputResolution =
//     161|193|257|289|321|353|385|417|449|481|513|801|1217;

export interface IControls {
  camera: ICameraControls, connection: IConnectionControls,
      model: IModelControls, poseEstimation: IPoseEstimationControls,
      output: IOutputControls,
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
