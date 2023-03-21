import type { K8sApi } from "./K8sApi.js";
import k8s, { HttpError } from "@kubernetes/client-node";

export enum K8sLoadFrom {
  CLUSTER = "cluster",
  DEFAULT = "default",
}

export type K8sSettings = {
  loadFrom: K8sLoadFrom;
};

export class K8sClient implements K8sApi {
  private customObjectsApi: k8s.CustomObjectsApi;
  private coreV1Api: k8s.CoreV1Api;
  private kc: k8s.KubeConfig;

  constructor(private readonly settings: K8sSettings) {
    this.kc = new k8s.KubeConfig();
    switch (this.settings.loadFrom) {
      case K8sLoadFrom.CLUSTER:
        this.kc.loadFromCluster();
        break;
      case K8sLoadFrom.DEFAULT:
        this.kc.loadFromDefault();
        break;
    }
    this.customObjectsApi = this.kc.makeApiClient(k8s.CustomObjectsApi);
    this.coreV1Api = this.kc.makeApiClient(k8s.CoreV1Api);
  }

  async getConfigMap(
    name: string,
    namespace: string
  ): Promise<k8s.V1ConfigMap | undefined> {
    const data = await undefinedOn404(
      this.coreV1Api.readNamespacedConfigMap(name, namespace)
    );
    return data?.body;
  }

  async getSecret(
    name: string,
    namespace: string
  ): Promise<k8s.V1Secret | undefined> {
    const data = await undefinedOn404(
      this.coreV1Api.readNamespacedSecret(name, namespace)
    );
    return data?.body;
  }

  async getCustomObject<T extends k8s.KubernetesObject>(
    group: string,
    version: string,
    plural: string,
    name: string,
    namespace?: string
  ): Promise<T | undefined> {
    let data: any;
    if (namespace) {
      data = await undefinedOn404(
        this.customObjectsApi.getNamespacedCustomObject(
          group,
          version,
          namespace,
          plural,
          name
        )
      );
    } else {
      data = await undefinedOn404(
        this.customObjectsApi.getClusterCustomObject(
          group,
          version,
          plural,
          name
        )
      );
    }

    return data.body as T | undefined;
  }
}

const undefinedOn404 = async <T>(
  promise: Promise<T>
): Promise<T | undefined> => {
  try {
    return await promise;
  } catch (e) {
    if (e instanceof HttpError && e.response.statusCode === 404) {
      return undefined;
    }
    throw e;
  }
};
