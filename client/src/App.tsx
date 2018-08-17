import * as posenet from "@tensorflow-models/posenet";
import * as React from 'react';
import './App.css';

import { AppBar, createStyles, Grid, Theme, Toolbar, Typography, withStyles, WithStyles } from "@material-ui/core";
import Controls from "./Controls";
import { PoseEstimator } from "./PoseEstimator";
import PosesRenderer from "./PosesRenderer";
import {isMobile} from './util';
import { IAppState, IControls, IPoseMessage, } from './types'
import WebCamCapture from "./WebCamCapture";
import { loadModel } from './models';


const styles = ({ palette, spacing }: Theme) => createStyles({
  root: {
    flexGrow: 1,
    height: '100%'
  },
  paper: {
    padding: spacing.unit * 2,
    textAlign: 'center',
    color: palette.text.secondary,
    height: '100%'
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
  model: {
    loadingStatus: 'idle'
  },
  camera: null,
  error: null,
  imageSize: {width: 0, height: 0}
};

interface IProps extends WithStyles<typeof styles> {
};
const MenuBar = () => (
  <AppBar position="static" color="default">
    <Toolbar>
      <Typography variant="title" color="inherit">
        PoseNet Chat
      </Typography>
    </Toolbar>
  </AppBar>
)

const EmptyContent = () => (
  <Typography>
    Start a video capture or connect to the server to start
  </Typography>
)

class App extends React.Component<IProps, IAppState> {
  public state = defaultAppState;

  public async componentDidMount() {
    // Load the PoseNet model weights with architecture 0.75
    const net = await loadModel(0.75);

    this.setState({
      model: {
        ...this.state.model,
        net,
        loadingStatus: "loaded"
      }
    });
  }

  public render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        {!this.state.model.net && (
          <div id="loading">
            Loading the model...
          </div>
          )
        }

       <WebCamCapture capture={this.state.controls.camera.capture} onLoaded={this.webCamCaptureLoaded} onError={this.onError} />

        {this.state.model.net && this.state.video && (
          <PoseEstimator
            net={this.state.model.net}
            video={this.state.video}
            {...this.state.controls.poseEstimation}
            onPosesEstimated={this.posesEstimated}
          />
        )}

        <MenuBar />

        <Grid
          container
          justify="center"
            direction="row"
          alignItems="stretch"
          style={{height: '95%'}}
       >
          <Grid item xs={12} md={8}
            direction="row"
            alignItems="stretch"
            >
              {(this.state.video || this.state.connection.socket) && (
                <PosesRenderer
                  poses={this.state.poses}
                  video={this.state.video}
                  imageSize={this.state.imageSize}
                  {...this.state.controls.output}
                />
              )}
              {(!this.state.video && !this.state.connection.socket) && (
                <EmptyContent />
              )}
          </Grid>
       </Grid>
      <Controls
        controls={this.state.controls}
        updateControls={this.updateControls}
        connection={this.state.connection}
        connect={this.connectToSocket}
        disconnect={this.disconnectFromSocket}
        model={this.state.model}
        video={this.state.video}
        poses={this.state.poses}
      />
       </div>
    );
  }

  private updateControls = (controls: IControls) =>
    this.setState({controls});

  private webCamCaptureLoaded = (video?: HTMLVideoElement) => {
    const { width, height } = video || this.state.imageSize;
    this.setState({video, imageSize: { width, height }});
  }

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
