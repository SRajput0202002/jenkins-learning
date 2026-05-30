# FastAPI + React + Jenkins CI/CD Learning Project

Production-style fullstack app for learning **Jenkins Pipelines**, **Docker**, **Docker Hub**, and **CI/CD** by building, breaking, and fixing each stage.

## Project structure

```
fastapi-react-jenkins-demo/
├── frontend/          React + Vite
├── backend/           FastAPI + pytest
├── jenkins/           Progressive Jenkinsfiles + custom Jenkins image
├── Jenkinsfile        Final production pipeline (Phase 17)
├── docker-compose.yml App deploy (backend :8000, frontend :8082)
└── docker-compose.jenkins.yml   Jenkins UI on :8080 (see docs/JENKINS-8080-SETUP.md)
```

## Quick start

### Phase 2 — Backend locally

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Verify:

- http://localhost:8000/health → `{"status":"ok"}`
- http://localhost:8000/api/message → JSON message

### Phase 3 — Frontend locally

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173 — you should see the backend JSON on the page.

### Phase 4 — GitHub

```bash
cd ~/Documents/fastapi-react-jenkins-demo
git init
git add .
git commit -m "Initial fullstack Jenkins learning project"
git branch -M main
git remote add origin git@github.com:YOUR_USER/fastapi-react-jenkins-demo.git
git push -u origin main
```

Create the empty repo `fastapi-react-jenkins-demo` on GitHub first.

---

## Jenkins setup (Docker)

```bash
docker compose -f docker-compose.jenkins.yml up -d --build
```

- Jenkins UI: http://localhost:8080
- Get initial admin password: `docker exec jenkins-learning cat /var/jenkins_home/secrets/initialAdminPassword`

### Jenkins job

1. New Item → **Pipeline** → name: `fullstack-cicd`
2. **Pipeline** → Definition: *Pipeline script from SCM*
3. Git: your repo URL, branch `main`
4. Script Path: start with `jenkins/Jenkinsfile.phase5`, later switch to `Jenkinsfile`
5. **Environment** (optional): `DOCKERHUB_USER` = your Docker Hub username

### Credentials (Phase 13)

Manage Jenkins → Credentials → Global → Add:

| Field | Value |
|-------|--------|
| Kind | Username with password |
| ID | `dockerhub` |
| Username | Docker Hub username |
| Password | Access token or password |

Never commit secrets. Pipeline uses `withCredentials`.

---

## Progressive pipelines

| Phase | File | What you learn |
|-------|------|----------------|
| 5 | `jenkins/Jenkinsfile.phase5` | Checkout, workspace, deps, build |
| 6 | `jenkins/Jenkinsfile.failure-snippets.md` | Intentional failures |
| 7 | `jenkins/Jenkinsfile.phase7` | pytest |
| 8 | `jenkins/Jenkinsfile.phase8` | Vitest |
| 11 | `jenkins/Jenkinsfile.phase11` | `BUILD_NUMBER` Docker tags |
| 12 | failure snippets | Docker build debug |
| 13 | `jenkins/Jenkinsfile.phase13` | Docker Hub push |
| 17 | `Jenkinsfile` | Full CD: test → build → push → deploy → health |

---

## Docker (Phases 9–10)

### Backend

```bash
docker build -t backend:local ./backend
docker run --rm -p 8000:8000 backend:local
curl http://localhost:8000/health
```

### Frontend

```bash
docker build -t frontend:local --build-arg VITE_API_URL=http://localhost:8000 ./frontend
docker run --rm -p 8080:80 frontend:local
```

### Compose deploy

```bash
export DOCKERHUB_USER=local
export IMAGE_TAG=dev
docker compose up -d --build
```

- Backend: http://localhost:8000/health
- Frontend: http://localhost:8082

---

## Tests

```bash
# Backend
cd backend && source .venv/bin/activate && pytest -v

# Frontend
cd frontend && npm test -- --run
```

---

## Phase 18 — What Jenkins does internally

After every build, ask:

| Question | Answer pattern |
|----------|----------------|
| Workspace | `$JENKINS_HOME/workspace/<job>/<build>` — fresh checkout from SCM |
| Downloaded files | Whatever is in Git at that commit SHA |
| Commands | Each `sh '...'` runs in a shell on the **agent** (here: Jenkins container) |
| Success | Every step exit code `0` |
| Failure | First non-zero exit → stage red → pipeline stops (unless `catchError`) |
| Real companies | Cached deps, parallel tests, ephemeral agents, K8s/ECS deploy, signed images |

Use [docs/learning-log-template.md](docs/learning-log-template.md) to record each build.

---

## BUILD_NUMBER and image tags

- `env.BUILD_NUMBER` — Jenkins assigns 1, 2, 3… per job
- Images: `youruser/backend:42`, `youruser/frontend:42`
- Also tag `latest` after push for convenience (not for reproducible rollbacks)

---

## Post actions (Phase 16)

| Block | When |
|-------|------|
| `success` | All stages green |
| `failure` | Any stage failed |
| `always` | Every build end |

See `post { }` in root [Jenkinsfile](Jenkinsfile).

---

## Health checks (Phase 15)

Pipeline curls:

- `http://localhost:8000/health` — backend liveness
- `http://localhost:8082` — frontend HTTP 200

Fails deploy validation if services are down — prevents “green” builds with broken production.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Frontend can’t reach API | Check `VITE_API_URL` in `.env` (dev) or Docker build-arg (prod) |
| Jenkins can’t run `docker` | Mount `/var/run/docker.sock`, use `user: root` in compose |
| Push fails | Credential ID must be exactly `dockerhub` |
| Port 8080 in use | `docker stop jenkins` (old container), then `docker compose -f docker-compose.jenkins.yml up -d` |

---

## License

MIT — for learning and experimentation.
