// src/clients/notion/gasClient.ts

/// <reference types="google-apps-script" />
import { NotionApiParams, NotionApiResult, HttpMethodUpper } from "../../types/notion-api.types";
import { INotionClientSync } from "./base";

const NOTION_BASE_URL = "https://api.notion.com/v1";
const DEFAULT_NOTION_VERSION = "2022-06-28";

export interface NotionClientGasOptions {
  token?: string;
  version?: string;
  defaultHeaders?: Record<string, string>;
  debug?: boolean;
}

export class NotionClientGas implements INotionClientSync {
  private token: string;
  private version: string;
  private debug: boolean;

  constructor(opts: NotionClientGasOptions = {}) {
    const scriptProps = PropertiesService.getScriptProperties();
    this.token = opts.token || scriptProps.getProperty("NOTION_TOKEN") || "";
    this.version = opts.version || DEFAULT_NOTION_VERSION;
    this.debug = opts.debug || false;

    if (!this.token) {
      console.warn("NotionClientGas: No token provided and NOTION_TOKEN script property is empty.");
    }
  }

  request<T = unknown>(params: NotionApiParams): NotionApiResult<T> {
    const method = (params.method || "get").toString().toUpperCase() as HttpMethodUpper;
    const path = params.path.startsWith("/") ? params.path : `/${params.path}`;
    const url = `${NOTION_BASE_URL}${path}`;

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${this.token}`,
      "Notion-Version": this.version,
      "Content-Type": "application/json",
    };

    let fullUrl = url;
    if (params.query) {
      const queryString = Object.entries(params.query)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&");
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }

    const fetchOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: method as any,
      headers: headers,
      muteHttpExceptions: true,
    };

    if (params.body && method !== "GET" && method !== "HEAD") {
      fetchOptions.payload = JSON.stringify(params.body);
    }

    if (this.debug) {
      console.log(`Notion Request: ${method} ${fullUrl}`);
    }

    try {
      const response = UrlFetchApp.fetch(fullUrl, fetchOptions);
      const responseCode = response.getResponseCode();
      const responseBody = response.getContentText();
      const data = responseBody ? JSON.parse(responseBody) : {};

      return {
        ok: responseCode >= 200 && responseCode < 300,
        status: responseCode,
        data: data as T,
        headers: response.getHeaders() as any,
        url: fullUrl,
        method: method as any,
      };
    } catch (e: any) {
      console.error(`Notion Fetch Error: ${e.message}`);
      return {
        ok: false,
        status: 0,
        data: { message: e.message } as any,
        headers: {},
        url: fullUrl,
        method: method,
      };
    }
  }

  get<T = unknown>(path: string, query?: NotionApiParams["query"]): NotionApiResult<T> {
    return this.request<T>({ method: "get", path, query });
  }

  post<T = unknown>(path: string, body?: NotionApiParams["body"], query?: NotionApiParams["query"]): NotionApiResult<T> {
    return this.request<T>({ method: "post", path, body, query });
  }

  patch<T = unknown>(path: string, body?: NotionApiParams["body"], query?: NotionApiParams["query"]): NotionApiResult<T> {
    return this.request<T>({ method: "patch", path, body, query });
  }
}
