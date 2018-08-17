const MANIFEST_FILE = 'manifest.json';
import * as fs from 'fs';
import * as https from 'https';
import {IncomingMessage} from 'http';
import {join} from 'path';
import * as mkdirp from 'mkdirp';

function getFile(url: string) {
  console.log('downloading file at ' + url);
  return new Promise<IncomingMessage>((resolve) => {
    https.get(url, (res: IncomingMessage) => {
      resolve(res);
    });
  });
}

function saveFile(downloadStream: IncomingMessage, fileName: string) {
  const file = fs.createWriteStream(fileName);

  return new Promise<void>((resolve, reject) => {
    const pipe = downloadStream.pipe(file);

    pipe.on('close', resolve);
  })
}

async function getAndSaveFile(url: string, folder: string, filePath: string) {
  const downloaded = await getFile(url);

  await saveFile(downloaded, join(folder, filePath));
}

async function getAndSaveAndLoadFile(
    url: string, folder: string, filePath: string) {
  await getAndSaveFile(url, folder, filePath);

  return new Promise<string>((resolve, reject) => {
    fs.readFile(join(folder, filePath), 'utf8', (err, result) => {
      if (err)
        reject(err);
      else
        resolve(result);
    });
  })
}

async function loadAndSaveManifest(
    urlPath: string, saveFolder: string): Promise<object> {
  const manifestString = await getAndSaveAndLoadFile(
      urlPath + MANIFEST_FILE, saveFolder, MANIFEST_FILE);
  const manifest = JSON.parse(manifestString);

  return manifest;
}

async function loadAndSaveAllVariables(
    manifest: object, urlPath: string, saveFolder: string) {
  const variableNames = Object.keys(manifest);

  const variableSavePromises: Array<Promise<void>> =
      variableNames.map((variableName: string) => {
        const {filename} = manifest[variableName];

        return getAndSaveFile(urlPath + filename, saveFolder, filename);
      });

  Promise.all(variableSavePromises)
      .then(() => {console.log('all variable saved')});
}

function mkdirpAsync(folder: string) {
  return new Promise<void>((resolve, reject) => {
    mkdirp(folder, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

async function downloadCheckpoint(
    urlPath: string, saveFolder: string): Promise<void> {
  await mkdirpAsync(saveFolder);
  const manifest = await loadAndSaveManifest(urlPath, saveFolder);

  await loadAndSaveAllVariables(manifest, urlPath, saveFolder);
}

const GOOGLE_CLOUD_STORAGE_DIR =
    'https://storage.googleapis.com/tfjs-models/weights/posenet/';

const checkpointSubfolders = [
  'mobilenet_v1_101/', 'mobilenet_v1_100/', 'mobilenet_v1_075/',
  'mobilenet_v1_050/'
];

async function downloadCheckpointFromSubfolder(subfolder: string) {
  await downloadCheckpoint(
      GOOGLE_CLOUD_STORAGE_DIR + subfolder,
      join(__dirname, 'models', subfolder));
}

const checkpointDownloads = checkpointSubfolders.map(
    (subfolder: string) => downloadCheckpointFromSubfolder(subfolder));

Promise.all(checkpointDownloads);
