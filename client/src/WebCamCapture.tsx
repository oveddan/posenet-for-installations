import React, { useEffect, useState, useRef } from "react";

import { captureWebcamIntoVideo } from "./video";

interface IWebCamCaptureProps {
  capture: boolean;
  deviceId?: string;
  onError: (error: string) => void;
  onLoaded: (video?: HTMLVideoElement) => void;
}

const WebCamCapture = (props: IWebCamCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [capturing, setCapturing] = useState<boolean>(false);

  const [stream, setStream] = useState<MediaStream>();

  const captureVideo = async () => {
    const video = videoRef.current as HTMLVideoElement;
    try {
      setStream(await captureWebcamIntoVideo(video, props.deviceId));

      props.onLoaded(video);
    } catch (e) {
      props.onError(
        "this browser does not support video capture," +
          "or this device does not have a camera"
      );
    }
  };

  const stopCapture = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(undefined);
      props.onLoaded(undefined);
    }
  };

  useEffect(() => {
    if (props.capture) {
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
  }, [capturing, props.capture, captureVideo, stopCapture]);

  return <video playsInline className="video" ref={videoRef} />;
};

export default WebCamCapture;
