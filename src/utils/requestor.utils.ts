import { create, isCancel, isAxiosError, type AxiosResponse } from "axios";
import { z } from "zod";

import {
  getApiSchema,
  type TApiResult,
  type TApiEndpoints,
  type TGetApiEndpointRequest,
  type TGetApiEndpointResponse,
} from "@/schemas/api.schema";

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
    // Keep malformed JSON as unknown response data so Zod reports a parse-error.
    responseType: "text",
    transformResponse: [
      (data: unknown): unknown => {
        if (typeof data !== "string") {
          return data;
        }

        try {
          return JSON.parse(data) as unknown;
        } catch {
          return data;
        }
      },
    ],
  });

  const register = (endpoint: {
    path: string;
    request: z.ZodType;
    successResponse: z.ZodType;
    errResponse: z.ZodType;
  }) => {
    if (!endpoint.path.startsWith("/") || endpoint.path.startsWith("//")) {
      throw new Error("Endpoint path must be relative to the API base URL.");
    }

    return async (
      body: unknown,
      options?: { signal?: AbortSignal },
    ): Promise<TApiResult<unknown, unknown>> => {
      let response: AxiosResponse<unknown>;

      try {
        // Request schemas provide types only. Send the caller's original body.
        response = await client.post<unknown>(endpoint.path, body, {
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

      if (status >= 200 && status < 300) {
        const parsed = endpoint.successResponse.safeParse(data);

        return parsed.success
          ? { kind: "success", data: parsed.data, status }
          : {
              kind: "parse-error",
              expected: "success",
              issues: parsed.error.issues,
              status,
            };
      }

      const parsed = endpoint.errResponse.safeParse(data);

      return parsed.success
        ? { kind: "api-error", error: parsed.data, status }
        : {
            kind: "parse-error",
            expected: "error",
            issues: parsed.error.issues,
            status,
          };
    };
  };

  const createRequest = <T extends TApiEndpoints>(endpoint: T) => {
    const schema = getApiSchema(endpoint);

    // The registry key preserves the correlation between request and response schemas.
    return register({ path: endpoint, ...schema }) as (
      body: TGetApiEndpointRequest<T>,
      options?: { signal?: AbortSignal },
    ) => Promise<TGetApiEndpointResponse<T>>;
  };

  return { createRequest };
};
