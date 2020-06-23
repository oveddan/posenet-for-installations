import { io } from "@tensorflow/tfjs-core";
import axios from "axios";
import * as fs from "fs";
import { IncomingMessage } from "http";
import * as https from "https";
import * as mkdirp from "mkdirp";
import { join } from "path";
import * as zlib from "zlib";
import { parse } from "url";

const BASE_URL =
  "https://storage.googleapis.com/tfjs-models/savedmodel/posenet/";

// tslint:disable-next-line:interface-name
interface CheckpointConfig {
  baseUrl: string;
  folder: string;
  graphJson: string;
}

// The PoseNet 2.0 ResNet50 models use the latest TensorFlow.js 1.0 model
// format.
function resNet50Checkpoint(
  stride: number,
  quantBytes: number
): CheckpointConfig {
  const graphJson = `model-stride${stride}.json`;
  // quantBytes=4 corresponding to the non-quantized full-precision checkpoints.
  const subFolder = quantBytes === 4 ? `float/` : `quant${quantBytes}/`;
  const folder = "resnet50/" + subFolder;

  return { baseUrl: BASE_URL, folder, graphJson };
}

// The PoseNet 2.0 MobileNetV1 models use the latest TensorFlow.js 1.0 model
// format.
export function mobileNetCheckpoint(
  stride: number,
  multiplier: number,
  quantBytes: number
): CheckpointConfig {
  const toStr: { [key: number]: string } = {
    1.0: "100",
    0.75: "075",
    0.5: "050",
  };
  const graphJson = `model-stride${stride}.json`;
  // quantBytes=4 corresponding to the non-quantized full-precision checkpoints.
  const subfolder =
    quantBytes === 4
      ? `float/${toStr[multiplier]}/`
      : `quant${quantBytes}/${toStr[multiplier]}/`;

  const folder = "mobilenet/" + subfolder;

  return { baseUrl: BASE_URL, graphJson, folder };
}

function mkdirpAsync(folder: string) {
  return new Promise((resolve, reject) => {
    mkdirp(folder, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

function getFile(url: string): Promise<IncomingMessage> {
  const parseUrl = parse(url);
  console.log("getting from", url);
  return new Promise((resolve) => {
    https.get(
      {
        hostname: parseUrl.hostname,
        path: parseUrl.path,
        port: 443,
        headers: { "accept-encoding": "gzip,deflate" },
      },
      (res) => {
        resolve(res);
      }
    );
  });
}

function saveFile(downloadStream: IncomingMessage, fileName: string) {
  const file = fs.createWriteStream(fileName);

  return new Promise((resolve, reject) => {
    const pipe = downloadStream.pipe(zlib.createGunzip()).pipe(file);

    pipe.on("close", resolve);
  });
}

// function gUnzipPromise(
//     fileContents: Buffer, filePath: string): Promise<Buffer> {
//   return new Promise((resolve, reject) => {
//     gunzip(fileContents, (e, result) => {
//       if (e) {
//         console.error('could not extract file at ' + filePath, e);
//         reject(e);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// }

// async function extractFile(filePath: string): Promise<void> {
//   const fileContents = await fs.promises.readFile(filePath);

//   const extractedContents = await gUnzipPromise(fileContents, filePath);

//   await fs.promises.writeFile(filePath, extractedContents);
// };

async function downloadSaveAndExtractFile(
  url: string,
  folder: string,
  filePath: string
) {
  const downloaded = await getFile(url);

  const savePath = join(folder, filePath);

  await saveFile(downloaded, savePath);
}

/**
 * Extract the prefix and suffix of the url, where the prefix is the path before
 * the last file, and suffix is the search params after the last file.
 * ```
 * const url = 'http://tfhub.dev/model/1/tensorflowjs_model.pb?tfjs-format=file'
 * [prefix, suffix] = parseUrl(url)
 * // prefix = 'http://tfhub.dev/model/1/'
 * // suffix = '?tfjs-format=file'
 * ```
 * @param url the model url to be parsed.
 */
export function parseUrl(url: string): [string, string] {
  const lastSlash = url.lastIndexOf("/");
  const lastSearchParam = url.lastIndexOf("?");
  const prefix = url.substring(0, lastSlash);
  const suffix =
    lastSearchParam > lastSlash ? url.substring(lastSearchParam) : "";
  return [prefix + "/", suffix];
}

const loadAndSaveWeights = async (
  weightPath: string,
  weightsManifest: io.WeightsManifestConfig,
  savePath: string
): Promise<void> => {
  const [pathPrefix, suffix] = parseUrl(weightPath);

  const weightSpecs: io.WeightsManifestEntry[] = [];
  for (const entry of weightsManifest) {
    weightSpecs.push(...entry.weights);
  }

  const pathsAndUrls: Array<{ path: string; fetchUrl: string }> = [];

  weightsManifest.forEach((weightsGroup) => {
    weightsGroup.paths.forEach((path) => {
      const fetchUrl = pathPrefix + path + suffix;
      pathsAndUrls.push({ path, fetchUrl });
    });
  });

  const fetchesAndSaves = pathsAndUrls.map(({ path, fetchUrl }) => {
    return downloadSaveAndExtractFile(fetchUrl, savePath, path);
  });

  await Promise.all(fetchesAndSaves);
};

const loadAndSaveModel = async (
  { baseUrl, folder, graphJson }: CheckpointConfig,
  modelSaveFolder: string
) => {
  const fetchPath = baseUrl + folder + graphJson;

  let modelConfig: io.ModelJSON;
  try {
    const jsonResponse = await axios.get<io.ModelJSON>(fetchPath);

    modelConfig = jsonResponse.data;
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
    throw new Error(`Request to ${fetchPath} failed`);
  }

  const modelTopology = modelConfig.modelTopology;
  const weightsManifest = modelConfig.weightsManifest;

  // We do not allow both modelTopology and weightsManifest to be missing.
  if (modelTopology == null && weightsManifest == null) {
    throw new Error(
      `The JSON from HTTP path ${fetchPath} contains neither model ` +
        `topology or manifest for weights.`
    );
  }

  const saveFolder = join(modelSaveFolder, folder);
  // create save folder
  await mkdirpAsync(saveFolder);
  // save model config json
  const modelJsonPath = join(saveFolder, graphJson);
  console.log("saving model json to ", modelJsonPath);
  await fs.promises.writeFile(modelJsonPath, JSON.stringify(modelConfig));

  // load and save the weights
  await loadAndSaveWeights(fetchPath, weightsManifest, saveFolder);
};

const mobileNetOutputStrides = [8, 16];
const mobileNetMultipliers = [0.5, 0.75, 1.0];
const mobileNetQuantBytes = [2, 4];

const getMobileNetCheckpoints = () => {
  const checkpoints: CheckpointConfig[] = [];

  mobileNetMultipliers.forEach((multiplier) => {
    mobileNetOutputStrides.forEach((outputStride) => {
      mobileNetQuantBytes.forEach((quantBytes) => {
        checkpoints.push(
          mobileNetCheckpoint(outputStride, multiplier, quantBytes)
        );
      });
    });
  });

  return checkpoints;
};

const resNetOutputStrides = [16, 32];
const resNetQuantBytes = [1, 2, 4];

const getResnetCheckpoints = () => {
  const checkpoints: CheckpointConfig[] = [];

  resNetOutputStrides.forEach((outputStride) => {
    resNetQuantBytes.forEach((quantBytes) => {
      checkpoints.push(resNet50Checkpoint(outputStride, quantBytes));
    });
  });

  return checkpoints;
};

const main = async () => {
  // const checkpoint = resNet50Checkpoint(16, 4);
  const modelSaveFolder = join(__dirname, "../../client", "public/models");

  const mobileNetCheckpoints = getMobileNetCheckpoints();
  const resnetCheckpoints = getResnetCheckpoints();

  const checkpoints = resnetCheckpoints.concat(mobileNetCheckpoints);

  console.log("loading and saving...");

  const saves = checkpoints.map((checkpoint) =>
    loadAndSaveModel(checkpoint, modelSaveFolder)
  );

  await Promise.all(saves);

  console.log("done");
};

main();
