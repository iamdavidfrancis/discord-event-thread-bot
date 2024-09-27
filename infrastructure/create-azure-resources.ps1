[CmdletBinding()]
param (
  [Parameter(Mandatory = $true)]
  [string]
  $SubscriptionId,

  [Parameter(Mandatory = $true)]
  [string]
  $ResourceGroup,

  [Parameter()]
  [string]
  $Location = "westus2",

  [Parameter()]
  [switch]
  $WhatIf
)

# Ensure Azure CLI
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
  throw "AZ CLI not found. Please ensure it is installed and in your path."
}

# Ensure Logged In
$accountInfo = az account show -o json | ConvertFrom-Json

if ($null -eq $accountInfo) {
  throw "Failed to get account info. Please run 'az login' again."
}

if ($accountInfo.id -ne $SubscriptionId) {
  az account set --subscription $SubscriptionId
  
  $accountInfo = az account show -o json | ConvertFrom-Json

  if ($accountInfo.id -ne $SubscriptionId) {
    throw "Failed to switch az account to $SubscriptionId. Please run 'az login' again."
  }
}

# Ensure Resource Group
$existingRg = az group exists --name $ResourceGroup -o json | ConvertFrom-Json

if (!$existingRg) {
  Write-Host "Creating Resource Group: $ResourceGroup"
  az group create --name $ResourceGroup --location $Location | Out-Null

  if ($LASTEXITCODE -ne 0) {
    throw "Failed to create resource group."
  }

  $existingRg = az group exists --name $ResourceGroup -o json | ConvertFrom-Json

  if (!$existingRg) {
    throw "Failed to find resource group after attempting to create it."
  }
}
else {
  Write-Host "Resource Group already exists."
}

# Deploy Resources
if ($WhatIf) {
  Write-Host "Running WhatIf deployment"
  az deployment group create --resource-group $ResourceGroup --template-file "$PSScriptRoot/azure-resources.bicep" --parameters "@$PSScriptRoot/azure-resources.params.json" --what-if
} else {
  Write-Host "Running real deployment"
  az deployment group create --resource-group $ResourceGroup --template-file "$PSScriptRoot/azure-resources.bicep" --parameters "@$PSScriptRoot/azure-resources.params.json"

  Write-Host "Deployment completed. To clean up resources run the following"
  Write-Host "az group delete --name $ResourceGroup"
}

