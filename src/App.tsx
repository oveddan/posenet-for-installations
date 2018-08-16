import * as posenet from "@tensorflow-models/posenet";
import * as React from 'react';
import './App.css';

import { createStyles, Grid, Paper, Theme, withStyles, WithStyles } from "@material-ui/core";
import { IConnectionState } from "./Connection";
import Controls, { IControls } from "./Controls";
import { PoseEstimator } from "./PoseEstimator";
import PosesRenderer from "./PosesRenderer";
import {isMobile} from './util';
import WebCamCapture from "./WebCamCapture";

interface IAppState {
  controls: IControls,
  poses: posenet.Pose[],
  imageSize: {width: number, height: number},
  changeToArchitecture: boolean,
  net: posenet.PoseNet | null,
  camera: string | null,
  connection: IConnectionState,
  error: string | null,
  video?: HTMLVideoElement,
}

interface IPoseMessage {
  poses: posenet.Pose[],
  image: {width: number, height: number}
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
  connection: {
    status: 'closed'
  },
  controls: {
    input: {
      mobileNetArchitecture: isMobile() ? '0.50' : '0.75',
    },
    camera: {
      capture: false
    },
    connection: {
      host: window.location.hostname,
      port: '8080'
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
  camera: null,
  error: null,
  poses: [],
  imageSize: {width: 0, height: 0}
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

        {this.state.controls.camera.capture && (
          <div>
            <WebCamCapture onLoaded={this.webCamCaptureLoaded} onError={this.onError} />

            {this.state.net && this.state.video && (
              <PoseEstimator
                net={this.state.net}
                video={this.state.video}
                {...this.state.controls.poseEstimation}
                onPosesEstimated={this.posesEstimated}
              />
            )}
          </div>
        )}

        <Grid container>
          <Grid item xs={8}>
            <Paper className={classes.paper}>
              <PosesRenderer
                poses={this.state.poses}
                video={this.state.video}
                imageSize={this.state.imageSize}
                {...this.state.controls.output}
              />
            </Paper>
          </Grid>
          <Grid item xs={4} >
            <Paper className={classes.paper}>
              <Controls
                controls={this.state.controls}
                updateControls={this.updateControls}
                connection={this.state.connection}
                connect={this.connectToSocket}
                disconnect={this.disconnectFromSocket}
              />
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

  private posesEstimated = (poses: posenet.Pose[], imageSize: {width: number, height: number}) => {
    this.setState({poses, imageSize});

    const { video, connection: { socket, status } } = this.state;

    if (socket && video && status === "open") {
      const message: IPoseMessage = {
        poses,
        image: {width: video.width, height: video.height}
      };
      socket.send(JSON.stringify(message));
    }
  }

  private disconnectFromSocket = () => {
    const existingSocket = this.state.connection.socket
    if (existingSocket) {
      existingSocket.close();

      existingSocket.removeEventListener('open', this.updateSocketStatus);
      existingSocket.removeEventListener('close', this.updateSocketStatus);
      existingSocket.removeEventListener('message', this.socketMessageReceived);
    }

    this.setState({
      connection: {
        status: 'closed'
      }
    });
  }

  private connectToSocket = () => {
    const { host, port } = this.state.controls.connection;

    if (host) {
      this.disconnectFromSocket();

      const socket = new WebSocket(`ws://${host}:${port}`);

      socket.addEventListener('open', this.updateSocketStatus);
      socket.addEventListener('error', this.updateSocketStatus);
      socket.addEventListener('close', this.updateSocketStatus);

      this.setState({
        connection: {
          socket,
          status: 'connecting'
        }
      });

      socket.addEventListener('message', this.socketMessageReceived);
    }
  }

  private socketMessageReceived = (ev: MessageEvent) => {
    // tslint:disable-next-line:no-console
    const { poses, image } = JSON.parse(ev.data) as IPoseMessage;

    this.setState({poses, imageSize: image});
  }

  private updateSocketStatus = () => {
    const { socket } = this.state.connection;
    if (!socket) { return };
    if (socket.readyState === socket.OPEN) {
      this.setState({
        connection : {
          socket,
          status: 'open'
        }
      })
    }
    else if (socket.readyState === socket.CLOSED) {
      this.setState({
        connection : {
          socket,
          status: 'closed'
        }
      });
    }
  }
}

export default withStyles(styles)(App);
