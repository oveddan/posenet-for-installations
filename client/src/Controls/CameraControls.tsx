import * as React from "react";

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  WithStyles,
} from "@material-ui/core";
import Videocam from "@material-ui/icons/Videocam";
import { IControls, ICameraState, ICameraControls } from "../types";
import { SwitchControl, DropDownControl } from "../UI";
import { useState, useCallback, useEffect, useMemo } from "react";
import styles from "./styles";

interface ICameraControlsProps extends WithStyles<typeof styles> {
  controls: ICameraControls;
  camera: ICameraState;
  updateControls: (key: keyof IControls, controls: ICameraControls) => void;
  setVideoDevices: (devices: MediaDeviceInfo[]) => void;
}

const CameraControls = ({
  setVideoDevices,
  camera,
  controls,
  updateControls,
  classes,
}: ICameraControlsProps) => {
  const [open, setOpen] = useState<boolean>(false);
  // const [selectedDevice, setSelectedDevice] = useState<string>();

  useEffect(() => {
    (async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      setVideoDevices(videoDevices);
    })();
  }, [setVideoDevices]);

  const deviceOptions = useMemo((): string[][] => {
    if (!camera.devices) {
      return [];
    }

    return camera.devices.map((device) => [device.deviceId, device.label]);
  }, [camera.devices]);

  const { isCapturing, isStartingCapture } = useMemo(() => {
    return {
      isCapturing: controls.capture && camera.video,
      isStartingCapture: controls.capture && !camera.video,
    };
  }, [controls.capture, camera.video]);

  const buttonColor = useMemo((): "primary" | "secondary" | undefined => {
    if (isCapturing) {
      return "primary";
    }
    if (isStartingCapture) {
      return "secondary";
    }
    return;
  }, [isCapturing, isStartingCapture]);

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const updateCameraControls = useCallback(
    (key: keyof ICameraControls, value: any) => {
      const newControls: ICameraControls = {
        ...controls,
        [key]: value,
      };

      updateControls("camera", newControls);
    },
    [controls, updateControls]
  );

  const { currentDevice } = camera;

  return (
    <span>
      <Button
        variant="fab"
        color={buttonColor}
        aria-label="Connect"
        className={classes.button}
        onClick={openDialog}
        disabled={isStartingCapture}
      >
        <Videocam />
      </Button>
      <Dialog
        open={open || false}
        onClose={closeDialog}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Video Capture</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isCapturing && `Capturing on camera ${currentDevice}`}
          </DialogContentText>

          <DropDownControl
            key="deviceId"
            controls={controls}
            controlKey="deviceId"
            text="Video Device"
            options={deviceOptions}
            updateControls={updateCameraControls}
            disabled={!(!isCapturing && !isStartingCapture)}
          />

          <SwitchControl
            controls={controls}
            controlKey="capture"
            updateControls={updateCameraControls}
            disabled={isStartingCapture}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </span>
  );
};

export default CameraControls;
