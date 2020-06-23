import * as React from "react";

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
import { IControls, IConnectionControls, IConnectionState } from "../types";
import styles from "./styles";

interface IConnectionButtonProps extends WithStyles<typeof styles> {
  controls: IConnectionControls;
  connection: IConnectionState;
  connect: () => void;
  disconnect: () => void;
  updateControls: (key: keyof IControls, controls: IConnectionControls) => void;
}

class ConnectionControls extends React.Component<
  IConnectionButtonProps,
  {
    open: boolean;
  }
> {
  public state = {
    open: false,
  };

  public render() {
    const {
      connection: { status },
      classes,
      controls,
    } = this.props;
    return (
      <span>
        <Button
          variant="fab"
          color={status === "open" ? "primary" : undefined}
          aria-label="Connect"
          className={classes.button}
          onClick={this.openDialog}
        >
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
              {status === "closed" &&
                "Connect to the server to send or receive estimated poses."}
              {status === "open" && "Connected to:"}
              {status === "closed" && "Connecting to:"}
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
    );
  }

  private openDialog = () => {
    this.setState({ open: true });
  };

  private closeDialog = () => {
    this.setState({ open: false });
  };

  private handleConnect = () => {
    this.props.connect();

    this.closeDialog();
  };

  private handleDisconnect = () => {
    this.props.disconnect();

    this.closeDialog();
  };

  private connectToChanged: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    this.updateControls("host", e.target.value);
  };

  private hostChanged: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    this.updateControls("port", e.target.value);
  };

  private updateControls = (key: keyof IConnectionControls, value: any) => {
    const newControls: IConnectionControls = {
      ...this.props.controls,
      [key]: value,
    };

    this.props.updateControls("connection", newControls);
  };
}

export default ConnectionControls;
