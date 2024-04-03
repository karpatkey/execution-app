#!/bin/bash

PR_NUMBER=$1

# Apply the temporary Kubernetes deployment
kubectl delete deployment -n agile-pr-review develop-execution-app-${PR_NUMBER}

kubectl delete svc -n agile-pr-review develop-execution-app-${PR_NUMBER}

kubectl delete ing -n agile-pr-review develop-execution-app-ingress-${PR_NUMBER}