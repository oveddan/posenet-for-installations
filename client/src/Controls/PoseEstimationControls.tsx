import React, { useState, useMemo, useCallback } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  WithStyles,
} from "@material-ui/core";
import DirectionsWalk from "@material-ui/icons/DirectionsWalk";
import {
  IControls,
  IModelState,
  IPoseEstimationControls,
  IModelControls,
  OutputStride,
} from "../types";
import { SliderControl, SwitchControl, DropDownControl } from "../UI";
import styles from "./styles";
import { PoseNetArchitecture } from "oveddan-posenet/dist/types";
import * as posenet from "oveddan-posenet";

interface IPoseEstimationControlsProps extends WithStyles<typeof styles> {
  poseEstimationControls: IPoseEstimationControls;
  modelControls: IModelControls;
  model: IModelState;
  updateControls: (
    key: keyof IControls,
    controls: IPoseEstimationControls | IModelControls
  ) => void;
}

const architectureOptions: string[][] = [
  ["MobileNetV1", "MobileNetV1"],
  ["ResNet50", "ResNet50"],
];

const getValidModelMulitplier = (
  originalMultiplier: posenet.MobileNetMultiplier,
  architecture: PoseNetArchitecture
): posenet.MobileNetMultiplier => {
  if (architecture === "ResNet50") return 1;

  return originalMultiplier;
};

const getValidStride = (
  originalOutpuStride: OutputStride,
  architecture: PoseNetArchitecture
): OutputStride => {
  if (architecture === "ResNet50") {
    if (originalOutpuStride === 8) {
      return 16;
    }
    return originalOutpuStride;
  }

  if (originalOutpuStride === 32) return 16;

  return originalOutpuStride;
};

const PoseEstimationControls = ({
  modelControls,
  poseEstimationControls,
  model: { loadingStatus },
  classes,
  updateControls,
}: IPoseEstimationControlsProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const multiplierOptions = useMemo<string[][]>(() => {
    if (modelControls.architecture === "ResNet50") {
      return [["1", "1.00"]];
    } else {
      return [
        ["0.5", "0.50"],
        ["0.75", "0.75"],
        ["1", "1.00"],
      ];
    }
  }, [modelControls.architecture]);

  const outputStrideOptions = useMemo<string[][]>(() => {
    if (modelControls.architecture === "ResNet50") {
      return [
        ["16", "16"],
        ["32", "32"],
      ];
    } else {
      return [
        ["8", "8"],
        ["16", "16"],
      ];
    }
  }, [modelControls.architecture]);

  const openDialog = useCallback(() => {
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  const updateArchitecture = useCallback(
    (key: keyof IModelControls, newArchitecture: string) => {
      const validMultipler = getValidModelMulitplier(
        modelControls.modelMultiplier,
        newArchitecture as PoseNetArchitecture
      );
      const validOutputStride = getValidStride(
        modelControls.outputStride,
        newArchitecture as PoseNetArchitecture
      );

      const newControls: IModelControls = {
        ...modelControls,
        modelMultiplier: validMultipler,
        outputStride: validOutputStride,
        architecture: newArchitecture as PoseNetArchitecture,
      };
    },
    [modelControls]
  );

  const updateModelControls = useCallback(
    (key: keyof IModelControls, value: any) => {
      const newControls: IModelControls = {
        ...modelControls,
        [key]: value,
      };

      updateControls("model", newControls);
    },
    [modelControls, updateControls]
  );

  const updateModelMultiplier = useCallback(
    (key: keyof IModelControls, multiplier: string) => {
      updateModelControls(key, +multiplier);
    },
    [updateModelControls]
  );

  const updateOutputStride = useCallback(
    (key: keyof IModelControls, outputStride: string) => {
      updateModelControls(key, +outputStride);
    },
    [updateModelControls]
  );

  const updateInputResolution = useCallback(
    (key: keyof IModelControls, inputResolution: string) => {
      updateModelControls(key, +inputResolution);
    },
    [updateModelControls]
  );

  const updatePoseEstimationControls = useCallback(
    (key: keyof IPoseEstimationControls, value: any) => {
      const newControls: IPoseEstimationControls = {
        ...poseEstimationControls,
        [key]: value,
      };

      updateControls("poseEstimation", newControls);
    },
    [poseEstimationControls, updateControls]
  );

  return (
    <span>
      <Button
        variant="fab"
        color={poseEstimationControls.active ? "primary" : undefined}
        aria-label="Estimate"
        className={classes.button}
        onClick={openDialog}
      >
        <DirectionsWalk />
      </Button>
      <Dialog
        open={open || false}
        onClose={closeDialog}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Pose Estimation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {poseEstimationControls.active && "Estimating Poses"}
            {!poseEstimationControls.active &&
              loadingStatus === "idle" &&
              "Load the model and estimate poses"}
            {!poseEstimationControls.active &&
              loadingStatus === "loading" &&
              "Loading the model..."}
            {!poseEstimationControls.active &&
              loadingStatus === "error" &&
              "Error loading the model..."}
          </DialogContentText>
          <DropDownControl
            key="architecture"
            controls={modelControls}
            controlKey="architecture"
            text="Input Resolution"
            options={architectureOptions}
            updateControls={updateModelControls}
            disabled={loadingStatus === "loading"}
          />
          <DropDownControl
            key="modelMultiplier"
            controls={modelControls}
            controlKey="modelMultiplier"
            text="Model Multiplier"
            options={multiplierOptions}
            updateControls={updateModelMultiplier}
            disabled={loadingStatus === "loading"}
          />
          <DropDownControl
            key="outputStride"
            controls={modelControls}
            controlKey="outputStride"
            text="Output Stride"
            options={outputStrideOptions}
            updateControls={updateOutputStride}
            disabled={loadingStatus === "loading"}
          />
          <SliderControl
            key="internalResolution"
            controls={poseEstimationControls}
            controlKey="internalResolution"
            min={0}
            max={1}
            step={0.01}
            text="Internal Resolution"
            updateControls={updatePoseEstimationControls}
          />
          <SliderControl
            key="maxPoseDetections"
            controls={poseEstimationControls}
            controlKey="maxPoseDetections"
            min={0}
            max={20}
            step={1}
            text="max pose detections"
            updateControls={updatePoseEstimationControls}
          />
          <SliderControl
            key="nmsRadius"
            controls={poseEstimationControls}
            controlKey="nmsRadius"
            min={0}
            max={100}
            step={1}
            text="nms radius"
            updateControls={updatePoseEstimationControls}
          />
          <SliderControl
            key="scoreThreshold"
            controls={poseEstimationControls}
            controlKey="scoreThreshold"
            min={0}
            max={1}
            text="score threshold"
            updateControls={updatePoseEstimationControls}
          />

          <SwitchControl
            controls={poseEstimationControls}
            controlKey="active"
            updateControls={updatePoseEstimationControls}
            disabled={loadingStatus !== "loaded"}
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

export default PoseEstimationControls;
