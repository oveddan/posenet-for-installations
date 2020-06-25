import {
  IControls,
  IConnectionState,
  ICameraState,
  IModelState,
  IModelControls,
} from "../types";
import { WithStyles, withStyles } from "@material-ui/core/styles";
import styles from "./styles";
import * as posenet from "oveddan-posenet";
import FullScreen from "@material-ui/icons/Fullscreen";
import Button from "@material-ui/core/Button";
import React from "react";
import ConnectionControls from "./ConnectionControls";
import CameraControls from "./CameraControls";
import OutputControls from "./OutputControls";
import PoseEstimationControls from "./PoseEstimationControls";

type updateSubControls = <key extends keyof IControls>(
  key: key,
  controls: IControls[key]
) => void;

interface IControlProps extends WithStyles<typeof styles> {
  controls: IControls;
  connection: IConnectionState;
  camera: ICameraState;
  model: IModelState;
  poses?: posenet.Pose[];
  setConnection: (connection: IConnectionState) => void;
  setPoses: (poses: posenet.Pose[]) => void;
  setImageSize: (imageSize: { width: number; height: number }) => void;
  goFullScreen: () => void;
  updateControls: (controls: IControls) => void;
  loadModel: (modelControls: IModelControls) => void;
  setVideoDevices: (devices: MediaDeviceInfo[]) => void;
}

const Controls = ({
  poses,
  camera,
  setConnection,
  setVideoDevices,
  goFullScreen,
  model,
  loadModel,
  connection,
  classes,
  controls,
  updateControls,
  setPoses,
  setImageSize,
}: IControlProps) => {
  const updateSubControls: updateSubControls = (
    key: keyof IControls,
    newControls
  ) => {
    const newControl: IControls = {
      ...controls,
      [key]: newControls,
    };

    updateControls(newControl);
  };

  return (
    <div className={classes.fab}>
      <ConnectionControls
        connection={connection}
        setConnection={setConnection}
        controls={controls.connection}
        updateControls={updateSubControls}
        setPoses={setPoses}
        setImageSize={setImageSize}
        classes={classes}
      />
      <CameraControls
        controls={controls.camera}
        updateControls={updateSubControls}
        classes={classes}
        camera={camera}
        setVideoDevices={setVideoDevices}
      />
      {camera.video && (
        <PoseEstimationControls
          poseEstimationControls={controls.poseEstimation}
          modelControls={controls.model}
          loadModel={loadModel}
          updateControls={updateSubControls}
          model={model}
          classes={classes}
        />
      )}
      {poses && (
        <OutputControls
          controls={controls.output}
          updateControls={updateSubControls}
          classes={classes}
        />
      )}
      {(camera.video || poses) && (
        <Button
          aria-label="Go Full Screen"
          className={classes.button}
          onClick={goFullScreen}
        >
          <FullScreen />
        </Button>
      )}
    </div>
  );
};

export default withStyles(styles)(Controls);
