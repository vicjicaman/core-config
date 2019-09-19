import fs from "fs";
import path from "path";
import * as JsonUtils from "@nebulario/core-json";

export const replace = (content, config) => {
  let replaced = content;

  if (typeof replaced !== "string") {
    return replaced;
  }

  for (const configVar in config) {
    const configVal = config[configVar];
    const rawVal = typeof configVal === "object" ? configVal.value : configVal;

    if (typeof rawVal == "number") {
      replaced = replaced.replace(
        new RegExp("'\\$\\{" + configVar + "\\}'", "g"),
        rawVal
      );
    }

    replaced = replaced.replace(
      new RegExp("\\$\\{" + configVar + "\\}", "g"),
      rawVal
    );
  }

  return replaced;
};

export const parse = (folder, file, initial) => {
  const content = fs.readFileSync(path.join(folder, file), "utf8");
  const out = {
    ...initial
  };

  const lines = content.split("\n");
  for (const line of lines) {
    const i = line.indexOf("=");
    const key = line.substr(0, i);
    const val = line.substr(i + 1);

    if (val) {
      const replaced = replace(val, out);

      if (
        replaced.charAt(0) === '"' &&
        replaced.charAt(replaced.length - 1) === '"'
      ) {
        out[key] = replaced.substr(1, replaced.length - 2);
      } else {
        out[key] = replaced;
      }
    }
  }

  return out;
};

export const load = folder => {
  const config = JsonUtils.load(path.join(folder, "config.json"));
  return values(folder, config);
};

export const values = (folder, config) => {
  const tmpFolder = path.join(folder, "tmp");
  const depsFolder = path.join(tmpFolder, "dependencies");
  const dependenciesConfigValues = {};

  for (const moduleid in config.dependencies) {
    const { version } = config.dependencies[moduleid];

    let localFolder = null;
    if (version.startsWith("file:")) {
      localFolder = path.join(folder, version.replace("file:", ""));
    } else {
      localFolder = path.join(depsFolder, moduleid);
    }

    const depConfig = JsonUtils.load(
      path.join(localFolder, "dist", "config.json")
    );

    for (const entry in depConfig) {
      dependenciesConfigValues[entry + "@" + moduleid] = depConfig[entry].value;
    }
  }

  return dependenciesConfigValues;
};
