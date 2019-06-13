import fs from 'fs'
import path from 'path'
import * as JsonUtils from './json.jsx'


export const dependencies = (folder, file = "config.json") => {
  const config = JsonUtils.load(path.join(folder, file));

  const dependencies = [];

  for (const moduleid in config.dependencies) {
    const {
      version
    } = config.dependencies[moduleid];
    dependencies.push({
      dependencyid: 'dependency|config.json|dependencies.' + moduleid + '.version',
      kind: "config",
      filename: "config.json",
      path: 'dependencies.' + moduleid + '.version',
      fullname: moduleid,
      version
    });
  }

  return dependencies;
}
