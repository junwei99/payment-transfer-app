import {
  getApiSchema,
  type TApiEndpointSchema,
  type TApiEndpoints,
  type TApiResponseSchema,
  type TApiSchemaRequest,
  type TApiSchemaResponse,
} from "@/schemas/api.schema";
import { create, isAxiosError, isCancel, type AxiosResponse } from "axios";
import { z } from "zod";

const parseResponse = <TSchema extends TApiResponseSchema>(
  schema: TSchema & TApiEndpointSchema,
  data: unknown,
  status: number,
): TApiSchemaResponse<TSchema> => {
  if (status >= 200 && status < 300) {
    const parsed = z.safeParse<TSchema["successResponse"]>(
      schema.successResponse,
      data,
    );

    return parsed.success
      ? { kind: "success", data: parsed.data, status }
      : {
          kind: "parse-error",
          expected: "success",
          issues: parsed.error.issues,
          status,
        };
  }

  const parsed = z.safeParse<TSchema["errResponse"]>(schema.errResponse, data);

  return parsed.success
    ? { kind: "api-error", error: parsed.data, status }
    : {
        kind: "parse-error",
        expected: "error",
        issues: parsed.error.issues,
        status,
      };
};

const getApiBaseURL = (): string => {
  const baseURL = process.env.EXPO_PUBLIC_API_URL;

  if (!baseURL || !URL.canParse(baseURL) || !/^https?:\/\//.test(baseURL)) {
    throw new Error(
      "Set EXPO_PUBLIC_API_URL to a valid HTTP(S) service URL in .env.local. See README.md.",
    );
  }

  return baseURL;
};

export const createRequestor = (
  {
    baseURL,
    timeout = 30000,
  }: {
    baseURL: string;
    timeout?: number;
  } = { baseURL: getApiBaseURL() },
) => {
  const url = new URL(baseURL);

  if (
    !/^https?:$/.test(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "API baseURL must be an HTTP(S) URL without credentials, query, or fragment.",
    );
  }

  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw new Error("API timeout must be positive.");
  }

  const client = create({
    baseURL,
    timeout,
    headers: { "Content-Type": "application/json" },
    validateStatus: () => true,
    responseType: "text",
    transformResponse: [
      (data: unknown): unknown => {
        if (typeof data !== "string") {
          return data;
        }

        try {
          const parsed: unknown = JSON.parse(data);
          return parsed;
        } catch {
          return data;
        }
      },
    ],
  });

  const register = <TSchema extends TApiEndpointSchema>(
    schema: TSchema & { path: string },
  ) => {
    const { path } = schema;

    if (!path.startsWith("/") || path.startsWith("//")) {
      throw new Error("Endpoint path must be relative to the API base URL.");
    }

    return async (
      body: TApiSchemaRequest<TSchema>,
      options?: { signal?: AbortSignal },
    ): Promise<TApiSchemaResponse<TSchema>> => {
      let response: AxiosResponse<unknown>;

      try {
        response = await client.post<unknown>(path, body, {
          signal: options?.signal,
        });
      } catch (error) {
        if (isCancel(error)) {
          return {
            kind: "transport-error",
            reason: "cancelled",
            message: "Request cancelled.",
          };
        }

        if (isAxiosError(error)) {
          if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
            return {
              kind: "transport-error",
              reason: "timeout",
              message: "Request timed out.",
            };
          }

          if (
            error.code === "ERR_NETWORK" ||
            (error.request &&
              !error.response &&
              ["ECONNREFUSED", "ECONNRESET", "ENOTFOUND", "EAI_AGAIN"].includes(
                error.code ?? "",
              ))
          ) {
            return {
              kind: "transport-error",
              reason: "network",
              message: "Unable to reach the API service.",
            };
          }
        }

        throw error;
      }

      const { status, data } = response;

      return parseResponse<TSchema>(schema, data, status);
    };
  };

  const createRequest = <T extends TApiEndpoints>(endpoint: T) => {
    return register({ path: endpoint, ...getApiSchema(endpoint) });
  };
  return { createRequest };
};
