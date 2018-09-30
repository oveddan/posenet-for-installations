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
      backgroundColor: '#FFFFFF',
      lineColor: '#00FFFF',
      lineThickness: 5,
      minPartConfidence: 0.1,
      minPoseConfidence: 0.15,
    },
    poseEstimation: {
      active: false,
      imageScaleFactor: 0.5,
      maxPoseDetections: 5,
      nmsRadius: 30.0,
      outputStride: '16',
      maxDetections: 5,
      scoreThreshold: 0.1,
      modelMultiplier: '0.75'
    },
  },
  model: {
    loadingStatus: 'idle'
  },
  camera: {},
  error: null,
  fullScreen: false,
  imageSize: {width: 0, height: 0}
};

interface IProps extends WithStyles<typeof styles> {
};
const MenuBar = () => (
  <AppBar position="static" color="default">
    <Toolbar>
      <Typography variant="title" color="inherit">
        PoseNet
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
  private rootRef: React.RefObject<HTMLDivElement>;

  constructor(props: IProps) {
    super(props);

    this.rootRef = React.createRef();
  }



  public async componentDidMount() {
    this.setAndLoadModel(this.state.controls.poseEstimation.modelMultiplier);
  }

  public render() {
    const { classes } = this.props;

    return (
      <div className={classes.root} ref={this.rootRef}>
        {!this.state.model.net && (
          <div id="loading">
            Loading the model...
          </div>
          )
        }

       <WebCamCapture deviceId={this.state.controls.camera.deviceId} capture={this.state.controls.camera.capture} onLoaded={this.webCamCaptureLoaded} onError={this.onError} />

        {(this.state.model.net
          && this.state.camera.video) && (
          <PoseEstimator
            model={this.state.model}
            video={this.state.camera.video}
            {...this.state.controls.poseEstimation}
            onPosesEstimated={this.posesEstimated}
          />
        )}

        {!this.state.fullScreen && (
          <MenuBar />
        )}

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
              {(this.state.camera.video || this.state.connection.socket) && (
                <PosesRenderer
                  poses={this.state.poses}
                  video={this.state.camera.video}
                  imageSize={this.state.imageSize}
                  {...this.state.controls.output}
                />
              )}
              {(!this.state.camera.video && !this.state.connection.socket) && (
                <EmptyContent />
              )}
          </Grid>
       </Grid>
      {!this.state.fullScreen && (
        <Controls
          controls={this.state.controls}
          updateControls={this.updateControls}
          connection={this.state.connection}
          connect={this.connectToSocket}
          disconnect={this.disconnectFromSocket}
          model={this.state.model}
          camera={this.state.camera}
          setVideoDevices={this.setVideoDevices}
          poses={this.state.poses}
          goFullScreen={this.goFullScreen}
          setAndLoadModel={this.setAndLoadModel}
        />
      )}
       </div>
    );
  }

  private updateControls = (controls: IControls) =>
    this.setState({controls});

  private webCamCaptureLoaded = (video?: HTMLVideoElement) => {
    const { width, height } = video || this.state.imageSize;
    this.setState(prevState => ({
      camera: {
        ...prevState.camera,
        video,
      },
      imageSize: { width, height }
    }));
  }

  private onError = (error: string) =>
    this.setState({error});

  private setVideoDevices = (devices: MediaDeviceInfo[]) => {
    this.setState(prevState => ({
      camera: {
        ...prevState.camera,
        devices
      }}));

     if (devices.length > 0) {
      this.setState(prevState => ({
        controls: {
          ...prevState.controls,
          camera: {
            ...prevState.controls.camera,
            deviceId: devices[0].deviceId
          }
        }
      }));
    }
  }

  private posesEstimated = (poses: posenet.Pose[], imageSize: {width: number, height: number}) => {
    this.setState({poses, imageSize});

    const { camera : { video }, connection: { socket, status } } = this.state;

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

  private goFullScreen = () => {
    this.setState({
      fullScreen: true
    })

    if (this.rootRef.current) {
      this.rootRef.current.addEventListener("touchstart", this.exitFullScreen);
      this.rootRef.current.addEventListener("click", this.exitFullScreen);
    }
  }

  private exitFullScreen = () => {
    this.setState({
      fullScreen: false
    })

    if (this.rootRef.current) {
      this.rootRef.current.removeEventListener("touchstart", this.exitFullScreen);
      this.rootRef.current.removeEventListener("click", this.exitFullScreen);
    }
  }

  private setAndLoadModel = async (multiplier: string) => {
    // tslint:disable-next-line:no-debugger
    this.setState(prevState => ({
      ...prevState,
      model: {
        ...prevState.model,
        loadingStatus: "loading"
      }
    }));
    // Load the PoseNet model weights with architecture 0.75
    if (this.state.model.net) {
      this.state.model.net.dispose();
    }

    const net = await loadModel(Number(multiplier) as posenet.MobileNetMultiplier);

    this.setState({
      model: {
        ...this.state.model,
        net,
        loadingStatus: "loaded"
      }
    });


  }
}

export default withStyles(styles)(App);
