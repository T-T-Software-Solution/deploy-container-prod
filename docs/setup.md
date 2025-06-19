
## Setup

generate service principal credentials for source ACR:
```bash
az logout
az login
az account set -s "Microsoft Azure Sponsorship"
az account show
az ad sp create-for-rbac --name "[Prod] github-action/ttss/deploy-container-prod" --role contributor --scopes /subscriptions/03cc7dd5-506a-490d-a1d2-06e43f46678b/resourceGroups/easy-vm-win-server/providers/Microsoft.ContainerRegistry/registries/easyinsuredev --sdk-auth
```

Login server: easyinsuredev.azurecr.io
## Target ACR

Note: make sure using tenant:   "tenantId": "c708d903-e5dd-4866-9cd9-6752fe64fd46",

generate service principal credentials for target ACR:
```bash
az logout
az login
az account set -s "T.T. Software Solution"
az account show
az ad sp create-for-rbac --name "[Prod] github-action/ttss/deploy-container-prod (ttshared)" --role contributor --scopes /subscriptions/8c0468a3-22af-4506-8810-77c19f109028/resourceGroups/rg-tt-shared-prod/providers/Microsoft.ContainerRegistry/registries/ttshared --sdk-auth
``` 

Login server: ttshared-hxcfc7b6cfchfbe3.azurecr.io