import * as React from 'react';

import { captureWebcamIntoVideo } from "./video";

interface IWebCamCaptureProps {
  capture: boolean,
  deviceId?: string,
  onError: (error: string) => void,
  onLoaded: (video?: HTMLVideoElement) => void
}

class WebCamCapture extends React.Component<IWebCamCaptureProps> {
  private videoRef: React.RefObject<HTMLVideoElement>;
  private stream?: MediaStream;

  constructor(props: IWebCamCaptureProps) {
    super(props);

    this.videoRef = React.createRef();
  }

  public componentDidMount() {
    if (this.props.capture) {
      this.captureVideo();
    }
  }

  public componentWillReceiveProps(nextProps: IWebCamCaptureProps) {
    if (nextProps.capture && !this.props.capture) {
      this.captureVideo();
    }
    if (!nextProps.capture && this.props.capture) {
      this.stopCapture();
    }
  }

  public render() {
    return (<video playsInline className="video" ref={this.videoRef} />);
  }

  private captureVideo = async () => {
    const video = this.videoRef.current as HTMLVideoElement;
    try {
      this.stream = await captureWebcamIntoVideo(video, this.props.deviceId);

      this.props.onLoaded(video);
    } catch (e) {
      this.props.onError('this browser does not support video capture,' +
          'or this device does not have a camera');
    }
  }

  private stopCapture = async () => {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      })
      this.stream = undefined;
      this.props.onLoaded(undefined);
    }
  }
}

export default WebCamCapture;
