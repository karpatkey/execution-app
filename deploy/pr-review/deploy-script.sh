#!/bin/bash

# GitHub repository and PR API endpoint
GITHUB_REPO="karpatkey/execution-app"
GITHUB_SHA=$1
GITHUB_API_URL="https://api.github.com/repos/${GITHUB_REPO}/commits/${GITHUB_SHA}/pulls"

DOCKER_TAG=$(echo $1 | cut -c1-7)

# Extract PR number from the GitHub API response
PR_NUMBER=$(curl -s ${GITHUB_API_URL} | jq -r '.[0].number')

SOURCE_BRANCH=$(curl -s ${GITHUB_API_URL} | jq -r '.[0].head.ref')

# echo $SOURCE_BRANCH

# Set your Kubernetes deployment and ingress template files
DEPLOYMENT_TEMPLATE="deployment-template.yaml"
INGRESS_TEMPLATE="ingress-template.yaml"

# Set the temporary deployment and ingress file names
TEMP_DEPLOYMENT_FILE="deployment-temp.yaml"
TEMP_INGRESS_FILE="ingress-temp.yaml"

sed "s|{{PR_SUBDOMAIN}}|${PR_NUMBER}-agile.karpatkey.dev|g" ${DEPLOYMENT_TEMPLATE} > ${TEMP_DEPLOYMENT_FILE}

sed -i "s|{{DOCKER_TAG}}|${DOCKER_TAG}|g" ${TEMP_DEPLOYMENT_FILE}

sed -i "s|{{PR_NUMBER}}|${PR_NUMBER}|g" ${TEMP_DEPLOYMENT_FILE}

# Create temporary ingress file by setting the subdomain
sed "s|{{PR_SUBDOMAIN}}|${PR_NUMBER}-agile.karpatkey.dev|g" ${INGRESS_TEMPLATE} > ${TEMP_INGRESS_FILE}

sed -i "s|{{PR_NUMBER}}|${PR_NUMBER}|g" ${TEMP_INGRESS_FILE}


# Apply the temporary Kubernetes deployment
kubectl apply -f ${TEMP_DEPLOYMENT_FILE}

# Apply the temporary Kubernetes ingress
kubectl apply -f ${TEMP_INGRESS_FILE}

# Clean up temporary files
# rm ${TEMP_DEPLOYMENT_FILE}
# rm ${TEMP_INGRESS_FILE}
