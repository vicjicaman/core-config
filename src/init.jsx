import fs from "fs";
import path from "path";
import * as JsonUtils from "@nebulario/core-json";
import * as Repository from "@nebulario/core-repository";
import { exec } from "@nebulario/core-process";

export const clear = async folder => {
  const tmpFolder = path.join(folder, "tmp");

  if (fs.existsSync(tmpFolder)) {
    await exec(["rm -R " + tmpFolder], {}, {});
  }
};

export const init = async folder => {
  const config = JsonUtils.load(path.join(folder, "config.json"));

  const tmpFolder = path.join(folder, "tmp");
  if (!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder);
  }

  for (const moduleid in config.dependencies) {
    const { url, version } = config.dependencies[moduleid];

    if (!version.startsWith("file:")) {
      const depRepo = path.join(tmpFolder, "dependencies", moduleid);
      try {
        await Repository.clone(url, depRepo);
      } catch (e) {
        const estr = e.toString();
        if (estr.includes("already exists and is not an empty directory")) {
          console.log(e.toString());
        } else {
          throw e;
        }
      }

      await Repository.checkout(depRepo, version);
    }
  }
};
