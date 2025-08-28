Performance Analysis of AKS (Azure Kubernetes Service)

Empirical evaluation of microservices performance & scalability on AKS
Steady, spike, and ramp workloads · Horizontal vs vertical scaling · HPA effectiveness · Tail latency (p95/p99) · Prometheus/Grafana + k6

✨ Overview

This project measures how a containerised microservices app behaves on Azure Kubernetes Service (AKS) under different workloads and scaling strategies. It focuses on:

Horizontal vs. vertical scaling impacts on throughput and latency

Autoscaling (HPA) responsiveness to spike and ramp workloads

Tail latency (p95/p99), CPU/memory utilisation, and error rates

Practical, reproducible test harness with k6 and Prometheus/Grafana

Outcome: actionable guidance on when to scale out vs scale up, and how HPA settings affect tail latency and resilience.

🏗️ Architecture (at a glance)

App: simple e-commerce style microservices (gateway + catalog/order/user)

AKS: 1+ node pools (Linux), HPA (CPU target), optional VPA (off)

Load: k6 (steady/spike/ramp)

Observability: Prometheus + Grafana (or Azure Monitor), alerts optional

[ k6 ] → [ AKS Ingress/Service ] → [ Frontend API ] → [ Catalog | Order | User ]
                                  ↘ metrics (/metrics) → [ Prometheus ] → [ Grafana ]

📁 Repo structure (suggested)
.
├─ app/                 # microservices (e.g., frontend, catalog, order, user)
│  ├─ Dockerfile
│  └─ k8s/              # manifests: Deployments, Services, HPA
├─ k6/                  # load scripts: steady.js, spike.js, ramp.js, jobs.yaml
├─ monitoring/          # Prometheus/Grafana (Helm values or manifests)
├─ scripts/             # helper scripts (AKS create/destroy, PromQL exports)
├─ analysis/            # notebooks or CSVs for charts/tables
├─ docs/                # diagrams, experiment notes
└─ README.md


If your layout differs, keep the same ideas and update paths below.

✅ Prerequisites

Azure CLI (az), kubectl, Helm

Azure subscription with permissions to create AKS & ACR

Docker (to build images)

(Optional) k6, jq locally (if not running in-cluster jobs)

Sign in & set subscription:

az login
az account set --subscription "<SUBSCRIPTION_ID_OR_NAME>"

🚀 Quick start
1) Create AKS + ACR and connect
# Variables
RG=perf-rg
LOC=westeurope
AKS=perf-aks
ACR=perfacr$RANDOM

# Resource group
az group create -n $RG -l $LOC

# ACR + AKS
az acr create -n $ACR -g $RG --sku Basic
az aks create -n $AKS -g $RG --node-count 2 --generate-ssh-keys --attach-acr $ACR

# Get credentials
az aks get-credentials -n $AKS -g $RG

2) Build & push images
# Example: build service images (adjust paths/names as needed)
docker build -t $ACR.azurecr.io/frontend:latest ./app/frontend
docker push    $ACR.azurecr.io/frontend:latest
# Repeat for catalog/order/user...

3) Deploy app and HPA
# Namespace
kubectl create ns perf || true

# App manifests (Deployments/Services)
kubectl -n perf apply -f app/k8s/

# Example HPA (adjust CPU target or min/max replicas)
kubectl -n perf apply -f app/k8s/hpa.yaml

4) Monitoring stack (Prometheus/Grafana)
# Option A: Helm (kube-prometheus-stack)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm -n monitoring install kps prometheus-community/kube-prometheus-stack \
  --create-namespace \
  -f monitoring/values.yaml

# ServiceMonitor for your backend metrics
kubectl apply -f monitoring/servicemonitor-backend.yaml


Ensure your app exposes /metrics (e.g., Prometheus FastAPI/Express instrumentator).

5) Run workloads (k6)

In-cluster jobs:

# Steady load
kubectl -n perf apply -f k6/k6-steady.job.yaml
kubectl -n perf wait --for=condition=complete job/k6-steady --timeout=20m
kubectl -n perf logs job/k6-steady

# Spike load
kubectl -n perf apply -f k6/k6-spike.job.yaml
kubectl -n perf wait --for=condition=complete job/k6-spike --timeout=20m
kubectl -n perf logs job/k6-spike

# Ramp load
kubectl -n perf apply -f k6/k6-ramp.job.yaml
kubectl -n perf wait --for=condition=complete job/k6-ramp --timeout=20m
kubectl -n perf logs job/k6-ramp

📊 Metrics & data export

Example PromQL → TSV exporters (edit labels/namespaces to match yours):

# p95 latency (ms)
curl -sG "$PROM/api/v1/query_range" \
  --data-urlencode 'query=histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket{namespace="perf",service="backend"}[5m]))) * 1000' \
  --data-urlencode "start=$START" --data-urlencode "end=$END" --data-urlencode "step=$STEP" \
| jq -r '.data.result[0]?.values[]? | @tsv' > analysis/steady_p95_ms.tsv

# Throughput (RPS)
curl -sG "$PROM/api/v1/query_range" \
  --data-urlencode 'query=sum(rate(http_requests_total{namespace="perf"}[1m]))' \
  --data-urlencode "start=$START" --data-urlencode "end=$END" --data-urlencode "step=$STEP" \
| jq -r '.data.result[0]?.values[]? | @tsv' > analysis/steady_rps.tsv

# CPU cores (sum over backend pods)
curl -sG "$PROM/api/v1/query_range" \
  --data-urlencode 'query=sum(rate(container_cpu_usage_seconds_total{namespace="perf",pod=~"backend-.*",image!=""}[2m]))' \
  --data-urlencode "start=$START" --data-urlencode "end=$END" --data-urlencode "step=$STEP" \
| jq -r '.data.result[0]?.values[]? | @tsv' > analysis/steady_cpu.tsv


Add similar scripts for spike and ramp runs. Plot in your favourite tool or analysis/ notebook.

🧪 Experiments

Steady: baseline at fixed RPS; measure mean/p95 latency, CPU/mem, errors

Horizontal scaling: replicas = 1→N; observe linearity and tail latency

Vertical scaling: increase pod CPU/mem limits; compare gains vs replicas

Spike: sudden 5–10× burst; compare HPA on vs HPA off

Ramp: gradual RPS increase; verify smooth scaling without SLO breach

Record:

Mean & p95/p99 latency, throughput, error rate

Pod/Node CPU/memory, HPA target vs actual, scale events timing

Any throttling (container CPU throttled seconds), OOMs, restarts

📈 Grafana panels (suggested PromQL)

RPS: sum(rate(http_requests_total{namespace="perf"}[1m]))

p95 latency: histogram_quantile(0.95, sum by (le)(rate(http_request_duration_seconds_bucket{namespace="perf"}[5m])))

CPU (cores): sum(rate(container_cpu_usage_seconds_total{namespace="perf",container!="",image!=""}[2m]))

Memory (MiB): sum(container_memory_working_set_bytes{namespace="perf",container!="",image!=""}) / 1024^2

HPA target vs actual: panel of kube_hpa_target_metric (or Azure Monitor equivalents)

⚙️ Configuration tips

HPA: start with targetCPUUtilizationPercentage: 50, min=1, max=5–10

Resources: set conservative requests/limits; avoid throttling

Ingress/Service: ensure proper timeouts to avoid masking app latency

Node size: choose VM SKU that matches test scale; keep noise predictable

🧹 Cleanup
kubectl delete ns perf monitoring --ignore-not-found
az group delete -n $RG --yes --no-wait

🔍 Results (typical findings to validate)

Scaling out > up for throughput at moderate loads

HPA mitigates spike-induced tail latency after warm-up (~tens of seconds)

Vertical scaling has diminishing returns unless single pod is CPU-bound

(Replace with your measured numbers & charts in the repo’s analysis/ folder.)

📜 License

MIT (or your chosen license). Add a LICENSE file.

🙏 Acknowledgements

Azure AKS & Kubernetes community

Prometheus/Grafana, k6 contributors

University supervision & feedback

📬 How to cite

If you use this in academic work, please cite your dissertation/report and this repo.

Sapkota, J. (2025). Performance Analysis of AKS: Microservices Scalability under Realistic Workloads. MSc Dissertation, University of Lincoln.
