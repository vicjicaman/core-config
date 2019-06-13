import fs from 'fs'
import path from 'path'
import * as JsonUtils from '@nebulario/core-json'
import * as Config from './config'

export const build = (folder) => {

  const tmpFolder = path.join(folder, "tmp");
  const distFolder = path.join(folder, "dist");
  const config = JsonUtils.load(path.join(folder, "config.json"));

  const dependenciesConfigValues = Config.values(folder, config);
  const configValues = {};

  for (const moduleid in config.dependencies) {
    const {
      version
    } = config.dependencies[moduleid];


    let localFolder = "";
    if (version.startsWith("file:")) {
      localFolder = path.join(folder, version.replace("file:", ""));
    } else {
      // get the content from the namespace
      localFolder = path.join(tmpFolder, );
    }

    const depConfig = JsonUtils.load(path.join(localFolder, "dist", "config.json"));

    for (const entry in depConfig) {
      dependenciesConfigValues[entry + '@' + moduleid] = depConfig[entry].value;
    }
  }

  for (const entry of config.config) {
    configValues[entry.name] = {
      value: Config.replace(Config.replace(entry.value, configValues), dependenciesConfigValues),
      type: entry.type || null
    };
  }


  JsonUtils.save(path.join(distFolder, "config.json"),
    configValues
  );
}
