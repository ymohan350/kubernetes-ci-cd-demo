| |  |  
| :--- | :--- |  
| :bookmark: **Summary** | The article explains how to build a scalable CI/CD pipeline for Kubernetes deployments using GitHub Actions and ArgoCD, focusing on automation, efficiency, and best practices for managing containerized applications. |  
| :link: **Original article** | [Building a Scalable CI/CD Pipeline for Kubernetes Deployments with GitHub Actions and ArgoCD](https://medium.com/@oncharijohannes/building-a-scalable-ci-cd-pipeline-for-kubernetes-deployments-with-github-actions-and-argocd-10e86153494f) |  
| :bust_in_silhouette: **Author** | Tinega Onchari |  
| :busts_in_silhouette: **Audience** | DevOps engineers, software developers, and teams managing Kubernetes-based applications. | 
# Building a Scalable CI/CD Pipeline for Kubernetes Deployments with GitHub Actions and ArgoCD

## Introduction
Modern software development demands speed, scalability, and reliability due to the rapidly evolving nature of technology and user expectations. Organizations must deliver features and updates more frequently while ensuring that their applications remain stable and perform efficiently. These demands have given rise to the adoption of CI/CD pipelines, which automate and streamline the development, testing, and deployment processes. By addressing these challenges, CI/CD pipelines help teams accelerate delivery cycles, reduce manual errors, and improve overall software quality. Continuous Integration and Continuous Deployment (CI/CD) pipelines are the cornerstone of achieving these goals, especially in cloud-native environments like Kubernetes. In this tutorial, we'll explore building a scalable CI/CD pipeline using GitHub Actions for CI and ArgoCD for CD.

By the end of this guide, you'll have a fully functional pipeline capable of automating the build, test, and deployment processes for a Kubernetes application — a Node.js REST API that returns the current time.

---

## Setting Up the Environment
Before we dive into the implementation, ensure you have the following:

- **Kubernetes Cluster**: A working Kubernetes cluster (e.g., Minikube, AKS, EKS, or GKE).
- **GitHub Repository**: A repository containing your application's source code.
- **Container Registry**: Access to a Docker container registry (e.g., Docker Hub or AWS ECR).
- **CLI Tools**: `kubectl`, Docker, and ArgoCD CLI installed.

For this tutorial, we'll use the following real-world example:
- **Application**: A Node.js REST API that returns the current time. This application was chosen for its simplicity and clarity, making it an ideal example for demonstrating CI/CD workflows. Its lightweight structure allows you to focus on pipeline automation without the complexities of managing a large codebase, while still being representative of real-world deployment scenarios.
- **Repository**: [kubernetes-ci-cd-demo](https://github.com/Tinega-Devops/kubernetes-ci-cd-demo).
- **Container Registry**: Docker Hub (`<Your-dockerhub-username>/current-time-api`).

To follow along, start by forking the repository and cloning it to your local computer. This will allow you to make changes to the code and push them back to your GitHub account.

---

## Implementing CI with GitHub Actions

### Step 1: GitHub Workflow File
The GitHub Actions workflow is defined within the `.github/workflows/` directory of your repository. This directory contains the Continuous Integration (CI) configuration files. Inside this directory, you typically create a file named `ci-pipeline.yml` to define your CI pipeline.

When changes are pushed to the repository, the GitHub Actions workflow is triggered. The workflow consists of a job called `build-and-push`. This job performs the following tasks:

1. **Checkout Code**: It checks out the latest version of the code from the repository.
2. **Set Up Node.js Environment**: It configures the Node.js environment required to run the project.
3. **Install Dependencies**: It installs all necessary project dependencies.
4. **Run Tests**: It executes tests to ensure that the code is running correctly and without errors.
5. **Log Into Docker Hub**: It logs into Docker Hub to allow for image building and pushing.
6. **Build and Push Docker Image**: It builds a Docker image for the current application (in this case, a time API) and pushes the image to Docker Hub.

This Docker image will later be deployed to a Kubernetes cluster, which is managed by an ArgoCD continuous deployment pipeline.

### Step 2: Define the CI Pipeline
Here are the contents of the workflow:

```yaml
name: CI Pipeline
on:
  push:
    branches:
      - main
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      - name: Install Dependencies
        run: npm install
      - name: Run Tests
        run: npm test
      - name: Log in to Docker Hub
        run: echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
      - name: Build and Push Docker Image
        run: |
          docker build -t <Your-DockerHub-Username>/current-time-api:${{ github.sha }} .
          docker tag <Your-DockerHub-Username>/current-time-api:${{ github.sha }} <Your-DockerHub-Username>/current-time-api:latest
          docker push <Your-DockerHub-Username>/current-time-api:${{ github.sha }}
          docker push <Your-DockerHub-Username>/current-time-api:latest
```
---

## Integrating ArgoCD for Continuous Deployment

### Step 1: Install ArgoCD

Install ArgoCD in your Kubernetes cluster: ArgoCD is a declarative, GitOps continuous delivery tool for Kubernetes. It enables automated deployments and version control of your Kubernetes manifests by syncing them with your Git repository. Installing ArgoCD gives you a powerful platform for managing and automating application rollouts and lifecycles within your Kubernetes cluster. To begin, execute the following commands:

```bash

kubectl create namespace argocd

kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

```

To verify that ArgoCD was successfully installed on your Kubernetes cluster, run the `kubectl` command:

```bash

kubectl get all -n argocd

```

The command will display all the resources in the argocd namespace. Here is an example of the results.

```bash


NAME                                                   READY   STATUS    RESTARTS   AGE
pod/argocd-application-controller-0                    1/1     Running   0          155m
pod/argocd-applicationset-controller-764744455-7zpwz   1/1     Running   0          155m
pod/argocd-dex-server-78df54498c-fkzsg                 1/1     Running   0          155m
pod/argocd-notifications-controller-577b87f4bd-5btn2   1/1     Running   0          155m
pod/argocd-redis-564c8b4dd7-8b8vk                      1/1     Running   0          155m
pod/argocd-repo-server-6858df88f4-xtgs8                1/1     Running   0          155m
pod/argocd-server-74b5b78785-5twr4                     1/1     Running   0          155m

NAME                                              TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
service/argocd-applicationset-controller          ClusterIP   10.108.143.77    <none>        7000/TCP,8080/TCP            155m
service/argocd-dex-server                         ClusterIP   10.110.187.94    <none>        5556/TCP,5557/TCP,5558/TCP   155m
service/argocd-metrics                            ClusterIP   10.102.187.226   <none>        8082/TCP                     155m
service/argocd-notifications-controller-metrics   ClusterIP   10.103.165.1     <none>        9001/TCP                     155m
service/argocd-redis                              ClusterIP   10.103.187.225   <none>        6379/TCP                     155m
service/argocd-repo-server                        ClusterIP   10.98.60.104     <none>        8081/TCP,8084/TCP            155m
service/argocd-server                             ClusterIP   10.101.52.110    <none>        80/TCP,443/TCP               155m
service/argocd-server-metrics                     ClusterIP   10.110.0.116     <none>        8083/TCP                     155m

NAME                                               READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/argocd-applicationset-controller   1/1     1            1           155m
deployment.apps/argocd-dex-server                  1/1     1            1           155m
deployment.apps/argocd-notifications-controller    1/1     1            1           155m
deployment.apps/argocd-redis                       1/1     1            1           155m
deployment.apps/argocd-repo-server                 1/1     1            1           155m
deployment.apps/argocd-server                      1/1     1            1           155m

NAME                                                         DESIRED   CURRENT   READY   AGE
replicaset.apps/argocd-applicationset-controller-764744455   1         1         1       155m
replicaset.apps/argocd-dex-server-78df54498c                 1         1         1       155m
replicaset.apps/argocd-notifications-controller-577b87f4bd   1         1         1       155m
replicaset.apps/argocd-redis-564c8b4dd7                      1         1         1       155m
replicaset.apps/argocd-repo-server-6858df88f4                1         1         1       155m
replicaset.apps/argocd-server-74b5b78785                     1         1         1       155m

NAME                                             READY   AGE
statefulset.apps/argocd-application-controller   1/1     155m

```

### Step 2: Access the ArgoCD UI

Now that you have ArgoCD installed, it’s time to expose the ArgoCD UI so that you can access it through the web. To do this, run the following `kubectl` command:

```bash

kubectl port-forward svc/argocd-server -n argocd 8080:443

```

On the terminal, you should see the following. This terminal should be kept running at all times to serve the site.

```bash

Forwarding from 127.0.0.1:8080 -> 8080

Forwarding from [::1]:8080 -> 8080

```

Using the URL `https://127.0.0.1:8080` as shown above, you should be able to access the ArgoCD UI. This will be the first page you see when you open the URL in your browser.

**Note:** Your access URL may be different from the one mentioned above, depending on your specific setup and configuration. Make sure to use the correct URL provided for your environment.


![The argoCD Login page|690x413](/images/Screenshot%202024-12-27%20at%2001.01.37.png)


### Step 3: Configure ArgoCD

#### 1. Login to ArgoCD:

After launching the ArgoCD UI, the next step is to log in for the first time. The default username in ArgoCD is `admin`. To retrieve the password for the admin user, you can run the following command. Ensure that you have the ArgoCD CLI installed on your computer before executing this command.

Once you have the password and admin username, you can log in to the ArgoCD UI. After logging in, it is recommended to change the default password to one that is easier for you to remember.

```bash

argocd admin initial-password -n argocd

```

#### 2. Add your GitHub repository to ArgoCD:

The next step is to add your GitHub repository to ArgoCD. You can configure it either through the ArgoCD CLI or directly via the web UI. In this example, I will guide you through the process using the web UI.

1. Navigate to the settings section in ArgoCD.
2. Under the **Repositories** tab, you will find options to add a new repository.
3. Here, you can configure your GitHub repository by providing the necessary details.

This is what the **Repositories** section looks like in the ArgoCD UI.

![Repository Connection configuration form|672x500](/images/Screenshot%202024-12-27%20at%2004.20.39.png)


If the setup is successful, you should see a green check mark next to your GitHub repository, indicating that it has been connected successfully. If there is an issue, you will see a connection failure error message, indicating that the GitHub repository failed to connect.

The next optional step at this stage is the cluster configuration. By default, the cluster where ArgoCD is installed is automatically configured during installation. Any additional Kubernetes clusters should be added through the **Cluster Configuration** section.

Keep in mind that most of these configurations can also be done using the ArgoCD CLI, so you can choose to use either the CLI or the web UI — both options achieve the same goal.

### Step 4: Create an Application in ArgoCD


Define an application in a YAML file: This application definition serves as the bridge between your GitHub repository and your Kubernetes cluster within the ArgoCD workflow. It tells ArgoCD what to deploy, where to deploy it, and which configurations to use. The application YAML specifies the repository URL, branch, and path for the Kubernetes manifests, as well as the destination cluster and namespace. This ensures that your deployment process is automated and repeatable. Here's the YAML definition:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: current-time-api
  namespace: argocd
spec:
  source:
    repoURL: https://<Your-Github-Repo-Url> # Use your forked github repo of this project.
    targetRevision: main
    path: manifests
  destination:
    server: https://<Your-kubernetes-Server> # Use your own cluster server
    namespace: default
  project: default
```

To create your first application on the ArgoCD platform, use the following `kubectl apply` command. Before running the command, make sure to update the `repoURL` and `server` values to match your correct GitHub repository URL and the correct cluster URL.

![Current-time-api application. |690x411](/images/Screenshot%202024-12-27%20at%2002.02.32.png)


This command will create the application on ArgoCD. Ensure that the repository URL points to your GitHub repository, and the server URL corresponds to the Kubernetes cluster you want the application to be deployed.

```bash
kubectl apply -f app.yaml
```

---

### Deploying the Node.js REST API

1. Push the sample Kubernetes manifest to your repository:

This manifest is a YAML configuration file that defines the Kubernetes resources necessary to deploy your application. It specifies a `Deployment` And outlines the desired state for your pods, such as the number of replicas, container images, and port configurations. By pushing this file to your repository, you enable ArgoCD to monitor the repository for changes and automatically deploy or update your application based on the latest configurations. Here's the example manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: current-time-api
  labels:
    app: current-time-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: current-time-api
  template:
    metadata:
      labels:
        app: current-time-api
    spec:
      containers:
      - name: current-time-api
        image: < Your-dockerhub-username >/current-time-api:latest
        ports:
        - containerPort: 3000
```

2. ArgoCD will automatically detect the changes and deploy the application. Here is how the application is shown:

![The synced changes.|690x358](/images/Screenshot%202024-12-27%20at%2002.04.41.png)



---

## Best Practices for CI/CD with Kubernetes

1. **Secrets Management**: Use tools like HashiCorp Vault or Kubernetes Secrets to manage sensitive information securely. HashiCorp Vault provides robust methods for securing, storing, and tightly controlling access to secrets such as API keys, passwords, and certificates. Kubernetes Secrets, on the other hand, allow you to store and manage sensitive information directly within the Kubernetes ecosystem. Integrating these tools into your CI/CD pipeline ensures that sensitive data is protected throughout the pipeline's lifecycle. For example, you can use GitHub Actions to reference these secrets securely without hardcoding them into your repository. This approach minimizes risks and improves compliance with security best practices.

2. **Monitoring**: Implement observability with tools like Prometheus and Grafana to monitor your pipeline.
3. **Testing**: Include unit tests and integration tests in your CI pipeline.
4. **Rollback Strategies**: Use ArgoCD's built-in rollback features to handle failed deployments.

---

## Conclusion

By combining GitHub Actions for CI and ArgoCD for CD, you’ve created a scalable, efficient pipeline for Kubernetes deployments. This setup enables rapid iterations while maintaining high reliability. The included Node.js REST API application demonstrates how this pipeline can be used in real-world scenarios. Explore additional optimizations like blue-green deployments or canary releases to enhance your pipeline further.

Happy coding!
