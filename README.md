# PoseNet for Installations

This repository provides an ideal way to use [PoseNet](https://github.com/tensorflow/tfjs-models/tree/master/posenet) for installations.
PoseNet allows for real-time human pose estimation in the browser with any webcam, powered by machine learning and tensorflow.js. Much of the useage is inspired by the wonderful work being done at [RunwayML](https://runwayapp.ai/)

![](PosenetInstallation.gif)

This application is a re-write of the camera demo with a few improvements ideal for a scenario where it is to be run as part of an installation:

1.  It works totally offline; it provides a script to download the models, and serves them locally.  This way it works whether or not there is an internet connection.
2.  It has a new streamlined ui through material UI; there is a "full-screen" button which hides all of the controls.
3.  It allows estimated poses to be broadcast over websocket.  This allows processing to be done in the browser, and consumed anywhere, whether it be another application like Unity, OpenFrameworks or TouchDesigner, or a browser on another computer or mobile device.  To support this, it provides a lightweight node.js server to relay the messages.
4.  It supports selecting different cameras.
5.  It allows for customization of the output display, such as line color, thickness, and displaying the video or not.
6.  It leverages [nexe](https://github.com/nexe/nexe) to create single executables out of the app, allowing for it to be easily deployed to any target machine regardless of the platform and without needing to install anything on that machine.

The app is built in react, material-ui, and typescript, and was bootstrapped with create-react-app.

## Usage

**Make sure to have yarn installed.**  If you don't, follow the instructions to do so [here](https://yarnpkg.com/lang/en/docs/install/#mac-stable)

#### To run:

Install all dependencies:

    yarn setup

Download all the models:

    yarn download-models

Start the application and the node.js server (responsible for broadcasting pose messages over websocket):

    yarn start

To just start the application (if you don't want to broadcast the poses over websocket):

    yarn start-client

## Development

If you want to develop the code, it is strongly recommended to use [VSCode](https://code.visualstudio.com/), as that
provides an ideal IDE for working with typesript.
