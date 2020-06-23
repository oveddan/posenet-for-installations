import * as posenet from "oveddan-posenet";
import React, { useRef, useState, useEffect } from "react";
import "./App.css";

import {
  AppBar,
  createStyles,
  Grid,
  Theme,
  Toolbar,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import Controls from "./Controls";
import { PoseEstimator } from "./PoseEstimator";
import PosesRenderer from "./PosesRenderer";
import {
  IControls,
  IPoseMessage,
  ICameraState,
  IConnectionState,
  IModelState,
} from "./types";
import WebCamCapture from "./WebCamCapture";
import * as models from "./models";

const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      height: "100%",
    },
    paper: {
      padding: 2,
      textAlign: "center",
      color: palette.text.secondary,
      height: "100%",
    },
  });

const defaultControls: IControls = {
  camera: {
    capture: false,
  },
  connection: {
    host: window.location.hostname,
    port: "8080",
  },
  output: {
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    backgroundColor: "#FFFFFF",
    lineColor: "#00FFFF",
    lineThickness: 5,
    minPartConfidence: 0.1,
    minPoseConfidence: 0.15,
  },
  model: {
    architecture: "MobileNetV1",
    modelMultiplier: 1,
    outputStride: 16,
  },
  poseEstimation: {
    active: false,
    maxPoseDetections: 5,
    nmsRadius: 30.0,
    scoreThreshold: 0.1,
    internalResolution: "medium",
  },
};

const MenuBar = () => (
  <AppBar position="static" color="default">
    <Toolbar>
      <Typography variant="h1" color="inherit">
        PoseNet
      </Typography>
    </Toolbar>
  </AppBar>
);

const EmptyContent = () => (
  <Typography>
    Start a video capture or connect to the server to start
  </Typography>
);

interface IProps extends WithStyles<typeof styles> {}

const App = ({ classes }: IProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const [controls, setControls] = useState<IControls>(defaultControls);

  const [camera, setCamera] = useState<ICameraState>({});

  const [imageSize, setImageSize] = useState<{ width: number; height: number }>(
    { width: 0, height: 0 }
  );
  const [poses, setPoses] = useState<posenet.Pose[]>();

  const [connection, setConnection] = useState<IConnectionState>({
    status: "closed",
  });

  const webCamCaptureLoaded = (video?: HTMLVideoElement) => {
    const { width, height } = video || imageSize;
    setCamera((prevState) => ({
      ...prevState,
      video,
    }));
    setImageSize({ width, height });
  };

  const [error, onError] = useState<string | null>(null);

  const setVideoDevices = (devices: MediaDeviceInfo[]) => {
    setCamera((prevState) => ({
      ...prevState,
      devices,
    }));

    if (devices.length > 0) {
      setControls((prevState) => ({
        ...prevState,
        camera: {
          ...prevState.camera,
          deviceId: devices[0].deviceId,
        },
      }));
    }
  };

  const posesEstimated = (
    poses: posenet.Pose[],
    imageSize: { width: number; height: number }
  ) => {
    setPoses(poses);
    setImageSize(imageSize);

    const { video } = camera;
    const { socket, status } = connection;

    if (socket && video && status === "open") {
      const message: IPoseMessage = {
        poses,
        image: { width: video.width, height: video.height },
      };
      socket.send(JSON.stringify(message));
    }
  };

  const disconnectFromSocket = () => {
    const { socket: existingSocket } = connection;
    if (existingSocket) {
      existingSocket.close();

      existingSocket.removeEventListener("open", updateSocketStatus);
      existingSocket.removeEventListener("close", updateSocketStatus);
      existingSocket.removeEventListener("message", socketMessageReceived);
    }

    setConnection({
      status: "closed",
    });
  };

  const updateSocketStatus = () => {
    const { socket } = connection;
    if (!socket) {
      return;
    }
    if (socket.readyState === socket.OPEN) {
      setConnection({
        socket,
        status: "open",
      });
    } else if (socket.readyState === socket.CLOSED) {
      setConnection({
        socket,
        status: "closed",
      });
    }
  };

  const connectToSocket = () => {
    const { host, port } = controls.connection;

    if (host) {
      disconnectFromSocket();

      const socket = new WebSocket(`ws://${host}:${port}`);

      socket.addEventListener("open", updateSocketStatus);
      socket.addEventListener("error", updateSocketStatus);
      socket.addEventListener("close", updateSocketStatus);

      setConnection({
        socket,
        status: "connecting",
      });

      socket.addEventListener("message", socketMessageReceived);
    }
  };

  const socketMessageReceived = (ev: MessageEvent) => {
    // tslint:disable-next-line:no-console
    const { poses, image } = JSON.parse(ev.data) as IPoseMessage;

    setPoses(poses);
    setImageSize(image);
  };

  const [fullScreen, setFullScreen] = useState<boolean>(false);

  const exitFullScreen = () => {
    setFullScreen(false);

    if (rootRef.current) {
      rootRef.current.removeEventListener("touchstart", exitFullScreen);
      rootRef.current.removeEventListener("click", exitFullScreen);
    }
  };

  const goFullScreen = () => {
    setFullScreen(true);

    if (rootRef.current) {
      rootRef.current.addEventListener("touchstart", exitFullScreen);
      rootRef.current.addEventListener("click", exitFullScreen);
    }
  };

  const [model, setModel] = useState<IModelState>({ loadingStatus: "idle" });

  useEffect(() => {
    const loadModel = async () => {
      const net = await models.loadModel(controls.model);

      setModel({
        ...model,
        net,
        loadingStatus: "loaded",
      });
    };

    if (model.loadingStatus === "loading") {
      return;
    }

    setModel((prevState) => ({
      ...prevState,
      loadingStatus: "loading",
    }));

    if (model.net) {
      model.net.dispose();
    }

    loadModel();
  }, [model, controls.model]);

  return (
    <div className={classes.root} ref={rootRef}>
      {!model.net && <div id="loading">Loading the model...</div>}

      <WebCamCapture
        deviceId={controls.camera.deviceId}
        capture={controls.camera.capture}
        onLoaded={webCamCaptureLoaded}
        onError={onError}
      />

      {model.net && camera.video && (
        <PoseEstimator
          model={model}
          video={camera.video}
          {...controls.poseEstimation}
          onPosesEstimated={posesEstimated}
        />
      )}

      {!fullScreen && <MenuBar />}

      <Grid
        container
        justify="center"
        direction="row"
        alignItems="stretch"
        style={{ height: "95%" }}
      >
        <Grid item xs={12} md={8} direction="row" alignItems="stretch">
          {(camera.video || connection.socket) && (
            <PosesRenderer
              poses={poses}
              video={camera.video}
              imageSize={imageSize}
              {...controls.output}
            />
          )}
          {!camera.video && !connection.socket && <EmptyContent />}
        </Grid>
      </Grid>
      {!fullScreen && (
        <Controls
          controls={controls}
          updateControls={setControls}
          connection={connection}
          connect={connectToSocket}
          disconnect={disconnectFromSocket}
          model={model}
          camera={camera}
          setVideoDevices={setVideoDevices}
          poses={poses}
          goFullScreen={goFullScreen}
        />
      )}
    </div>
  );
};

export default withStyles(styles)(App);
