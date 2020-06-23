import React from "react";
import {
  FormControl,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  WithStyles,
  Typography,
} from "@material-ui/core";
import TransferWithinAStation from "@material-ui/icons/TransferWithinAStation";
import { IControls, IOutputControls } from "../types";
import { SliderControl, SwitchControl } from "../UI";
import { CompactPicker, ColorResult } from "react-color";
import { useState, useCallback } from "react";
import styles from "./styles";

interface IOutputControlsProps extends WithStyles<typeof styles> {
  controls: IOutputControls;
  updateControls: (key: keyof IControls, controls: IOutputControls) => void;
}

const OutputControls = (props: IOutputControlsProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const openDialog = useCallback(() => {
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  const updateControls = (key: keyof IOutputControls, value: any) => {
    const newControls: IOutputControls = {
      ...props.controls,
      [key]: value,
    };

    props.updateControls("output", newControls);
  };

  const changeLineColor = (color: ColorResult) => {
    updateControls("lineColor", color.hex);
  };

  const changeBackgroundColor = (color: ColorResult) => {
    updateControls("backgroundColor", color.hex);
  };

  const { controls, classes } = props;
  return (
    <span>
      <Button
        aria-label="Estimate"
        className={classes.button}
        onClick={openDialog}
      >
        <TransferWithinAStation />
      </Button>
      <Dialog
        open={open || false}
        onClose={closeDialog}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Display/Output</DialogTitle>
        <DialogContent>
          <DialogContentText>Display/Output</DialogContentText>
          <SwitchControl
            controls={controls}
            controlKey="showVideo"
            updateControls={updateControls}
          />
          {!controls.showVideo && (
            <FormControl>
              <Typography>Background Color</Typography>
              <CompactPicker
                color={props.controls.backgroundColor}
                onChange={changeBackgroundColor}
              />
            </FormControl>
          )}
          <SwitchControl
            controls={controls}
            controlKey="showSkeleton"
            updateControls={updateControls}
          />
          <SwitchControl
            controls={controls}
            controlKey="showPoints"
            updateControls={updateControls}
          />
          <FormControl>
            <Typography>Line Color</Typography>
            <CompactPicker
              color={props.controls.lineColor}
              onChange={changeLineColor}
            />
          </FormControl>
          <SliderControl
            key="lineThickness"
            controls={controls}
            controlKey="lineThickness"
            min={0}
            max={100}
            text="line thickness"
            updateControls={updateControls}
          />
          <SliderControl
            key="minPartConfidence"
            controls={controls}
            controlKey="minPartConfidence"
            min={0}
            max={1}
            text="min part confidence"
            updateControls={updateControls}
          />
          <SliderControl
            key="minPoseConfidence"
            controls={controls}
            controlKey="minPoseConfidence"
            min={0}
            max={1}
            text="min pose confidence"
            updateControls={updateControls}
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

export default OutputControls;
