import { Type } from "@sinclair/typebox";
import { FastifyRoutePlugin } from "../Server.js";
import {
  type FunctionIOResults,
  functionIOTypebox,
  FunctionIO,
} from "../xfns/types.js";

const route: FastifyRoutePlugin = async (fastify) => {
  fastify.post(
    "/xfn",
    {
      schema: {
        description: "xfn route",
        body: functionIOTypebox,
        response: {
          200: Type.String(),
        },
      },
    },
    async function (request, reply) {
      const functionIO: FunctionIO = request.body;
      const results: FunctionIOResults = [];

      // IMPLEMENT YOUR LOGIC HERE

      return reply.sendYaml({
        ...functionIO,
        results,
      });
    }
  );
};

export default route;
