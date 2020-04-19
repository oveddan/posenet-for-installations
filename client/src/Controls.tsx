import * as React from 'react';

import { FormControl, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, createStyles, TextField, Theme, WithStyles, withStyles, Typography } from '@material-ui/core';
import Cast from "@material-ui/icons/Cast";
import Videocam from "@material-ui/icons/Videocam";
import DirectionsWalk from "@material-ui/icons/DirectionsWalk";
import FullScreen from "@material-ui/icons/Fullscreen";
import TransferWithinAStation from '@material-ui/icons/TransferWithinAStation';
import { IControls, ICameraState, IModelState, ICameraControls, IConnectionControls, IOutputControls, IPoseEstimationControls, IConnectionState, IModelControls } from "./types";
import { SliderControl, SwitchControl, DropDownControl } from './UI';
import { CompactPicker, ColorResult } from 'react-color';
import * as posenet from 'oveddan-posenet';

const styles = ({ spacing }: Theme) => createStyles({
  fab: {
    position: 'fixed',
    bottom: 20,
    width: '100%',
    textAlign: 'center'
  },
  button: {
    margin: spacing.unit,
  },
  extendedIcon: {
    marginRight: spacing.unit,
  },
});

interface ICameraControlsProps extends WithStyles<typeof styles> {
  controls: ICameraControls,
  camera: ICameraState,
  updateControls: (key: keyof IControls, controls: ICameraControls) => void,
  setVideoDevices: (devices: MediaDeviceInfo[]) => void
}

export class CameraControls extends React.Component<ICameraControlsProps, {
  open: boolean,
  selectedDevice?: string
}> {
  public state = {
    open: false
  };

  public async componentDidMount() {
    const devices = await navigator.mediaDevices.enumerateDevices()

    const videoDevices = devices.filter(device => device.kind === "videoinput");

    this.props.setVideoDevices(videoDevices);
  }

  public render() {
    const { controls, classes } = this.props;
    const { currentDevice } = this.props.camera;

    return (
      <span>
      <Button variant="fab"
        color={this.getButtonColor()}
        aria-label="Connect"
        className={classes.button}
        onClick={this.openDialog}
        disabled={this.isStartingCapture}
      >
        <Videocam />
      </Button>
        <Dialog
          open={this.state.open || false}
          onClose={this.closeDialog}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Video Capture</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {this.isCapturing && (
                `Capturing on camera ${currentDevice}`
              )}
            </DialogContentText>

            <DropDownControl key="deviceId" controls={controls} controlKey="deviceId"
              text="Video Device" options={this.deviceOptions()} updateControls={this.updateControls}
              disabled={!(!this.isCapturing && !this.isStartingCapture)}
              />

            <SwitchControl controls={controls} controlKey='capture'
              updateControls={this.updateControls} disabled={this.isStartingCapture} />
           </DialogContent>
          <DialogActions>
           <Button onClick={this.closeDialog} color="primary">
              Close
            </Button>
         </DialogActions>
        </Dialog>
      </span>
    )
  }

  private deviceOptions = (): string[][] => {
    if (!this.props.camera.devices) { return [] };

    return this.props.camera.devices.map(device => (
      [device.deviceId, device.label]
    ));

  }

  private getButtonColor = (): "primary" | "secondary" | undefined => {
    if (this.isCapturing) {
      return "primary";
    }
    if (this.isStartingCapture) {
      return "secondary";
    }
    return;
  }

  private openDialog = () => {
    this.setState({open: true});
  }

  private closeDialog = () => {
    this.setState({open: false});
  }

  private get isCapturing() {
    return (this.props.controls.capture && this.props.camera.video);
  }

  private get isStartingCapture() {
    return (this.props.controls.capture && !this.props.camera.video);
  }

  private updateControls = (key: keyof ICameraControls, value: any) => {
    const newControls: ICameraControls = {
      ...this.props.controls,
      [key]: value
    };

    this.props.updateControls('camera', newControls);
  }
}


interface IPoseEstimationControlsProps extends WithStyles<typeof styles> {
  poseEstimationControls: IPoseEstimationControls,
  modelControls: IModelControls,
  model: IModelState,
  updateControls: (key: keyof IControls, controls: IPoseEstimationControls| IModelControls) => void
};

export class PoseEstimationControls extends React.Component<IPoseEstimationControlsProps, {
  open: boolean
}> {
  public state = {
    open: false
  };

  public render() {
    const { modelControls, poseEstimationControls, model: { loadingStatus }, classes } = this.props;
    return (
      <span>
        <Button variant="fab" color={poseEstimationControls.active ? "primary" : undefined} aria-label="Estimate"
          className={classes.button} onClick={this.openDialog}>
          <DirectionsWalk />
        </Button>
        <Dialog
          open={this.state.open || false}
          onClose={this.closeDialog}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Pose Estimation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {poseEstimationControls.active && (
                "Estimating Poses"
              )}
              {!poseEstimationControls.active && loadingStatus === "idle" && (
                "Load the model and estimate poses"
              )}
              {!poseEstimationControls.active && loadingStatus === "loading" && (
                "Loading the model..."
              )}
              {!poseEstimationControls.active && loadingStatus === "error" && (
                "Error loading the model..."
              )}
            </DialogContentText>
            <DropDownControl key="architecture" controls={modelControls} controlKey="architecture"
              text="Input Resolution" options={this.architectureOptions()} updateControls={this.updateModelControls}
              disabled={loadingStatus === 'loading'}
            />
            <DropDownControl key="modelMultiplier" controls={modelControls} controlKey="modelMultiplier"
              text="Model Multiplier" options={this.multiplierOptions()} updateControls={this.updateModelMultiplier}
              disabled={loadingStatus === 'loading'}
            />
            <DropDownControl key="outputStride" controls={modelControls} controlKey="outputStride"
              text="Output Stride" options={this.outputStrideOptions()} updateControls={this.updateOutputStride}
              disabled={loadingStatus === 'loading'}
            />
            <DropDownControl key="inputResolution" controls={modelControls} controlKey="inputResolution"
              text="Input Resolution" options={this.inputResolutionOptions()} updateControls={this.updateInputResolution}
              disabled={loadingStatus === 'loading'}
            />
            <SliderControl key="maxPoseDetections" controls={poseEstimationControls} controlKey="maxPoseDetections"
              min={0} max={20} step={1} text="max pose detections" updateControls={this.updatePoseEstimationControls} />
            <SliderControl key="nmsRadius" controls={poseEstimationControls} controlKey="nmsRadius"
              min={0} max={100} step={1} text="nms radius" updateControls={this.updatePoseEstimationControls} />
            <SliderControl key="scoreThreshold" controls={poseEstimationControls} controlKey="scoreThreshold"
              min={0} max={1} text="score threshold" updateControls={this.updatePoseEstimationControls} />

            <SwitchControl controls={poseEstimationControls} controlKey='active'
              updateControls={this.updatePoseEstimationControls} disabled={loadingStatus !== 'loaded'} />
           </DialogContent>
          <DialogActions>
           <Button onClick={this.closeDialog} color="primary">
              Close
            </Button>
         </DialogActions>
        </Dialog>
      </span>
    )
  }

  private architectureOptions(): string[][] {
    return [['MobileNetV1', 'MobileNetV1'], ['ResNet50', 'ResNet50']];
  }

  private multiplierOptions(): string[][] {
    const { architecture } = this.props.modelControls;

    if (architecture === 'ResNet50') {
      return [['1', '1.00']];
    } else {
      return [['0.5', '0.50'], ['0.75', '0.75'], ['1', '1.00']];
    }
  }

  private outputStrideOptions(): string[][] {
    const { architecture } = this.props.modelControls;
    if (architecture === 'ResNet50') {
      return [['16', '16'], ['32', '32']];
    } else {
      return [['8', '8'], ['16', '16']];
    }
  }

  private inputResolutionOptions(): string[][] {
    return ([161, 193, 257, 289, 321, 353, 385, 417, 449, 481, 513, 801, 1217]).map(x => [x.toString(), x.toString()]);
  }

  private openDialog = () => {
    this.setState({open: true});
  }

  private closeDialog = () => {
    this.setState({open: false});
  }

  private updateArchitecture = (key: keyof IModelControls, architecture: string) => {
    let { modelMultiplier, outputStride } = this.props.modelControls

    if (architecture === 'ResNet50') {
      modelMultiplier = 1;
      if (outputStride === 8) {
        outputStride = 16
      }
    } else if (architecture === 'MobileNetV1') {
      if (outputStride === 32)  {
        outputStride = 16
      }
    }

    const newControls: IModelControls = {
      ...this.props.modelControls,
      modelMultiplier,
      outputStride,
      architecture
    };
  }

  private updateModelMultiplier = (key: keyof IModelControls, multiplier: string) => {
    this.updateModelControls(key, +multiplier);
  }

  private updateOutputStride = (key: keyof IModelControls, outputStride: string) => {
    this.updateModelControls(key, +outputStride);
  }
  private updateInputResolution = (key: keyof IModelControls, inputResolution: string) => {
    this.updateModelControls(key, +inputResolution);
  }

  private updateModelControls = (key: keyof IModelControls, value: any) => {
    const newControls: IModelControls = {
      ...this.props.modelControls,
      [key]: value
    };

    this.props.updateControls('model', newControls);
  }


  private updatePoseEstimationControls = (key: keyof IPoseEstimationControls, value: any) => {
    const newControls: IPoseEstimationControls = {
      ...this.props.poseEstimationControls,
      [key]: value
    };

    this.props.updateControls('poseEstimation', newControls);
  }
}


interface IOutputControlsProps extends WithStyles<typeof styles>  {
  controls: IOutputControls,
  updateControls: (key: keyof IControls, controls: IOutputControls) => void
}

export class OutputControls extends React.Component<IOutputControlsProps, {
  open: boolean
}> {
  public state = {
    open: false
  };

  public render() {
    const { controls, classes } = this.props;
      return (
        <span>
          <Button variant="fab" aria-label="Estimate"
            className={classes.button} onClick={this.openDialog}>
            <TransferWithinAStation />
          </Button>
          <Dialog
            open={this.state.open || false}
            onClose={this.closeDialog}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Display/Output</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Display/Output
              </DialogContentText>
              <SwitchControl controls={controls} controlKey='showVideo'
                updateControls={this.updateControls} />
              {!controls.showVideo && (
                <FormControl>
                  <Typography>Background Color</Typography>
                  <CompactPicker color={this.props.controls.backgroundColor} onChange={this.changeBackgroundColor} />
                </FormControl>
              )}
              <SwitchControl controls={controls} controlKey='showSkeleton'
                updateControls={this.updateControls} />
              <SwitchControl controls={controls} controlKey='showPoints'
                updateControls={this.updateControls} />
              <FormControl>
                <Typography>Line Color</Typography>
                <CompactPicker color={this.props.controls.lineColor} onChange={this.changeLineColor} />
              </FormControl>
              <SliderControl key="lineThickness" controls={controls} controlKey="lineThickness"
                min={0} max={100} text="line thickness" updateControls={this.updateControls} />
              <SliderControl key="minPartConfidence" controls={controls} controlKey="minPartConfidence"
                min={0} max={1} text="min part confidence" updateControls={this.updateControls} />
              <SliderControl key="minPoseConfidence" controls={controls} controlKey="minPoseConfidence"
                min={0} max={1} text="min pose confidence" updateControls={this.updateControls} />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.closeDialog} color="primary">
                Close
              </Button>
          </DialogActions>
          </Dialog>
        </span>
    )
  }
  private openDialog = () => {
    this.setState({open: true});
  }

  private closeDialog = () => {
    this.setState({open: false});
  }

  private updateControls = (key: keyof IOutputControls, value: any) => {
    const newControls: IOutputControls = {
      ...this.props.controls,
      [key]: value
    };

    this.props.updateControls('output', newControls);
  }

  private changeLineColor = (color: ColorResult) => {
    this.updateControls('lineColor', color.hex);
  }

  private changeBackgroundColor = (color: ColorResult) => {
    this.updateControls('backgroundColor', color.hex);
  }
}


interface IConnectionButtonProps extends WithStyles<typeof styles> {
  controls: IConnectionControls,
  connection: IConnectionState,
  connect: () => void
  disconnect: () => void,
  updateControls: (key: keyof IControls, controls: IConnectionControls) => void
};

class ConnectionControls extends React.Component<IConnectionButtonProps, {
  open: boolean
}> {
  public state = {
    open: false
  };

  public render() {
    const { connection : { status }, classes, controls } = this.props;
    return (
      <span>
        <Button variant="fab" color={status === "open" ? "primary" : undefined} aria-label="Connect" className={classes.button} onClick={this.openDialog}>
          <Cast />
        </Button>
        <Dialog
          open={this.state.open || false}
          onClose={this.closeDialog}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Pose Connection</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {status === 'closed' && (
                "Connect to the server to send or receive estimated poses."
              )}
              {status === "open" && (
                "Connected to:"
              )}
              {status === "closed" && (
                "Connecting to:"
              )}
             </DialogContentText>
            <TextField
              label="host"
              key="host"
              value={controls.host}
              onChange={this.connectToChanged}
              margin="normal"
              disabled={status !== "closed"}
            />
            :
            <TextField
              label="port"
              key="port"
              value={controls.port}
              onChange={this.hostChanged}
              margin="normal"
              disabled={status !== "closed"}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeDialog} color="primary">
              Cancel
            </Button>
            {status === "closed" && (
              <Button onClick={this.handleConnect} color="primary">
                Connect
              </Button>
            )}
            {status === "open" && (
              <Button onClick={this.handleDisconnect} color="primary">
                Disconnect
              </Button>
            )}
          </DialogActions>
        </Dialog>
     </span>
    )
  }

  private openDialog = () => {
    this.setState({open: true});
  }

  private closeDialog = () => {
    this.setState({open: false});
  }

  private handleConnect = () => {
    this.props.connect();

    this.closeDialog();
  }

  private handleDisconnect = () => {
    this.props.disconnect();

    this.closeDialog();
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

type updateSubControls = <key extends keyof IControls>(key: key, controls: IControls[key]) => void;

interface IControlProps extends WithStyles<typeof styles> {
  controls: IControls,
  connection: IConnectionState,
  camera: ICameraState,
  model: IModelState,
  poses?: posenet.Pose[],
  connect: () => void,
  disconnect: () => void,
  goFullScreen: () => void,
  updateControls: (controls: IControls) => void,
  setVideoDevices: (devices: MediaDeviceInfo[]) => void
}


class Controls extends React.Component<IControlProps> {
  public render() {
    const { poses, camera, connection, controls, classes } = this.props;

    return (
      <div className={classes.fab}>
        <ConnectionControls connection={connection}
          controls={controls.connection}
          updateControls={this.updateSubControls} connect={this.props.connect}
          disconnect={this.props.disconnect}
          classes={classes}
/>
      <CameraControls
        controls={controls.camera}
        updateControls={this.updateSubControls}
        classes={classes}
        camera={camera}
        setVideoDevices={this.props.setVideoDevices}
      />
      {camera.video && (
        <PoseEstimationControls
          poseEstimationControls={controls.poseEstimation}
          modelControls={controls.model}
          updateControls={this.updateSubControls}
          model={this.props.model}
          classes={classes}
         />
      )}
      {poses && (
        <OutputControls
          controls={controls.output}
          updateControls={this.updateSubControls}
          classes={classes}
        />
      )}
      {(camera.video || poses) && (
        <Button variant="fab" aria-label="Go Full Screen" className={classes.button} onClick={this.props.goFullScreen}>
          <FullScreen />
        </Button>
      )}
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

export default withStyles(styles)(Controls);
