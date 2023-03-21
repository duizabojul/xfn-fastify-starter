import k8s from "@kubernetes/client-node";

export interface K8sApi {
  getCustomObject<T extends k8s.KubernetesObject>(
    group: string,
    version: string,
    plural: string,
    name: string,
    namespace?: string
  ): Promise<T | undefined>;
  getConfigMap(
    name: string,
    namespace: string
  ): Promise<k8s.V1ConfigMap | undefined>;
  getSecret(name: string, namespace: string): Promise<k8s.V1Secret | undefined>;
}
