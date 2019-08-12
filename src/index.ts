import * as client from "prom-client";
import { IMiddlewareFunction } from "graphql-middleware/dist/types";

const requests_total = new client.Counter({
  name: "graphql_http_requests_before_middlewares_total",
  help: "Total count of requests before middlewares run.",
  labelNames: ["resolver"]
});

const responses_total = new client.Counter({
  name: "graphql_http_responses_before_middlewares_total",
  help: "Total count of responses before middlewares run.",
  labelNames: ["resolver"]
});

const requests_latency_before = new client.Histogram({
  name: "graphql_http_requests_latency_including_middlewares_seconds",
  help:
    "Histogram of requests processing time (including middleware processing time).",
  labelNames: ["resolver"]
});

export type ExceptionScope = (
  error: Error,
  reportError?: (res: Error | any) => boolean
) => void;

export interface Config {}

// Options for graphql-middleware-sentry
export interface Options {
  config?: Config;
  forwardErrors?: boolean;
}

export class SentryError extends Error {}

export const prometheus = ({
  config = {},
  forwardErrors = false
}: Options): IMiddlewareFunction => {
  // Check if either sentryInstance or config.dsn is present
  console.log();
  return async (resolve, parent, args, ctx, info) => {
    try {
      requests_total.inc({ resolver: info.fieldName });
      const end = requests_latency_before.startTimer({
        resolver: info.fieldName
      });
      const res = await resolve(parent, args, ctx, info);
      end();
      responses_total.inc({ resolver: info.fieldName });
      return res;
    } catch (error) {
      // Forward error
      if (forwardErrors) {
        throw error;
      }
    }
  };
};

client.collectDefaultMetrics();

export const serverPrometheus = (server: any) => {
  server.get("/metrics", (req: any, res: any) => {
    res.set("Content-Type", client.register.contentType);
    res.end(client.register.metrics());
  });
};
