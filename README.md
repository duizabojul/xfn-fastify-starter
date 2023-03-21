# xfn-fastify-starter

### Notes

- YAML decoder/encoder
- Basic K8S API Service. You can access it in Server context with `this.k8sApi`
- FunctionIO types in `lib/xfns/types.ts`
- Implement your logic in `lib/routes/xfn.ts`

### Install

`npm run install`

### Dev

- `npm run dev` in a terminal
- `npm run test-sample` to send a curl request with the content of `samples/functionIO.yaml` file

### Deploy

**Please note this is only working with `crossplane/xfn:v1.11.0` container at the moment. See https://github.com/crossplane/crossplane/issues/3807** issue.

- Build and push `deployment/xfn-runner.Dockerfile` on a public repository
- Add functions field in your compositions:

```
type: Container
container:
  image: public.ecr.aws/abcdef/xfn-runner:1.0.0
  imagePullPolicy: IfNotPresent
  resources:
    limits:
      memory: 10Mi
      cpu: 30m
  timeout: 20s
  network:
    policy: Runner
```

- Build and push `Dockerfile` image and deploy it in your cluster. There is example of deployment files in `deployment` folder.
