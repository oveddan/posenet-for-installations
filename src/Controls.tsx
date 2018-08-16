import * as React from 'react';

import { Button, TextField, Typography } from '@material-ui/core';
import { IConnectionState } from './Connection';
import { OutputStride } from "./types";
import { SliderControl, SwitchControl } from './UI';

interface IConnectionControls {
  host: string,
  port: string
}

class ConnectionControls extends React.Component<{
  controls: IConnectionControls,
  connection: IConnectionState,
  connect: () => void,
  disconnect: () => void,
  updateControls: (key: keyof IControls, controls: IConnectionControls) => void
}> {
  public render() {
    const { controls, connection : { status } } = this.props;
    return (
      <div>
       {(status === 'closed') && (
         <div>
            <TextField
              label="host"
              key="host"
              value={controls.host}
              onChange={this.connectToChanged}
              margin="normal"
            />
            :
            <TextField
              label="port"
              key="port"
              value={controls.port}
              onChange={this.hostChanged}
              margin="normal"
            />
             <Button variant="contained" color="primary" onClick={this.props.connect}>
              Connect
            </Button>
          </div>
        )}
        {(status === 'connecting') && (
          <Typography>
            {`connecting to ${controls.host}`}
          </Typography>
        )}
        {(status === 'open') && (
          <div>
            <Typography>
              {`connected to ${controls.host}`}
            </Typography>
            <Button variant="contained" color="primary" onClick={this.props.disconnect}>
              Disconnect
            </Button>
          </div>
        )}
      </div>
    )
  }

  private connectToChanged: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    this.updateControls('host', e.target.value);
  }

  private hostChanged: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    this.updateControls('port', e.target.value);
  }

  private updateControls = (key: keyof IConnectionControls, value: any) => {
    const newControls: IConnectionControls = {
      ...this.props.controls,
      [key]: value
    };

    this.props.updateControls('connection', newControls);
  }
}

interface ICameraControls {
  capture: boolean
};

class CameraControls extends React.Component<{
  controls: ICameraControls,
  updateControls: (key: keyof IControls, controls: ICameraControls) => void
}> {
  public render() {
    const { controls } = this.props;
    return (
      <div>
        <SwitchControl controls={controls} controlKey='capture'
          updateControls={this.updateControls} />
      </div>
    )
  }

  private updateControls = (key: keyof ICameraControls, value: any) => {
    const newControls: ICameraControls = {
      ...this.props.controls,
      [key]: value
    };

    this.props.updateControls('camera', newControls);
  }
}

interface IPoseEstimationControls {
  active: boolean,
  imageScaleFactor: number,
  maxPoseDetections: number,
  nmsRadius: number,
  outputStride: OutputStride,
  maxDetections: number
  scoreThreshold: number,
};

class PoseEstimationControls extends React.Component<{
  controls: IPoseEstimationControls,
  updateControls: (key: keyof IControls, controls: IPoseEstimationControls) => void
}> {
  public render() {
    const { controls } = this.props;
    return (
      <div>
        <SwitchControl controls={controls} controlKey='active'
          updateControls={this.updateControls} />
        <SliderControl key="imageScaleFactor" controls={controls} controlKey="imageScaleFactor"
          min={0.2} max={1} text="image scale factor" updateControls={this.updateControls} />
        <SliderControl key="maxDetections" controls={controls} controlKey="maxPoseDetections"
          min={0} max={20} step={1} text="max pose detections" updateControls={this.updateControls} />
        <SliderControl key="nmsRadius" controls={controls} controlKey="nmsRadius"
          min={0} max={100} step={1} text="nms radius" updateControls={this.updateControls} />
        <SliderControl key="scoreThreshold" controls={controls} controlKey="scoreThreshold"
          min={0} max={1} text="score threshold" updateControls={this.updateControls} />
      </div>
    )
  }

  private updateControls = (key: keyof IPoseEstimationControls, value: any) => {
    const newControls: IPoseEstimationControls = {
      ...this.props.controls,
      [key]: value
    };

    this.props.updateControls('poseEstimation', newControls);
  }
}

interface IOutputControls {
  showVideo: boolean,
  showSkeleton: boolean,
  showPoints: boolean,
  color: string,
  lineThickness: number,
  minPoseConfidence: number,
  minPartConfidence: number,
}

class OutputControls extends React.Component<{
  controls: IOutputControls,
  updateControls: (key: keyof IControls, controls: IOutputControls) => void
}> {
  public render() {
    const { controls } = this.props;
    return (
      <div>
        <SwitchControl controls={controls} controlKey='showVideo'
          updateControls={this.updateControls} />
        <SwitchControl controls={controls} controlKey='showSkeleton'
          updateControls={this.updateControls} />
        <SwitchControl controls={controls} controlKey='showPoints'
          updateControls={this.updateControls} />
        <SliderControl key="lineThickness" controls={controls} controlKey="lineThickness"
          min={0} max={100} text="line thickness" updateControls={this.updateControls} />
        <SliderControl key="minPartConfidence" controls={controls} controlKey="minPartConfidence"
          min={0} max={1} text="min part confidence" updateControls={this.updateControls} />
        <SliderControl key="minPoseConfidence" controls={controls} controlKey="minPoseConfidence"
          min={0} max={1} text="min pose confidence" updateControls={this.updateControls} />
       </div>
    )
  }

  private updateControls = (key: keyof IOutputControls, value: any) => {
    const newControls: IOutputControls = {
      ...this.props.controls,
      [key]: value
    };

    this.props.updateControls('output', newControls);
  }
}

export interface IControls {
  input: {
    mobileNetArchitecture: '0.50'|'0.75'|'1.00'|'1.01',
  },
  camera: ICameraControls,
  connection: IConnectionControls,
  poseEstimation: IPoseEstimationControls,
  output: IOutputControls,
}

interface IControlProps {
  controls: IControls,
  connection: IConnectionState,
  connect: () => void,
  disconnect: () => void,
  updateControls: (controls: IControls) => void
}

type updateSubControls = <key extends keyof IControls>(key: key, controls: IControls[key]) => void;

export default class Controls extends React.Component<IControlProps> {
  public render() {
    const { controls } = this.props;

    return (
      <div>
         <ConnectionControls connection={this.props.connection}
            controls={controls.connection}
            updateControls={this.updateSubControls} connect={this.props.connect}
            disconnect={this.props.disconnect}
          />
         <Typography>Camera</Typography>
         <CameraControls controls={controls.camera} updateControls={this.updateSubControls} />
         {controls.camera.capture && (
           <div>
            <Typography>Pose Estimation</Typography>
            <PoseEstimationControls controls={controls.poseEstimation} updateControls={this.updateSubControls} />
          </div>
         )}
         <Typography>Output</Typography>
         <OutputControls controls={controls.output} updateControls={this.updateSubControls} />
      </div>
    )
  }

  private updateSubControls: updateSubControls = (key, controls) => {
    this.props.updateControls({
      ...this.props.controls,
      [key]: controls
    });
  }
}
