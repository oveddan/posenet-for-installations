import * as React from "react";
import * as posenet from "oveddan-posenet";

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  WithStyles,
} from "@material-ui/core";
import Cast from "@material-ui/icons/Cast";
import {
  IControls,
  IConnectionControls,
  IConnectionState,
  IPoseMessage,
} from "../types";
import styles from "./styles";
import { useState, useCallback } from "react";

interface IConnectionButtonProps extends WithStyles<typeof styles> {
  controls: IConnectionControls;
  connection: IConnectionState;
  updateControls: (key: keyof IControls, controls: IConnectionControls) => void;
  setConnection: (connection: IConnectionState) => void;
  setPoses: (poses: posenet.Pose[]) => void;
  setImageSize: (imageSize: { width: number; height: number }) => void;
}

const ConnectionControls = ({
  connection: { status, socket },
  setConnection,
  classes,
  controls,
  updateControls,
  setPoses,
  setImageSize,
}: IConnectionButtonProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const openDialog = useCallback(() => {
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  const updateSocketStatus = useCallback(() => {
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
  }, [socket, setConnection]);

  const socketMessageReceived = useCallback(
    (ev: MessageEvent) => {
      // tslint:disable-next-line:no-console
      const { poses, image } = JSON.parse(ev.data) as IPoseMessage;

      setPoses(poses);
      setImageSize(image);
    },
    [setPoses, setImageSize]
  );

  const disconnectFromSocket = useCallback(() => {
    if (socket) {
      socket.close();

      socket.removeEventListener("open", updateSocketStatus);
      socket.removeEventListener("close", updateSocketStatus);
      socket.removeEventListener("message", socketMessageReceived);
    }

    setConnection({
      status: "closed",
    });
  }, [socket, updateSocketStatus, socketMessageReceived, setConnection]);

  const connectToSocket = useCallback(() => {
    if (controls.host) {
      disconnectFromSocket();

      const socket = new WebSocket(`ws://${controls.host}:${controls.port}`);

      socket.addEventListener("open", updateSocketStatus);
      socket.addEventListener("error", updateSocketStatus);
      socket.addEventListener("close", updateSocketStatus);

      setConnection({
        socket,
        status: "connecting",
      });

      socket.addEventListener("message", socketMessageReceived);
    }
  }, [
    controls.host,
    controls.port,
    setConnection,
    disconnectFromSocket,
    socketMessageReceived,
    updateSocketStatus,
  ]);

  const handleConnect = useCallback(() => {
    connectToSocket();

    closeDialog();
  }, [connectToSocket, closeDialog]);

  const handleDisconnect = useCallback(() => {
    disconnectFromSocket();

    closeDialog();
  }, [closeDialog, disconnectFromSocket]);

  const updateConnectionControls = (
    key: keyof IConnectionControls,
    value: any
  ) => {
    const newControls: IConnectionControls = {
      ...controls,
      [key]: value,
    };

    updateControls("connection", newControls);
  };

  const connectToChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConnectionControls("host", e.target.value);
  };

  const hostChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConnectionControls("port", e.target.value);
  };

  return (
    <span>
      <Button
        color={status === "open" ? "primary" : undefined}
        aria-label="Connect"
        className={classes.button}
        onClick={openDialog}
      >
        <Cast />
      </Button>
      <Dialog
        open={open || false}
        onClose={closeDialog}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Pose Connection</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {status === "closed" &&
              "Connect to the server to send or receive estimated poses."}
            {status === "open" && "Connected to:"}
            {status === "closed" && "Connecting to:"}
          </DialogContentText>
          <TextField
            label="host"
            key="host"
            value={controls.host}
            onChange={connectToChanged}
            margin="normal"
            disabled={status !== "closed"}
          />
          :
          <TextField
            label="port"
            key="port"
            value={controls.port}
            onChange={hostChanged}
            margin="normal"
            disabled={status !== "closed"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          {status === "closed" && (
            <Button onClick={handleConnect} color="primary">
              Connect
            </Button>
          )}
          {status === "open" && (
            <Button onClick={handleDisconnect} color="primary">
              Disconnect
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </span>
  );
};

export default ConnectionControls;
