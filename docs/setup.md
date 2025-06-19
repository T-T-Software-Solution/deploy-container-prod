
## Setup

generate service principal credentials for source ACR:
```bash
az ad sp create-for-rbac --name "[Prod] github-action/ttss/deploy-container-prod" --role contributor --scopes /subscriptions/03cc7dd5-506a-490d-a1d2-06e43f46678b/resourceGroups/easy-vm-win-server/providers/Microsoft.ContainerRegistry/registries/easyinsuredev --sdk-auth
```

Login server: easyinsuredev.azurecr.io

generate service principal credentials for target ACR:
```bash
az ad sp create-for-rbac --name "[Prod] github-action/ttss/deploy-container-prod" --role contributor --scopes /subscriptions/8c0468a3-22af-4506-8810-77c19f109028/resourceGroups/rg-tt-shared-prod/providers/Microsoft.ContainerRegistry/registries/ttshared --sdk-auth
``` 

Login server: ttshared-hxcfc7b6cfchfbe3.azurecr.io