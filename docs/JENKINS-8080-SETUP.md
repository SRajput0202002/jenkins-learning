# Jenkins on http://localhost:8080 — fullstack build & deploy

Use **one** Jenkins container (custom image with Python, Node, Docker). Your old `jenkins/jenkins:lts-jdk17` container must be stopped so port **8080** is free.

## 1. Start Jenkins (project image)

```bash
cd /Users/surbhi/Desktop/fastapi-react-jenkins-demo
docker stop jenkins jenkins-learning 2>/dev/null || true
docker rm jenkins jenkins-learning 2>/dev/null || true
docker compose -f docker-compose.jenkins.yml up -d --build
```

Open **http://localhost:8080**

> **Note:** This uses a new `jenkins_home` volume. Jobs from an old plain Jenkins image (e.g. `first-pipeline`) are not copied automatically. Recreate jobs below.

## 2. Push code to GitHub

Jenkins loads the pipeline from Git, not from your Mac folder.

```bash
git remote -v   # must show your GitHub repo
git push -u origin main
```

## 3. Create the pipeline job (UI)

1. **New Item** → name: `fullstack-cicd` → **Pipeline** → OK  
2. **Pipeline** section:
   - **Definition:** Pipeline script from SCM  
   - **SCM:** Git  
   - **Repository URL:** `https://github.com/YOUR_USER/fastapi-react-jenkins-demo.git`  
   - **Credentials:** add if the repo is private  
   - **Branch:** `*/main`  
   - **Script Path:** `jenkins/Jenkinsfile.phase-deploy-local`  
3. **Save** → **Build Now**

## 4. What you see in the dashboard

| Stage | What happens |
|-------|----------------|
| Checkout | Clones repo into workspace |
| Frontend/Backend deps & build | `npm ci`, `npm run build`, Python venv |
| Tests | Vitest + pytest |
| Build * Docker | Images `local/backend:BUILD_NUMBER` |
| Deploy | `docker compose up` — app on :8000 and :8082 |
| Health Check | `curl` health + frontend |

Open **fullstack-cicd** → click build number → **Console Output** to watch each step.

## 5. After a green build

- Backend: http://localhost:8000/health  
- Frontend: http://localhost:8082  

## Progressive Script Path

| Goal | Script Path |
|------|-------------|
| Build + deploy (no registry) | `jenkins/Jenkinsfile.phase-deploy-local` |
| Checkout + deps only | `jenkins/Jenkinsfile.phase5` |
| + tests | `jenkins/Jenkinsfile.phase7` / `phase8` |
| + Docker Hub push | `jenkins/Jenkinsfile.phase13` (credential `dockerhub`) |
| Full CD | `Jenkinsfile` |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 8080 in use | `docker stop jenkins` (old container) then compose up again |
| `checkout scm` fails | Push repo to GitHub; fix URL/credentials on job |
| `docker: not found` | Rebuild: `docker compose -f docker-compose.jenkins.yml build --no-cache` |
| Deploy port conflict on 8082 | Stop other stacks using 8082, or change `docker-compose.yml` |
