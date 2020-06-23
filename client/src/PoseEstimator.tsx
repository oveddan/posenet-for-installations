import * as posenet from "oveddan-posenet";
import React, { useEffect, useState, useRef, useCallback } from "react";
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

export const PoseEstimator = ({
  active,
  model: { net, loadingStatus },
  video,
  maxPoseDetections,
  scoreThreshold,
  nmsRadius,
  onPosesEstimated,
}: IPoseEstimatorProps) => {
  const requestRef = useRef<number>();

  const estimatePoses = useCallback(async () => {
    if (net && active && loadingStatus === "loaded") {
      const poses = await net.estimateMultiplePoses(video, {
        flipHorizontal,
        maxDetections: maxPoseDetections,
        scoreThreshold: scoreThreshold,
        nmsRadius: nmsRadius,
      });

      const { width, height } = video;
      onPosesEstimated(poses, { width, height });
    }
  }, [
    net,
    active,
    loadingStatus,
    video,
    maxPoseDetections,
    scoreThreshold,
    nmsRadius,
    onPosesEstimated,
  ]);

  const poseDetectionFrame = async () => {
    await estimatePoses();

    requestAnimationFrame(poseDetectionFrame);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(poseDetectionFrame);

    return () => {
      if (typeof requestRef.current !== "undefined")
        cancelAnimationFrame(requestRef.current);
    };
  });

  return null;
};
