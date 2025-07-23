import { SupportedRegion, SystemConfig } from "../lib/shared/types";
import { existsSync, readFileSync } from "fs";

export function getConfig(): SystemConfig {
  if (existsSync("./bin/config.json")) {
    return JSON.parse(
      readFileSync("./bin/config.json").toString("utf8")
    ) as SystemConfig;
  }
  // Default config
  return {
    prefix: "",
    privateWebsite: false,
    certificate: "",
    cfGeoRestrictEnable: false,
    cfGeoRestrictList: [],
    bedrock: {
      enabled: true,
      region: SupportedRegion.US_EAST_1,
    },
    llms: {
      rateLimitPerIP: 100,
    },
    rag: {
      enabled: false,
      engines: {
        aurora: {
          enabled: false,
        },
        opensearch: {
          enabled: false,
        },
        kendra: {
          enabled: false,
          createIndex: false,
          enterprise: false,
        },
        knowledgeBase: {
          enabled: false,
        },
      },
      embeddingsModels: [
        {
          provider: "bedrock",
          name: "amazon.titan-embed-text-v1",
          dimensions: 1536,
        },
        //Support for inputImage is not yet implemented for amazon.titan-embed-image-v1
        {
          provider: "bedrock",
          name: "amazon.titan-embed-image-v1",
          dimensions: 1024,
        },
        {
          provider: "bedrock",
          name: "cohere.embed-english-v3",
          dimensions: 1024,
        },
        {
          provider: "bedrock",
          name: "cohere.embed-multilingual-v3",
          dimensions: 1024,
          default: true,
        }
      ],
      crossEncodingEnabled: false,
      crossEncoderModels: [],
    },
  };
}

export const config: SystemConfig = getConfig();
