# PoseNet for Installations

This repository provides an ideal way to use [PoseNet](https://github.com/tensorflow/tfjs-models/tree/master/posenet) for installations; it runs totally offline and can stream poses over websocket to any consuming appication such as Unity, OpenFrameworks or TouchDesigner, or a browser on another computer or mobile device. Much of the useage is inspired by the wonderful work being done at [RunwayML](https://runwayapp.ai/)

![](PoseNetInstallation.gif)

PoseNet allows for real-time human pose estimation in the browser with any webcam, powered by machine learning and tensorflow.js.

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

Open http://localhost:3000, start a video capture and start estimating poses.  Then click to connect to the local node server hosted at localhost:8000; this will broadcast all estimated poses via a websocket through that server.

On your client application, consume from the websocket at ws://localhost:8080.

#### The pose messages:

When poses are estimated, they are broadcast over the websocket to all subscribers.  The object that is broadcast looks contains:

* **poses** - An array of poses that were estimated.  This follows the same format as what is returned from [posenet.estimateMultiplePoses](https://github.com/tensorflow/tfjs-models/tree/master/posenet#multi-person-pose-estimation).  Refer to that method's documentation for an explanation of the pose object.
* **image** - The size of the image the poses were estimated on.  This allows the x and y positions to be normalized to a different scale such as 0 to 1.  Note that the poses x and y in poseNet start from/have an origin at the top left of the screen, incrementing in value going right and down.

```json
{
   "image":{
      "width":640,
      "height":480
   },
   "poses":[
      {
         "score":0.36304738942314596,
         "keypoints":[
            {
               "score":0.8328775763511658,
               "part":"nose",
               "position":{
                  "x":-13.688090340035862,
                  "y":239.52947203318277
               }
            },
            {
               "score":0.8907157778739929,
               "part":"leftEye",
               "position":{
                  "x":-4.325634065221568,
                  "y":229.78147989908854
               }
            },
            {
               "score":0.4457024037837982,
               "part":"rightEye",
               "position":{
                  "x":-15.426258524910349,
                  "y":224.52771606445313
               }
            },
            {
               "score":0.8607040047645569,
               "part":"leftEar",
               "position":{
                  "x":16.80914206582992,
                  "y":229.8184631347656
               }
            },
            {
               "score":0.174045130610466,
               "part":"rightEar",
               "position":{
                  "x":-11.459165479316086,
                  "y":221.1838175455729
               }
            },
            {
               "score":0.962192177772522,
               "part":"leftShoulder",
               "position":{
                  "x":37.98613301261527,
                  "y":302.2597198486328
               }
            },
            {
               "score":0.45834219455718994,
               "part":"rightShoulder",
               "position":{
                  "x":-3.9096296967053026,
                  "y":298.102495320638
               }
            },
            {
               "score":0.7816433906555176,
               "part":"leftElbow",
               "position":{
                  "x":27.73797957623591,
                  "y":401.3367919921875
               }
            },
            {
               "score":0.14949043095111847,
               "part":"rightElbow",
               "position":{
                  "x":-0.5075093566394243,
                  "y":390.36883748372395
               }
            },
            {
               "score":0.13570570945739746,
               "part":"leftWrist",
               "position":{
                  "x":-22.4962658491291,
                  "y":409.99115022023517
               }
            },
            {
               "score":0.041653428226709366,
               "part":"rightWrist",
               "position":{
                  "x":-10.491187924244365,
                  "y":427.8301574707031
               }
            },
            {
               "score":0.25177454948425293,
               "part":"leftHip",
               "position":{
                  "x":9.068478443583505,
                  "y":473.309304300944
               }
            },
            {
               "score":0.11538269370794296,
               "part":"rightHip",
               "position":{
                  "x":-1.3889761752769596,
                  "y":473.36097513834636
               }
            },
            {
               "score":0.019853923469781876,
               "part":"leftKnee",
               "position":{
                  "x":-2.5295049948770494,
                  "y":469.2986684163411
               }
            },
            {
               "score":0.01517724059522152,
               "part":"rightKnee",
               "position":{
                  "x":-2.33144766385438,
                  "y":470.7204767862956
               }
            },
            {
               "score":0.024063894525170326,
               "part":"leftAnkle",
               "position":{
                  "x":-5.524195436571466,
                  "y":468.3872568766276
               }
            },
            {
               "score":0.012481093406677246,
               "part":"rightAnkle",
               "position":{
                  "x":-7.836129610655738,
                  "y":468.0144561767578
               }
            }
         ]
      },
      ...
   ],
}
```

#### To bundle as a distributable:

Run the command to create an executable of the application and server:

    yarn build-and-distribute

Copy client/posenet.exe and server/posenetServer.exe to the destination directory.

*TODO:* add a flag that allows changing the target OS.

## Development

If you want to develop the code, it is strongly recommended to use [VSCode](https://code.visualstudio.com/), as that
provides an ideal IDE for working with typesript.
