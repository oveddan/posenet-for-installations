const MANIFEST_FILE = 'manifest.json';
import * as fs from 'fs';
import * as http from 'http';
import {checkpoints} from '@tensorflow-models/posenet';

function getFile(url: string) {
  return new Promise<http.IncomingMessage>((resolve, reject) => {
    http.get(url, (res: http.IncomingMessage) => {
      resolve(res);
    });
  });
}

function saveFile(downloadStream: http.IncomingMessage, fileName: string) {
  const file = fs.createWriteStream(fileName);

  return new Promise<void>((resolve, reject) => {
    const pipe = downloadStream.pipe(file);

    pipe.on('close', resolve);
  })
}

function getFileName(url: string) {
  return url;
}

async function getAndSaveFile(url: string, filePath: string) {
  const downloaded = await getFile(url);

  const fileName = getFileName(url);

  await saveFile(downloaded, fileName);
}

async function getAndSaveAndLoadFile(url: string, filePath: string) {
  await getAndSaveFile(url, filePath);

  return new Promise<string>((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, result) => {
      if (err)
        reject(err);
      else
        resolve(result);
    });
  })
}

async function loadManifest(urlPath: string): Promise<object> {
  const manifestString =
      await getAndSaveAndLoadFile(urlPath + MANIFEST_FILE, MANIFEST_FILE);
  const manifest = JSON.parse(manifestString);

  return manifest;
}

async function getAlLVariables(manifest: object, urlPath: string) {
  const variableNames = Object.keys(manifest);

  const variableSavePromises: Array<Promise<void>> =
      variableNames.map((variableName: string) => {
        const {filename} = manifest[variableName];

        console.log('saving file ' + filename);

        return getAndSaveFile(urlPath + filename, filename);
      });

  Promise.all(variableSavePromises)
      .then(() => {console.log('all variable saved')});
}

async function downloadCheckpoint(urlPath: string): Promise<void> {
  const manifest = await loadManifest(urlPath);

  await getAlLVariables(manifest, urlPath);
}

const firstKey = Object.keys(checkpoints)[0]

downloadCheckpoint(checkpoints[firstKey].url)
