param location string = resourceGroup().location

@minLength(1)
@description('Provide a name for the bot. This name will be used in all of the azure resources created except the storage account.')
param name string = 'discord-bot-${uniqueString(resourceGroup().id)}'

@minLength(3)
@maxLength(18)
@description('Provide a name for the storage account. Use only lower case letters and numbers. The name must be unique across Azure.')
param storageName string = 'store${uniqueString(resourceGroup().id)}'

@description('The registry to pull the container from. Only needed if the image is private. Object should include "server", "username", and "passwordSecretRef"')
param registries array = []

@description('The name of the container running the bot image.')
param containerName string = name

@description('The container image. Should be of the format "{repository}/{image}:{tag}".')
param containerImage string

@secure()
#disable-next-line secure-parameter-default
param secrets object = {
  arrayValue: []
}

param discordClientId string

@description('The name of the secret containing the discord token')
#disable-next-line secure-secrets-in-params
param discordTokenSecretRefName string // Not a secret, but the name of a secret

// Storage Account & Table
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  kind: 'StorageV2'
  location: location
  name: 'store${storageName}'
  sku: {
    name: 'Standard_ZRS'
  }
  properties: {
    allowBlobPublicAccess: false
    allowSharedKeyAccess: false
    defaultToOAuthAuthentication: true
    minimumTlsVersion: 'TLS1_2'
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
    accessTier: 'Hot'
    encryption: {
      requireInfrastructureEncryption: true
      keySource: 'Microsoft.Storage'
      services: {
        table: {
          enabled: true
          keyType: 'Account'
        }
      }
    }
    allowCrossTenantReplication: false
    allowedCopyScope: 'AAD'
    dnsEndpointType: 'Standard'
    supportsHttpsTrafficOnly: true
  }
}

resource storageTableServices 'Microsoft.Storage/storageAccounts/tableServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
}

resource storageTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = {
  parent: storageTableServices
  name: 'db${storageName}'
}

// Container Networking
resource vnet 'Microsoft.Network/virtualNetworks@2024-01-01' = {
  name: 'vnet-${name}'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
    subnets: [
      {
        name: '${name}-subnet'
        type: 'Microsoft.Network/virtualNetworks/subnets'
        properties: {
          serviceEndpoints: []
          addressPrefix: '10.0.0.0/23'
          delegations: [
            {
              name: 'Microsoft.app.environments'
              properties: {
                serviceName: 'Microsoft.App/environments'
              }
            }
          ]
        }
      }
    ]
  }
}

// Log Analytics
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  location: location
  name: '${name}-loganalytics'
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    workspaceCapping: {}
  }
}

// Container App Environment
resource appEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  location: location
  name: '${name}-app-env'
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
    vnetConfiguration: {
      infrastructureSubnetId: vnet.properties.subnets[0].id
      internal: false
    }
    zoneRedundant: true
  }
}

resource container 'Microsoft.App/containerApps@2024-03-01' = {
  location: location
  name: name
  properties: {
    environmentId: appEnvironment.id
    configuration: {
      secrets: secrets.arrayValue
      registries: registries
      activeRevisionsMode: 'Single'
    }
    workloadProfileName: 'Consumption'
    template: {
      // containers: []
      containers: [
        {
          name: containerName
          image: containerImage
          command: []
          args: []
          env: [
            {
              name: 'STORAGE_ACCOUNT_NAME'
              value: storageAccount.name
            }
            {
              name: 'STORAGE_TABLE_NAME'
              value: storageTable.name
            }
            {
              name: 'DISCORD_CLIENT_ID'
              value: discordClientId
            }
            {
              name: 'DISCORD_TOKEN'
              secretRef: discordTokenSecretRefName
            }
          ]
          resources: {
            cpu: 1
            memory: '2Gi'
          }
        }
      ]
      scale: {
        maxReplicas: 1
        minReplicas: 1
      }
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

@description('This is the built-in Contributor role. See https://docs.microsoft.com/azure/role-based-access-control/built-in-roles#contributor')
resource roleDefinition 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = {
  scope: subscription()
  name: '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3' // Storage Table Data Contributor
}

resource containerAppRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, container.name, roleDefinition.id)
  scope: storageAccount
  properties: {
    principalType: 'ServicePrincipal'
    principalId: container.identity.principalId
    roleDefinitionId: roleDefinition.id
  }
}
