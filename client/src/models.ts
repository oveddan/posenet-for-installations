import {load, PoseNet} from '@tensorflow-models/posenet';
import {ModelConfig} from '@tensorflow-models/posenet/dist/posenet_model';

import {CheckpointConfig, mobileNetCheckpoint, resNet50Checkpoint} from './checkpoints';

const getCheckpointConfig = (config: ModelConfig): CheckpointConfig => {
  if (config.architecture === 'MobileNetV1') {
    return mobileNetCheckpoint(
        config.outputStride, config.multiplier || 1.0, config.quantBytes || 4);
  } else {
    return resNet50Checkpoint(config.outputStride, config.quantBytes || 4);
  }
};

const getUrl = (config: ModelConfig): string => {
  const {baseUrl, folder, graphJson} = getCheckpointConfig(config);

  return baseUrl + folder + graphJson;
};

export async function loadModel(config: ModelConfig): Promise<PoseNet> {
  const modelUrl = getUrl(config);

  const modelConfigWithLocalUrl: ModelConfig = {...config, modelUrl};

  return await load(modelConfigWithLocalUrl);
};
