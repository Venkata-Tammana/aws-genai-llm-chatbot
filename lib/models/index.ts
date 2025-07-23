import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { Shared } from "../shared";
import { SystemConfig } from "../shared/types";

export interface ModelsProps {
  readonly config: SystemConfig;
  readonly shared: Shared;
}

export class Models extends Construct {
  public readonly models: any[];
  public readonly modelsParameter: ssm.StringParameter;

  constructor(scope: Construct, id: string, props: ModelsProps) {
    super(scope, id);

    // Only Bedrock model logic should remain here
    const models: any[] = [];
    // Add Bedrock model initialization logic as needed

    this.models = models;
    this.modelsParameter = new ssm.StringParameter(this, "ModelsParameter", {
      stringValue: JSON.stringify(models),
    });
  }
}
