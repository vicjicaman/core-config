import fs from "fs";
import path from "path";
import * as JsonUtils from "@nebulario/core-json";
import * as Config from "./config";

export const link = (folder, moduleid) => {
  JsonUtils.sync(folder, {
    filename: "config.json",
    path: "dependencies." + moduleid + ".version",
    version: "file:./../" + moduleid
  });
};

export const build = folder => {
  const distFolder = path.join(folder, "dist");

  if (!fs.existsSync(distFolder)) {
    fs.mkdirSync(distFolder);
  }

  const config = JsonUtils.load(path.join(folder, "config.json"));

  const dependenciesConfigValues = Config.values(folder, config, {
    self: false
  });
  const configValues = {};

  if (config.config) {
    for (const entry of config.config) {
      configValues[entry.name] = {
        value: Config.replace(
          Config.replace(entry.value, configValues),
          dependenciesConfigValues
        ),
        type: entry.type || null
      };
    }
  }

  JsonUtils.save(path.join(distFolder, "config.json"), configValues);
};
