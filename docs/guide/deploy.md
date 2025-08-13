# Deploy

## Environment setup

To deploy the solution you can use 3 different methods:

1. [Github Codespaces](#github-codespaces)
2. [Local machine](#local-machine)
3. [AWS Cloud9](#aws-cloud9) (Deprecated)

### Github Codespaces

To use [GitHub Codespaces](https://github.com/features/codespaces) to deploy the solution, you need the following before proceeding:

1. An [AWS account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/)
2. An [IAM User](https://console.aws.amazon.com/iamv2/home?#/users/create) with **AdministratorAccess** policy granted (for production, we recommend restricting access as needed)

After creating the user, take note of `Access Key ID` and `Secret Access Key`.

Next, click on the button below to open your Codespaces environment.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/aws-samples/aws-genai-llm-chatbot)

Once in the Codespaces terminal, set up the AWS Credentials by running

```shell
aws configure
```

```shell
AWS Access Key ID [None]: <the access key from the IAM user generated above>
AWS Secret Access Key [None]: <the secret access key from the IAM user generated above>
Default region name: <the region you plan to deploy the solution to>
Default output format: json
```

You are all set for deployment; you can now jump to [step 3 of the deployment section below](#deployment-dependencies-installation).

### Local machine

If are using a local machine, verify that your environment satisfies the following prerequisites:

You have:

1. An [AWS account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/)
2. An [IAM User](https://console.aws.amazon.com/iamv2/home?#/users/create) with **AdministratorAccess** policy granted (for production, we recommend restricting access as needed)
3. [NodeJS 18 or 20](https://nodejs.org/en/download/) installed

   - If you are using [`nvm`](https://github.com/nvm-sh/nvm) you can run the following before proceeding
     ```
     nvm install 18 && nvm use 18
     ```
     or
     ```
     nvm install 20 && nvm use 20
     ```

4. [AWS CLI](https://aws.amazon.com/cli/) installed and configured to use with your AWS account
5. [AWS CDK CLI](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) installed
6. [Docker](https://docs.docker.com/get-docker/) installed
   - N.B. [`buildx`](https://github.com/docker/buildx) is also required. For Windows and macOS `buildx` [is included](https://github.com/docker/buildx#windows-and-macos) in [Docker Desktop](https://docs.docker.com/desktop/)
7. [Python 3+](https://www.python.org/downloads/) installed

### AWS Cloud9

[AWS Cloud9](https://aws.amazon.com/blogs/devops/how-to-migrate-from-aws-cloud9-to-aws-ide-toolkits-or-aws-cloudshell/) is only available to existing users of Cloud9.

Use the [Cloud9 console](https://console.aws.amazon.com/cloud9control/home?#/create/) to create a new Cloud9 instance. Ensure you use the following values when creating the instance:

- Select `m5.large` or larger as Instance Type.
- Select `Ubuntu Server 22.04 LTS` as Platform.

The default EBS volume create with the Cloud9 instance is too small and you need to increase it to at least 100GB.
To do this, run the following command from the Cloud9 terminal:

```
./scripts/cloud9-resize.sh
```

See the documentation for more details on [environment resize](https://docs.aws.amazon.com/cloud9/latest/user-guide/move-environment.html#move-environment-resize).

You can now proceed with the [deployment](#deployment)

## Deployment

### GitHub Actions Deployment (Automated)

This project includes a GitHub Actions workflow (`.github/workflows/aws-deploy.yml`) for automated deployment. The workflow is configured by default to enable RAG capabilities and Knowledge Bases.

#### Prerequisites for GitHub Actions Deployment
1. Set up the following GitHub repository secrets:
   - `AWS_REGION`: Your target AWS region (e.g., `us-east-1`)
   - `AWS_ACCOUNT_ID`: Your AWS Account ID
   - `AWS_ACCESS_KEY_ID`: IAM user access key with deployment permissions
   - `AWS_SECRET_ACCESS_KEY`: IAM user secret access key

#### Manual Deployment Trigger
Navigate to the Actions tab in your GitHub repository and run the "Deploy AWS GenAI LLM Chatbot" workflow with:
- **Environment**: `dev`, `staging`, or `prod`
- **Enable RAG capabilities**: `true` (default)
- **Enable Knowledge Bases**: `true` (default)
- **Enable Bedrock Guardrails**: `false` (default, enable if you have guardrails configured)

#### Automatic Deployment
Uncomment lines 18-19 in `.github/workflows/aws-deploy.yml` to enable automatic deployment on pushes to the main branch.

### Manual Deployment

Before you start, please read the [precautions](../documentation/precautions.md) and [security](../documentation/security.md) pages.

**Step 1.** Clone the repository.

```bash
git clone https://github.com/aws-samples/aws-genai-llm-chatbot
```

**Step 2.** Move into the cloned repository.

```bash
cd aws-genai-llm-chatbot
```

**Step 3.** <a id="deployment-dependencies-installation"></a> Install the project dependencies and build the project.

```bash
npm ci && npm run build
```

**Step 4.** (Optional) Run the unit tests

```bash
npm run test && pip install -r pytest_requirements.txt && pytest tests
```

**Step 5.** Configure the solution with RAG and Knowledge Bases enabled:

### Option A: Interactive Configuration (Recommended)
Run the configuration command to set up the solution with the features you need:

```bash
npm run config
```

You'll be prompted to configure the different aspects of the solution, such as:

- The LLMs or MLMs to enable (we support all models provided by Bedrock that [were enabled](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html) along with SageMaker hosted Idefics, FalconLite, Mistral and more to come).
- **Setup of the RAG system: engine selection (i.e. Aurora w/ pgvector, OpenSearch, Kendra, Knowledge Bases).**
- Embeddings selection.
- Limit accessibility to website and backend to VPC (private chatbot).
- Add existing Amazon Kendra indices as RAG sources
- **Configure external Knowledge Base connectors**
- **Enable Amazon Bedrock Guardrails**

### Option B: Automated Configuration with RAG and Knowledge Bases
For a deployment with RAG and Knowledge Bases enabled by default, use the non-interactive configuration:

```bash
npm run config -- --non-interactive --rag-enable --bedrock-enable --knowledge-base-enable
```

### Option C: Manual Configuration
Alternatively, you can manually create or edit `bin/config.json` with your desired configuration. Here's an example with RAG and Knowledge Bases enabled:

```json
{
  "prefix": "genai-chatbot",
  "createCMKs": false,
  "retainOnDelete": false,
  "bedrock": {
    "enabled": true,
    "region": "us-east-1",
    "guardrails": {
      "enabled": true,
      "identifier": "YOUR_GUARDRAIL_ID",
      "version": "1"
    }
  },
  "rag": {
    "enabled": true,
    "deployDefaultSagemakerModels": false,
    "crossEncodingEnabled": true,
    "engines": {
      "aurora": {
        "enabled": false
      },
      "opensearch": {
        "enabled": false
      },
      "kendra": {
        "enabled": false,
        "createIndex": false,
        "external": [],
        "enterprise": false
      },
      "knowledgeBase": {
        "enabled": true,
        "external": [
          {
            "name": "My Knowledge Base",
            "knowledgeBaseId": "YOUR_KNOWLEDGE_BASE_ID",
            "region": "us-east-1"
          }
        ]
      }
    },
    "embeddingsModels": [
      {
        "provider": "bedrock",
        "name": "amazon.titan-embed-text-v1",
        "dimensions": 1536,
        "default": true
      }
    ],
    "crossEncoderModels": []
  },
  "llms": {
    "sagemaker": [],
    "rateLimitPerIP": 100
  }
}
```

For more details about the options, please refer to the [configuration page](./config.md)

When done, answer `Y` to create or update your configuration.

![sample](./assets/magic-config-sample.gif "CLI sample")

Your configuration is now stored under `bin/config.json`. You can re-run the `npm run config` command as needed to update your `config.json`

### Common Configuration Examples

#### Enterprise RAG Setup with Multiple Knowledge Bases and Guardrails
```json
{
  "prefix": "enterprise-chatbot",
  "createCMKs": true,
  "retainOnDelete": true,
  "bedrock": {
    "enabled": true,
    "region": "us-east-1",
    "guardrails": {
      "enabled": true,
      "identifier": "enterprise-guardrail-id",
      "version": "2"
    }
  },
  "rag": {
    "enabled": true,
    "crossEncodingEnabled": true,
    "engines": {
      "knowledgeBase": {
        "enabled": true,
        "external": [
          {
            "name": "HR Policies",
            "knowledgeBaseId": "kb-hr-policies-123",
            "region": "us-east-1"
          },
          {
            "name": "Technical Documentation", 
            "knowledgeBaseId": "kb-tech-docs-456",
            "region": "us-east-1"
          },
          {
            "name": "Company Procedures",
            "knowledgeBaseId": "kb-procedures-789",
            "region": "us-east-1"
          }
        ]
      }
    },
    "embeddingsModels": [
      {
        "provider": "bedrock",
        "name": "amazon.titan-embed-text-v1",
        "dimensions": 1536,
        "default": true
      }
    ]
  }
}
```

#### Hybrid RAG Setup with Knowledge Bases and OpenSearch
```json
{
  "prefix": "hybrid-chatbot",
  "rag": {
    "enabled": true,
    "engines": {
      "opensearch": {
        "enabled": true
      },
      "knowledgeBase": {
        "enabled": true,
        "external": [
          {
            "name": "Product Catalog",
            "knowledgeBaseId": "kb-products-123",
            "region": "us-east-1"
          }
        ]
      }
    },
    "embeddingsModels": [
      {
        "provider": "bedrock",
        "name": "cohere.embed-multilingual-v3",
        "dimensions": 1024,
        "default": true
      }
    ]
  }
}
```

#### Development Setup with Aurora and Cross-Encoding
```json
{
  "prefix": "dev-chatbot",
  "rag": {
    "enabled": true,
    "deployDefaultSagemakerModels": true,
    "crossEncodingEnabled": true,
    "engines": {
      "aurora": {
        "enabled": true
      }
    },
    "embeddingsModels": [
      {
        "provider": "sagemaker",
        "name": "intfloat/multilingual-e5-large",
        "dimensions": 1024,
        "default": true
      }
    ],
    "crossEncoderModels": [
      {
        "provider": "sagemaker",
        "name": "cross-encoder/ms-marco-MiniLM-L-12-v2",
        "default": true
      }
    ]
  }
}
```

**Step 6.** (Optional) Bootstrap AWS CDK on the target account and region

> **Note**: This is required if you have never used AWS CDK on this account and region combination. ([More information on CDK bootstrapping](https://docs.aws.amazon.com/cdk/latest/guide/cli.html#cli-bootstrap)).

```bash
npm run cdk bootstrap aws://{targetAccountId}/{targetRegion}
```

You can now deploy by running:

```bash
npm run cdk deploy
```

> **Note**: This step duration can vary greatly, depending on the Constructs you are deploying.

You can view the progress of your CDK deployment in the [CloudFormation console](https://console.aws.amazon.com/cloudformation/home) in the selected region.

**Step 7.** Configure Knowledge Bases and Guardrails (if enabled):

### Setting up Knowledge Base Connectors
If you enabled Knowledge Bases in your configuration, you'll need to:

1. **Create Amazon Bedrock Knowledge Bases** in the AWS Console:
   - Navigate to [Amazon Bedrock Console](https://console.aws.amazon.com/bedrock/)
   - Go to "Knowledge bases" section
   - Create your knowledge base with your data sources
   - Note the Knowledge Base ID for configuration

2. **Update your configuration** with the Knowledge Base details:
   ```bash
   # Edit bin/config.json and update the knowledgeBase section:
   "knowledgeBase": {
     "enabled": true,
     "external": [
       {
         "name": "Company Documentation",
         "knowledgeBaseId": "YOUR_KB_ID_HERE",
         "region": "us-east-1"
       },
       {
         "name": "Product Manuals",
         "knowledgeBaseId": "ANOTHER_KB_ID_HERE", 
         "region": "us-east-1"
       }
     ]
   }
   ```

### Setting up Amazon Bedrock Guardrails
If you enabled Guardrails in your configuration:

1. **Create Guardrails** in the AWS Console:
   - Navigate to [Amazon Bedrock Console](https://console.aws.amazon.com/bedrock/)
   - Go to "Guardrails" section
   - Create your guardrail with content filters, denied topics, word filters, and sensitive information filters
   - Note the Guardrail ID and Version

2. **Update your configuration** with Guardrail details:
   ```bash
   # Edit bin/config.json and update the bedrock section:
   "bedrock": {
     "enabled": true,
     "region": "us-east-1",
     "guardrails": {
       "enabled": true,
       "identifier": "YOUR_GUARDRAIL_ID",
       "version": "1"
     }
   }
   ```

3. **Redeploy** after configuration changes:
   ```bash
   npm run cdk deploy
   ```

**Step 8.** Once deployed, take note of the `User Interface`, `User Pool` and, if you want to interact with [3P models providers](#3p-models-providers), the `Secret` where to store `API_KEYS` to access 3P model providers.

```bash
...
Outputs:
GenAIChatBotStack.UserInterfaceUserInterfaceDomanNameXXXXXXXX = dxxxxxxxxxxxxx.cloudfront.net
GenAIChatBotStack.AuthenticationUserPoolLinkXXXXX = https://xxxxx.console.aws.amazon.com/cognito/v2/idp/user-pools/xxxxx_XXXXX/users?region=xxxxx
GenAIChatBotStack.ApiKeysSecretNameXXXX = ApiKeysSecretName-xxxxxx
...
```

**Step 9.** Open the generated **Cognito User Pool** Link from outputs above i.e. `https://xxxxx.console.aws.amazon.com/cognito/v2/idp/user-pools/xxxxx_XXXXX/users?region=xxxxx`

**Step 10.** Add a user that will be used to log into the web interface. 

**Step 11.** Assign the admin role to the user.

For more information, please refer to [the access control page](../documentation/access-control.md)

**Step 12.** Open the `User Interface` Url for the outputs above, i.e. `dxxxxxxxxxxxxx.cloudfront.net`.

**Step 13.** Login with the user created in **Step 10** and follow the instructions.

**Step 14.** (Optional) Run the integration tests
The tests require to be authenticated against your AWS Account because it will create cognito users. In addition, the tests will use `anthropic.claude-instant-v1` (Claude Instant), `anthropic.claude-3-haiku-20240307-v1:0` (Claude 3 Haiku), `amazon.titan-embed-text-v1` (Titan Embeddings G1 - Text) and `amazon.nova-canvas-v1:0` (Amazon Nova Canvas) which need to be enabled in Bedrock, 1 workspace engine and the SageMaker default models.

To run the tests (Replace the url with the one you used in the steps above)
```bash
REACT_APP_URL=https://dxxxxxxxxxxxxx.cloudfront.net pytest integtests/ --ignore integtests/user_interface -n 3 --dist=loadfile 
```
To run the UI tests, you will fist need to download and run [geckodriver](https://github.com/mozilla/geckodriver)
```bash
REACT_APP_URL=https://dxxxxxxxxxxxxx.cloudfront.net pytest integtests/user_interface 
```

## Monitoring

Once the deployment is complete, a [Amazon CloudWatch Dashboard](https://console.aws.amazon.com/cloudwatch) will be available in the selected region to monitor the usage of the resources.

For more information, please refer to [the monitoring page](../documentation/monitoring.md)


## Run user interface locally

To experiment with changes to the the user interface, you can run the interface locally. See the instructions in the README file of the [`lib/user-interface/react-app`](https://github.com/aws-samples/aws-genai-llm-chatbot/blob/main/lib/user-interface/react-app/README.md) folder.

## Using Kendra with a non-english index

If you're using Kendra with an index in a language other than English, you will need to make some code modifications.

You'll need to modify the filters in the file `lib/shared/layers/python-sdk/python/genai_core/kendra/query.py`.

Example for french :

```python
    if kendra_index_external or kendra_use_all_data:
        result = kendra.retrieve(
            IndexId=kendra_index_id,
            QueryText=query,
            PageSize=limit,
            PageNumber=1,
            AttributeFilter={'AndAllFilters': [{"EqualsTo": {"Key": "_language_code","Value": {"StringValue": "fr"}}}]}
        )
    else:
        result = kendra.retrieve(
            IndexId=kendra_index_id,
            QueryText=query,
            PageSize=limit,
            PageNumber=1,
            AttributeFilter={'AndAllFilters':
                [
                    {"EqualsTo": {"Key": "_language_code","Value": {"StringValue": "fr"}}},
                    {"EqualsTo": {"Key": "workspace_id","Value": {"StringValue": workspace_id}}}
                ]
            }
        )
```

**Important:** After you have done these changes it's essential to redeploy the solution:

```bash
npx cdk deploy
```

## Troubleshooting

### RAG Section Not Appearing in UI

If the RAG section doesn't appear in the user interface after deployment, check the following:

1. **Verify RAG is enabled in configuration**:
   ```bash
   # Check your bin/config.json file
   grep -A 20 '"rag"' bin/config.json
   ```
   Ensure `"enabled": true` under the rag section.

2. **Check if any RAG engines are enabled**:
   ```bash
   # Look for enabled engines
   grep -A 10 '"engines"' bin/config.json
   ```
   At least one engine (aurora, opensearch, kendra, or knowledgeBase) must have `"enabled": true`.

3. **Verify deployment completed successfully**:
   - Check CloudFormation console for stack status
   - Review CloudWatch logs for any deployment errors

4. **Re-deploy with correct configuration**:
   ```bash
   # Update config and redeploy
   npm run config
   npm run cdk deploy
   ```

5. **Check user permissions**:
   - Ensure your user has the admin role or workspaces manager role
   - RAG features are only visible to users with appropriate permissions

### Common Configuration Issues

- **Missing embedding models**: RAG requires at least one embedding model to be configured
- **Knowledge Base IDs**: Ensure external Knowledge Base IDs are correct and accessible
- **Guardrail permissions**: Verify your deployment role has access to configured guardrails
- **Regional settings**: Ensure all services are in the same region or correctly cross-region configured

## Clean up

You can remove the stacks and all the associated resources created in your AWS account by running the following command:

```bash
npx cdk destroy
```

> **Note**: Depending on which resources have been deployed. Destroying the stack might take a while, up to 45m. If the deletion fails multiple times, please manually delete the remaining stack's ENIs; you can filter ENIs by VPC/Subnet/etc using the search bar [here](https://console.aws.amazon.com/ec2/home#NIC) in the AWS console) and re-attempt a stack deletion.
