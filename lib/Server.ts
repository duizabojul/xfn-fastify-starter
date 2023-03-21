import fastify, {
  ContextConfigDefault,
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
  FastifyReply,
  FastifySchema,
  preHandlerAsyncHookHandler,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
  RouteGenericInterface,
} from "fastify";
import type {
  IncomingMessage,
  Server as HttpServer,
  ServerResponse,
} from "node:http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fastifyAutoload from "@fastify/autoload";
import fastifySensible from "@fastify/sensible";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { K8sApi } from "./services/K8sApi";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type ServerSettings = {
  basePath: string;
  logLevel: string;
};

export type ServerServices = {
  k8sApi: K8sApi;
};

declare module "fastify" {
  interface FastifyInstance extends ServerServices {}

  interface FastifyReply {
    sendYaml: (data: Record<string, any>) => FastifyReply;
  }
}

export type CustomPreHandlerHookHandler = preHandlerAsyncHookHandler<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  RouteGenericInterface,
  ContextConfigDefault,
  FastifySchema,
  TypeBoxTypeProvider
>;

export type FastifyRoutePlugin<
  Options extends FastifyPluginOptions = Record<never, never>,
  Server extends RawServerBase = RawServerDefault
> = FastifyPluginAsync<Options, Server, TypeBoxTypeProvider>;

export type FastifyServer = FastifyInstance<
  HttpServer,
  IncomingMessage,
  ServerResponse,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;

export class Server {
  protected server: FastifyServer;
  private settings: ServerSettings;
  private started = false;

  constructor(
    settings?: Partial<ServerSettings>,
    services?: Partial<ServerServices>
  ) {
    this.settings = {
      logLevel: "info",
      basePath: "/1",
      ...settings,
    };

    this.server = this.initServer(services);
  }

  public async start(port = 3000, host = "0.0.0.0") {
    if (this.started) {
      return;
    }
    this.started = true;

    await this.registerRoutes();
    await this.server.listen({ port, host });
  }

  public async stop() {
    if (!this.started) {
      return;
    }
    this.started = false;

    await this.server.close();
  }

  private initServer(services?: Partial<ServerServices>): FastifyServer {
    const server = fastify({
      logger: true,
    })
      .withTypeProvider<TypeBoxTypeProvider>()
      .register(fastifySensible)
      .decorateReply(
        "sendYaml",
        function (this: FastifyReply, payload: Record<string, any>) {
          this.header("Content-Type", "application/yaml");
          this.send(
            yaml.dump(payload, {
              noArrayIndent: true,
              quotingType: '"',
              lineWidth: 1000,
            })
          );
        }
      );

    services ??= {};

    Object.entries(services).forEach(([key, service]) => {
      server.decorate(key, service);
    });

    server.addContentTypeParser(
      "application/yaml",
      { parseAs: "string" },
      function (_req, body: string, done) {
        if (!body) {
          return done(null, undefined);
        }
        try {
          const obj = yaml.load(body);
          done(null, obj);
        } catch (err: any) {
          err.statusCode = 400;
          done(err, undefined);
        }
      }
    );

    return server;
  }

  private async registerRoutes() {
    await this.server
      .get("/healthz", async (_request, reply) => {
        return reply.code(this.started ? 204 : 410).send();
      })
      .register(fastifyAutoload, {
        dir: join(__dirname, "routes"),
        options: { prefix: this.settings.basePath },
        ignorePattern: /(\.ts)|(\.spec.js)$/,
        routeParams: true,
      });
  }
}
