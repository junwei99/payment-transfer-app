import { MockBank } from "@mock/bank";
import {
  ApiError,
  authorizationRequest,
  configRequest,
  object,
  readJson,
  requiredString,
  transferRequest,
} from "@mock/validation";

const bank = new MockBank();

const PORT = Number(Bun.env.PORT ?? "3001");

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

const json = (
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) => {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
};

type TRoute = { method: string; handle: () => Response | Promise<Response> };

const route = (request: Request, path: string): TRoute | undefined => {
  switch (path) {
    case "/health":
      return {
        method: "POST",
        handle: async () => {
          object(await readJson(request), []);

          return json({ status: "ok" });
        },
      };
    case "/account":
      return {
        method: "POST",
        handle: async () => {
          object(await readJson(request), []);
          return json(bank.account());
        },
      };
    case "/recipients":
      return {
        method: "POST",
        handle: async () => {
          object(await readJson(request), []);

          return json(bank.recipients());
        },
      };
    case "/transfer-authorizations":
      return {
        method: "POST",
        handle: async () => {
          const { details, authentication } = authorizationRequest(
            await readJson(request),
          );

          return json(bank.authorize(details, authentication), 201);
        },
      };
    case "/transfers":
      return {
        method: "POST",
        handle: async () => {
          const { details, approvalId, idempotencyKey } = transferRequest(
            await readJson(request),
            true,
          );

          const { transfer, replayed } = bank.submit(
            details,
            approvalId,
            idempotencyKey,
          );

          return json(transfer, replayed ? 200 : 201);
        },
      };
    case "/__mock/reset":
      return {
        method: "POST",
        handle: async () => {
          object(await readJson(request), []);

          return json(bank.reset());
        },
      };
    case "/__mock/config":
      return {
        method: "POST",
        handle: async () =>
          json(bank.configure(configRequest(await readJson(request)))),
      };
    case "/transfers/lookup":
      return {
        method: "POST",
        handle: async () => {
          const body = object(await readJson(request), ["id"]);

          return json(bank.transfer(requiredString(body.id, "id")));
        },
      };
  }
};

const server = Bun.serve({
  hostname: Bun.env.HOST ?? "0.0.0.0",
  port: PORT,
  maxRequestBodySize: 16 * 1024,
  idleTimeout: 60,

  fetch: async (request) => {
    const path = new URL(request.url).pathname;

    const delay =
      path === "/health" || path.startsWith("/__mock/")
        ? 0
        : bank.responseDelayMs();

    let response: Response;

    try {
      const selected = route(request, path);

      if (!selected) {
        throw new ApiError(404, "NOT_FOUND", "This endpoint does not exist.");
      }

      if (request.method !== selected.method) {
        response = json(
          {
            error: {
              code: "METHOD_NOT_ALLOWED",
              message: `Use ${selected.method} for this endpoint.`,
            },
          },
          405,
          { Allow: selected.method },
        );
      } else {
        response = await selected.handle();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        response = json(
          {
            error: {
              code: error.code,
              message: error.message,
              ...(error.retryAt ? { retryAt: error.retryAt } : {}),
            },
          },
          error.status,
        );
      } else {
        console.error(error);
        response = json(
          {
            error: {
              code: "INTERNAL_ERROR",
              message: "An unexpected service error occurred.",
            },
          },
          500,
        );
      }
    }

    // Delay the response after committing. A client timeout never rolls back a transfer.
    if (delay) {
      await Bun.sleep(delay);
    }

    return response;
  },

  error: (error) => {
    console.error(error);

    return json(
      {
        error: {
          code: "REQUEST_FAILED",
          message: "The service could not process the request.",
        },
      },
      500,
    );
  },
});

console.log(`Mock API listening on ${server.url}`);
