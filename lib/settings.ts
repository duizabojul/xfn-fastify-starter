import nconf from "nconf";
import { watchFile } from "fs";
import { join } from "path";

const configFilePath = join(process.cwd(), "config", "config.yaml");

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
