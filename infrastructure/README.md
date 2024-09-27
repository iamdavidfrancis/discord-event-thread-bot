# Deployment Infrastructure

This folder contains the tooling to deploy the bot to Azure. We're leveraging Azure's [Infrastructure as Code](https://en.wikipedia.org/wiki/Infrastructure_as_code) support via bicep files and the AZ CLI.

## Running the Deployment

### Prerequisites

1. An Azure Subscription
2. The [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/)
3. A Discord bot registration.

### Prep the parameters

In this folder, there is a file named `azure-resources.params.example.json`. Make a copy of it and name the copy `azure-resources.params.json`. This file is gitignored so it won't be committed to the repo.

In it the new json file you'll need to set some values:

| Parameter Name              | Value                                                                                                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                      | The name you want to use for the container app in Azure                                                                                                                 |
| `storageName`               | The name of the storage account. It must be all lowercase and alphanumeric only.                                                                                        |
| `containerImage`            | The path to your docker image. Example `ghcr.io/username/my-cool-image:latest`                                                                                          |
| `secrets`                   | The secrets for the bot. Currently only includes the Discord Bot Token. This is a secure param, so won't be saved in the deployment info in Azure for security reasons. |
| `registries`                | If your image is in a private registry, you'll need to include this. See below for more information.                                                                    |
| `discordClientId`           | The client id for the discord bot.                                                                                                                                      |
| `discordTokenSecretRefName` | The name of the discord token secret. Should be `discord-token` unless you've changed the name of the secret.                                                           |

#### Note about registries

If the image is in a private registry, you'll need to include this in your params file:

In the `secrets.arrayValue` array:

```json
{
  "name": "registry-password",
  "value": "{the app password for your registry}"
}
```

In the `parameters` object:

```json
"registries": [
 {
  "server": "{Registry login server. Something like docker.io or ghcr.io}",
  "username": "{Username used to auth}",
  "passwordSecretRef": "registry-password"
 }
]
```

### Run the deployment

Before you can run the script, run `az login` to ensure you're logged into the correct account. You can also use `az account show` to double check. Once you've verified you're in the right account, you can continue to running the script.

In this directory there's a script called `create-azure-resources.ps1`. It will run the deployment using the bicep file and takes the following parameters:

| Parameter        | Use                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SubscriptionId` | The Azure subscription id. This is the subscription the resources will be created in.                                                                                                |
| `ResourceGroup`  | The name of the Resource Group to use. If there is no group in the Subscription, the script will create it.                                                                          |
| `Location`       | The Azure location for the resource group. Only used if the resource group doesn't already exist. Default is `westus2`                                                               |
| `WhatIf`         | A switch parameter to run the deployment in "What If" mode. The output will show what Azure Resource Manager _would_ have done. If you omit this, it will perform a real deployment. |

Running the script will look something like this:

```powershell
.\create-azure-resources.ps1 -SubscriptionId $SubscriptionId -ResourceGroup my-discord-bot-rg -Location westus
```

Once the script is running, you can navigate to the Azure portal, find your resource group, and look for `Deployments`. You should see the running deployment and all the resources as they get provisioned.

## Cleaning up the resources

After you've finished with this, you can easily delete all the resources by deleting the resource group. You can do it from the Azure CLI with:

```powershell
az group delete --name $ResourceGroupName
```

You can also delete the resources from the portal by navigating to the Subscription or Resource Group.
