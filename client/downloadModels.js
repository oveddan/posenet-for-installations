const MANIFEST_FILE = 'manifest.json';
const fs = require('fs');
const https = require('https');
const {join} = require('path');
const mkdirp = require('mkdirp');

function getFile(url) {
  console.log('downloading file at ' + url);
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res);
    });
  });
}

function saveFile(downloadStream, fileName) {
  const file = fs.createWriteStream(fileName);

  return new Promise((resolve, reject) => {
    const pipe = downloadStream.pipe(file);

    pipe.on('close', resolve);
  })
}

async function getAndSaveFile(url, folder, filePath) {
  const downloaded = await getFile(url);

  await saveFile(downloaded, join(folder, filePath));
}

async function getAndSaveAndLoadFile(url, folder, filePath) {
  await getAndSaveFile(url, folder, filePath);

  return new Promise((resolve, reject) => {
    fs.readFile(join(folder, filePath), 'utf8', (err, result) => {
      if (err)
        reject(err);
      else
        resolve(result);
    });
  })
}

async function loadAndSaveManifest(urlPath, saveFolder) {
  const manifestString = await getAndSaveAndLoadFile(
      urlPath + MANIFEST_FILE, saveFolder, MANIFEST_FILE);
  const manifest = JSON.parse(manifestString);

  return manifest;
}

async function loadAndSaveAllVariables(manifest, urlPath, saveFolder) {
  const variableNames = Object.keys(manifest);

  const variableSavePromises = variableNames.map((variableName) => {
    const {filename} = manifest[variableName];

    return getAndSaveFile(urlPath + filename, saveFolder, filename);
  });

  Promise.all(variableSavePromises)
      .then(() => {console.log('all variable saved')});
}

function mkdirpAsync(folder) {
  return new Promise((resolve, reject) => {
    mkdirp(folder, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

async function downloadCheckpoint(urlPath, saveFolder) {
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

async function downloadCheckpointFromSubfolder(subfolder) {
  await downloadCheckpoint(
      GOOGLE_CLOUD_STORAGE_DIR + subfolder,
      join(__dirname, 'public/models', subfolder));
}

const checkpointDownloads = checkpointSubfolders.map(
    (subfolder) => downloadCheckpointFromSubfolder(subfolder));

Promise.all(checkpointDownloads);
