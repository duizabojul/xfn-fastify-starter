import { Static, Type } from "@sinclair/typebox";

const k8sResourceTypebox = Type.Object({
  apiVersion: Type.String(),
  kind: Type.String(),
  metadata: Type.Object({
    name: Type.Optional(Type.String()),
    generateName: Type.Optional(Type.String()),
    labels: Type.Optional(Type.Record(Type.String(), Type.Any())),
    annotations: Type.Optional(Type.Record(Type.String(), Type.Any())),
    uid: Type.Optional(Type.String()),
    managedFields: Type.Optional(
      Type.Array(Type.Record(Type.String(), Type.Any()))
    ),
    ownerReferences: Type.Optional(
      Type.Array(
        Type.Object({
          apiVersion: Type.String(),
          kind: Type.String(),
          name: Type.String(),
          uid: Type.String(),
        })
      )
    ),
  }),
  spec: Type.Optional(Type.Record(Type.String(), Type.Any())),
  status: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

const compositeTypebox = Type.Object({
  connectionDetails: Type.Optional(
    Type.Array(Type.Record(Type.String(), Type.Any()))
  ),
  resource: k8sResourceTypebox,
});

const resourceTypebox = Type.Object({
  name: Type.String(),
  resource: k8sResourceTypebox,
});

const configTypebox = Type.Object({
  apiVersion: Type.String(),
  kind: Type.String(),
  xfns: Type.Array(
    Type.Object(
      {
        type: Type.String(),
      },
      { additionalProperties: true }
    )
  ),
});

const resultsTypebox = Type.Array(
  Type.Object({
    severity: Type.Union([
      Type.Literal("Normal"),
      Type.Literal("Warning"),
      Type.Literal("Fatal"),
    ]),
    message: Type.String(),
  })
);

export const functionIOTypebox = Type.Object({
  config: Type.Optional(configTypebox),
  desired: Type.Object({
    composite: compositeTypebox,
    resources: Type.Optional(Type.Array(resourceTypebox)),
  }),
  observed: Type.Object({
    composite: compositeTypebox,
    resources: Type.Optional(Type.Array(resourceTypebox)),
  }),
  results: Type.Optional(resultsTypebox),
});

export type FunctionIO = Static<typeof functionIOTypebox>;
export type FunctionIOResults = Static<typeof resultsTypebox>;
export type FunctionIOResource = Static<typeof resourceTypebox>;
export type K8sResource = Static<typeof k8sResourceTypebox>;
