import settings from "../lib/settings.js";
import { K8sClient } from "../lib/services/K8sClient.js";
import { Server } from "../lib/Server.js";

(async () => {
  const k8sApi = new K8sClient(settings.get("k8s"));

  const server = new Server(
    {},
    {
      k8sApi,
    }
  );

  await server.start();
})().catch(async (err) => {
  console.error(err.toString());
  process.exit(1);
});
