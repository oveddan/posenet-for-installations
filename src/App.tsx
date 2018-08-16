import * as posenet from "@tensorflow-models/posenet";
import * as React from 'react';
import './App.css';

import { createStyles, Grid, Paper, Theme, withStyles, WithStyles } from "@material-ui/core";
import Controls, { IControls } from "./Controls";
import { PoseEstimator } from "./PoseEstimator";
import PosesRenderer from "./PosesRenderer";
import {isMobile} from './util';
import WebCamCapture from "./WebCamCapture";

interface IAppState {
  controls: IControls,
  poses: posenet.Pose[],
  changeToArchitecture: boolean,
  net: posenet.PoseNet | null,
  camera: string | null,
  socket: WebSocket | null,
  error: string | null,
  video: HTMLVideoElement | null,
}

const styles = ({ palette, spacing }: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: spacing.unit * 2,
    textAlign: 'center',
    color: palette.text.secondary,
  },
});

const defaultAppState: IAppState = {
  controls: {
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
      active: false,
      imageScaleFactor: 0.5,
      maxPoseDetections: 5,
      nmsRadius: 30.0,
      outputStride: 16,
      maxDetections: 5,
      scoreThreshold: 0.1
    },
  },
  changeToArchitecture: false,
  net: null,
  video: null,
  camera: null,
  socket: null,
  error: null,
  poses: []
};

interface IProps extends WithStyles<typeof styles> {
};

class App extends React.Component<IProps, IAppState> {
  public state = defaultAppState;

  public async componentDidMount() {
    // Load the PoseNet model weights with architecture 0.75
    const net = await posenet.load(0.75);

    this.setState({net});

  }

  public render() {
    const { classes } = this.props;
    if (this.state.error) {
      return (<div id="info">{this.state.error}</div>)
    }

    return (
      <div className={classes.root}>
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
            {...this.state.controls.poseEstimation}
            onPosesEstimated={this.posesEstimated}
          />
        )}

        <Grid container>
           <Grid item xs={8}>
            <Paper className={classes.paper}>
              {this.state.video && (
                  <PosesRenderer
                    poses={this.state.poses}
                    video={this.state.video}
                    {...this.state.controls.output}
                  />
              )}
            </Paper>
          </Grid>
          <Grid item xs={4} >
            <Paper className={classes.paper}>
              <Controls controls={this.state.controls} updateControls={this.updateControls} />
            </Paper>
          </Grid>

        </Grid>
      </div>
    );
  }

  private updateControls = (controls: IControls) =>
    this.setState({controls});

  private webCamCaptureLoaded = (video: HTMLVideoElement) =>
    this.setState({video});

  private onError = (error: string) =>
    this.setState({error});

  private posesEstimated = (poses: posenet.Pose[]) =>
    this.setState({poses});
}

export default withStyles(styles)(App);
