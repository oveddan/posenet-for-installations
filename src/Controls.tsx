import * as React from 'react';

import { Typography } from '../node_modules/@material-ui/core';
import { OutputStride } from "./types";
import { SliderControl, SwitchControl } from './UI';


interface IOutputControls {
  showVideo: boolean,
  showSkeleton: boolean,
  showPoints: boolean,
  color: string,
  lineThickness: number,
  minPoseConfidence: number,
  minPartConfidence: number,
}


interface IOutputControlProps {
  controls: IOutputControls,
  updateControls: (key: keyof IControls, controls: IOutputControls) => void
}

class OutputControls extends React.Component<IOutputControlProps> {
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

interface IPoseEstimationControls {
  active: boolean,
  imageScaleFactor: number,
  maxPoseDetections: number,
  nmsRadius: number,
  outputStride: OutputStride,
  maxDetections: number
  scoreThreshold: number,
};

interface IPoseEstimationControlProps {
  controls: IPoseEstimationControls,
  updateControls: (key: keyof IControls, controls: IPoseEstimationControls) => void
}

class PoseEstimationControls extends React.Component<IPoseEstimationControlProps> {
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

export interface IControls {
  input: {
    mobileNetArchitecture: '0.50'|'0.75'|'1.00'|'1.01',
  },
  poseEstimation: IPoseEstimationControls,
  output: IOutputControls,
}

interface IControlProps {
  controls: IControls,
  updateControls: (controls: IControls) => void
}

type updateSubControls = <key extends keyof IControls>(key: key, controls: IControls[key]) => void;

export default class Controls extends React.Component<IControlProps> {
  public render() {
    const { controls } = this.props;

    return (
      <div>
         <Typography>Pose Estimation</Typography>
         <PoseEstimationControls controls={controls.poseEstimation} updateControls={this.updateSubControls} />
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
