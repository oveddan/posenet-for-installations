import * as posenet from "oveddan-posenet";
import React, { useEffect, useState, useRef } from "react";
import { IModelState } from "./types";

interface IPoseEstimatorProps {
  model: IModelState;
  video: HTMLVideoElement;
  active: boolean;
  maxPoseDetections: number;
  scoreThreshold: number;
  nmsRadius: number;
  onPosesEstimated: (
    poses: posenet.Pose[],
    imageSize: { width: number; height: number }
  ) => void;
}

const flipHorizontal = true;

export const PoseEstimator = (props: IPoseEstimatorProps) => {
  const requestRef = useRef<number>();

  const poseDetectionFrame = async () => {
    const {
      active,
      model: { net, loadingStatus },
    } = props;

    if (net && active && loadingStatus === "loaded") {
      const poses = await net.estimateMultiplePoses(props.video, {
        flipHorizontal,
        maxDetections: props.maxPoseDetections,
        scoreThreshold: props.scoreThreshold,
        nmsRadius: props.nmsRadius,
      });

      const { width, height } = props.video;
      props.onPosesEstimated(poses, { width, height });
    }

    requestRef.current = requestAnimationFrame(poseDetectionFrame);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(poseDetectionFrame);

    return () => {
      if (typeof requestRef.current !== "undefined")
        cancelAnimationFrame(requestRef.current);
    };
  }, []);
};
