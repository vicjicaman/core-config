import fs from 'fs'
import path from 'path'
import * as JsonUtils from '@nebulario/core-json'
import * as Repository from '@nebulario/core-repository'


const getUrl = (folder, moduleid) => {
  const baselineid = "master";
  const moduleFolder = path.join(folder, "tmp", "namespace", "baselines", baselineid, "modules", moduleid);

  if (!fs.existsSync(moduleFolder)) {
    return null;
  }

  const modInfo = JsonUtils.load(path.join(moduleFolder, "module.json"));

  const curRel = modInfo.releases[0];
  if (!currRel) {
    return null;
  }

  const {
    releaseid
  } = currRel;

  const releaseModFolder = path.join(folder, "tmp", "namespace", "baselines", baselineid, "releases", releaseid, "modules", moduleid);

  const relModInfo = JsonUtils.load(path.join(releaseModFolder, "module.json"));
  return relModInfo.url;
}




export const clear = async (folder) => {
  const tmpFolder = path.join(folder, "tmp");

  if (fs.existsSync(tmpFolder)) {
    await exec(["rm -R " + tmpFolder], {}, {}, cxt)
  }
}



export const init = async (folder) => {
  const config = JUtils.load(path.join(folder, "config.json"));

  const distFolder = path.join(folder, "dist");
  if (!fs.existsSync(distFolder)) {
    fs.mkdirSync(distFolder);
  }

  const tmpFolder = path.join(folder, "tmp");
  if (!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder);
  }

  const namespaceFolder = path.join(tmpFolder, "namespace")
  if (!fs.existsSync(namespaceFolder)) {
    fs.mkdirSync(namespaceFolder);

    await Repository.clone(config.namespace, namespaceFolder);

    for (const moduleid in config.dependencies) {
      const {
        version
      } = config.dependencies[moduleid];

      const url = getUrl(folder, moduleid);

      if (url) {
        await Repository.clone(url, path.join(tmpFolder, "dependencies", moduleid));
      }

    }

  }

}
