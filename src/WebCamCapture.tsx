import * as React from 'react';

import { captureWebcamIntoVideo } from "./video";

interface IWebCamCaptureProps {
  onError: (error: string) => void,
  onLoaded: (video: HTMLVideoElement) => void
}

class WebCamCapture extends React.Component<IWebCamCaptureProps> {
  private videoRef: React.RefObject<HTMLVideoElement>;

  constructor(props: IWebCamCaptureProps) {
    super(props);

    this.videoRef = React.createRef();
  }

  public async componentDidMount() {
    const video = this.videoRef.current as HTMLVideoElement;

    try {
      await captureWebcamIntoVideo(video);

      this.props.onLoaded(video);
    } catch (e) {
      this.props.onError('this browser does not support video capture,' +
          'or this device does not have a camera');
    }
  }

  public render() {
    return (<video playsinline={true} className="video" ref={this.videoRef} />);
  }
}

export default WebCamCapture;
