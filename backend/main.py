name: Build and Deploy to Azure

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Code
      uses: actions/checkout@v3

    - name: Log in to Azure
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}

    - name: Log in to Azure Container Registry (ACR)
      run: az acr login --name ${{ secrets.ACR_NAME }}

    - name: Build and Push Backend Docker Image
      run: |
        docker build -t ${{ secrets.ACR_NAME }}.azurecr.io/backend:latest ./backend
        docker push ${{ secrets.ACR_NAME }}.azurecr.io/backend:latest

    - name: Build and Push Frontend Docker Image
      run: |
        docker build -t ${{ secrets.ACR_NAME }}.azurecr.io/frontend:latest ./frontend
        docker push ${{ secrets.ACR_NAME }}.azurecr.io/frontend:latest

    - name: Deploy to Azure Web App
      run: |
        az webapp config container set \
          --name ${{ secrets.APP_NAME }} \
          --resource-group ${{ secrets.RESOURCE_GROUP }} \
          --multicontainer-config-type compose \
          --multicontainer-config-file docker-compose-azure.yml \
          --docker-registry-server-url https://${{ secrets.ACR_NAME }}.azurecr.io \
          --docker-registry-server-user ${{ secrets.ACR_USERNAME }} \
          --docker-registry-server-password ${{ secrets.ACR_PASSWORD }}
