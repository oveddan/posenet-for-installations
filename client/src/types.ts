import * as posenet from "oveddan-posenet";

export type OutputStride = 8 | 16 | 32;

export type loadingStatus = "loading" | "error" | "loaded" | "idle";

export interface IConnectionState {
  socket?: WebSocket;
  status: "open" | "connecting" | "closed";
}

export interface ICameraState {
  currentDevice?: MediaDeviceInfo;
  devices?: MediaDeviceInfo[];
  video?: HTMLVideoElement;
}

export interface IModelState {
  loadingStatus: loadingStatus;
  net?: posenet.PoseNet;
}

export interface IModelControls {
  architecture: PoseNetArchitecture;
  modelMultiplier: posenet.MobileNetMultiplier;
  outputStride: posenet.PoseNetOutputStride;
}

export interface IPoseEstimationControls {
  active: boolean;
  maxPoseDetections: number;
  nmsRadius: number;
  scoreThreshold: number;
  internalResolution: posenet.PoseNetInternalResolution;
}

export interface IOutputControls {
  showVideo: boolean;
  showSkeleton: boolean;
  showPoints: boolean;
  backgroundColor: string;
  lineColor: string;
  lineThickness: number;
  minPoseConfidence: number;
  minPartConfidence: number;
}

export interface ICameraControls {
  capture: boolean;
  deviceId?: string;
}

export interface IConnectionControls {
  host: string;
  port: string;
}

// export type PoseNetInputResolution =
//     161|193|257|289|321|353|385|417|449|481|513|801|1217;

export interface IControls {
  camera: ICameraControls;
  connection: IConnectionControls;
  model: IModelControls;
  poseEstimation: IPoseEstimationControls;
  output: IOutputControls;
}

export interface IPoseMessage {
  poses: posenet.Pose[];
  image: { width: number; height: number };
}
