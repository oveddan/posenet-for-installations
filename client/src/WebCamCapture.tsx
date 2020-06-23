import React, { useEffect, useState, useRef, useCallback } from "react";

import { captureWebcamIntoVideo } from "./video";

interface IWebCamCaptureProps {
  capture: boolean;
  deviceId?: string;
  onError: (error: string) => void;
  onLoaded: (video?: HTMLVideoElement) => void;
}

const WebCamCapture = ({
  capture,
  deviceId,
  onError,
  onLoaded,
}: IWebCamCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [capturing, setCapturing] = useState<boolean>(false);

  const [stream, setStream] = useState<MediaStream>();

  const captureVideo = useCallback(async () => {
    const video = videoRef.current as HTMLVideoElement;
    try {
      setStream(await captureWebcamIntoVideo(video, deviceId));

      onLoaded(video);
    } catch (e) {
      onError(
        "this browser does not support video capture," +
          "or this device does not have a camera"
      );
    }
  }, [onLoaded, onError, deviceId]);

  const stopCapture = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(undefined);
      onLoaded(undefined);
    }
  }, [onLoaded, stream]);

  useEffect(() => {
    if (capture) {
      if (!capturing) {
        setCapturing(true);
        captureVideo();
      }
    } else {
      if (capturing) {
        setCapturing(false);
        stopCapture();
      }
    }
  }, [capturing, capture, captureVideo, stopCapture]);

  return <video playsInline className="video" ref={videoRef} />;
};

export default WebCamCapture;
