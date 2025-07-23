import {
  SupportedRegion,
  SystemConfig,
} from "../../lib/shared/types";

export function getTestConfig(): SystemConfig {
  // Default config
  return {
    prefix: "prefix",
    privateWebsite: true,
    certificate: "",
    cfGeoRestrictEnable: true,
    cfGeoRestrictList: [],
    bedrock: {
      enabled: true,
      region: SupportedRegion.US_EAST_1,
    },
    llms: {
      rateLimitPerIP: 100,
    },
    rag: {
      crossEncodingEnabled: true,
      enabled: true,
      engines: {
        aurora: {
          enabled: true,
        },
        opensearch: {
          enabled: true,
        },
        kendra: {
          enabled: true,
          createIndex: true,
          enterprise: true,
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
        },
      ],
      crossEncoderModels: [],
    },
  };
}
