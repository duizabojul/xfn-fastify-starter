import nconf from "nconf";
import { watchFile } from "fs";
import { join } from "path";
import { load, dump } from "js-yaml";

const configFilePath = join(process.env.PWD!, "config", "config.yaml");

const settings = nconf
  .use("memory")
  .argv()
  .env({ separator: "__", parseValues: true })
  .file({
    file: configFilePath,
  })
  .defaults({
    k8s: {
      loadFrom: "default",
    },
  });

watchFile(configFilePath, () => {
  settings.load();
});

export default settings;
