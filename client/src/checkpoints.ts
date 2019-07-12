const BASE_URL = '/models/';

// tslint:disable-next-line:interface-name
export interface CheckpointConfig {
  baseUrl: string, folder: string, graphJson: string
}

// The PoseNet 2.0 ResNet50 models use the latest TensorFlow.js 1.0 model
// format.
export function resNet50Checkpoint(
    stride: number, quantBytes: number): CheckpointConfig {
  const graphJson = `model-stride${stride}.json`;
  // quantBytes=4 corresponding to the non-quantized full-precision checkpoints.
  const subFolder = quantBytes === 4 ? `float/` : `quant${quantBytes}/`;
  const folder = 'resnet50/' + subFolder;

  return {baseUrl: BASE_URL, folder, graphJson};
};

// The PoseNet 2.0 MobileNetV1 models use the latest TensorFlow.js 1.0 model
// format.
export function mobileNetCheckpoint(
    stride: number, multiplier: number, quantBytes: number): CheckpointConfig {
  const toStr: {[key: number]: string} = {1.0: '100', 0.75: '075', 0.50: '050'};
  const graphJson = `model-stride${stride}.json`;
  // quantBytes=4 corresponding to the non-quantized full-precision checkpoints.
  const subfolder = quantBytes === 4 ?
      `float/${toStr[multiplier]}/` :
      `quant${quantBytes}/${toStr[multiplier]}/`;

  const folder = 'mobilenet/' + subfolder;

  return {baseUrl: BASE_URL, graphJson, folder};
}
