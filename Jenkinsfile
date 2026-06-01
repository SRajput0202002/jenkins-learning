// =============================================================================
// PHASE 17 — Final Production Jenkins Pipeline (Declarative)
// =============================================================================
// Job setup: Pipeline from SCM → GitHub → Script Path: Jenkinsfile
// Credentials: Jenkins ID "dockerhub" (Username with password / token)
// Job env (optional): DOCKERHUB_USER = your Docker Hub username
// =============================================================================

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        // BUILD_NUMBER: unique per build — use for image tags (traceability)
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        DOCKERHUB_USER = "${env.DOCKERHUB_USER ?: 'your-dockerhub-username'}"
        VITE_API_URL = 'http://localhost:8000'
        APP_HOST = 'host.docker.internal'
    }

    stages {
        // --- Checkout ---------------------------------------------------------
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // --- Workspace Inspection ---------------------------------------------
        stage('Workspace Inspection') {
            steps {
                sh 'pwd'
                sh 'ls -la'
                sh 'ls -la frontend backend jenkins || true'
            }
        }

        // --- Tool versions ----------------------------------------------------
        stage('Python Version') {
            steps {
                sh 'python3 --version'
            }
        }

        stage('Node Version') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }

        // --- Dependencies -----------------------------------------------------
        stage('Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Backend Dependencies') {
            steps {
                dir('backend') {
                    sh '''
                        python3 -m venv .venv
                        . .venv/bin/activate
                        pip install --upgrade pip
                        pip install -r requirements.txt
                    '''
                }
            }
        }

        // --- Build ------------------------------------------------------------
        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Backend Build Validation') {
            steps {
                dir('backend') {
                    sh '''
                        . .venv/bin/activate
                        python -m compileall -q .
                        pip check || true
                    '''
                }
            }
        }

        // --- Tests ------------------------------------------------------------
        stage('Frontend Test') {
            steps {
                dir('frontend') {
                    sh 'npm test -- --run'
                }
            }
        }

        stage('Backend Test') {
            steps {
                dir('backend') {
                    sh '. .venv/bin/activate && pytest -v'
                }
            }
        }

        // --- Docker build (tag = BUILD_NUMBER) --------------------------------
        stage('Build Backend Docker') {
            steps {
                sh "docker build -t ${DOCKERHUB_USER}/backend:${IMAGE_TAG} ./backend"
            }
        }

        stage('Build Frontend Docker') {
            steps {
                sh """
                    docker build \\
                      --build-arg VITE_API_URL=${VITE_API_URL} \\
                      -t ${DOCKERHUB_USER}/frontend:${IMAGE_TAG} \\
                      ./frontend
                """
            }
        }

        // --- Docker Hub push (never hardcode passwords) -----------------------
        stage('Docker Push Backend') {
            steps {
                dockerPushBackend()
            }
        }

        stage('Docker Push Frontend') {
            steps {
                dockerPushFrontend()
            }
        }

        // --- Deploy -----------------------------------------------------------
        stage('Deploy') {
            steps {
                sh '''
                    export IMAGE_TAG=${IMAGE_TAG}
                    export DOCKERHUB_USER=${DOCKERHUB_USER}
                    export VITE_API_URL=${VITE_API_URL}
                    docker compose -f docker-compose.yml down || true
                    docker compose -f docker-compose.yml up -d --build
                '''
            }
        }

        // --- Health Check -----------------------------------------------------
        stage('Health Check') {
            steps {
                sh '''
                    echo "Waiting for services..."
                    sleep 8
                    BACKEND="${APP_HOST:-host.docker.internal}"
                    curl -sf "http://${BACKEND}:8000/health" | grep -q ok
                    curl -sf -o /dev/null -w "%{http_code}" "http://${BACKEND}:8082" | grep -q 200
                    echo "Health checks passed"
                '''
            }
        }
    }

    // --- Post actions (Phase 16) ----------------------------------------------
    post {
        success {
            echo "Pipeline succeeded. Images: ${DOCKERHUB_USER}/backend:${IMAGE_TAG} and frontend:${IMAGE_TAG}"
        }
        failure {
            echo 'Pipeline FAILED — open Console Output, find first red stage, read last error lines.'
        }
        always {
            sh 'docker logout 2>/dev/null || true'
            echo "Build ${env.BUILD_NUMBER} finished with status: ${currentBuild.currentResult}"
        }
    }
}

// Helper steps keep push logic DRY and credentials in one place
def dockerPushBackend() {
    withCredentials([usernamePassword(
        credentialsId: 'dockerhub',
        usernameVariable: 'DH_USER',
        passwordVariable: 'DH_PASS'
    )]) {
        sh '''
            set +x
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            set -x
            docker push ${DOCKERHUB_USER}/backend:${IMAGE_TAG}
            docker tag ${DOCKERHUB_USER}/backend:${IMAGE_TAG} ${DOCKERHUB_USER}/backend:latest
            docker push ${DOCKERHUB_USER}/backend:latest
        '''
    }
}

def dockerPushFrontend() {
    withCredentials([usernamePassword(
        credentialsId: 'dockerhub',
        usernameVariable: 'DH_USER',
        passwordVariable: 'DH_PASS'
    )]) {
        sh '''
            set +x
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            set -x
            docker push ${DOCKERHUB_USER}/frontend:${IMAGE_TAG}
            docker tag ${DOCKERHUB_USER}/frontend:${IMAGE_TAG} ${DOCKERHUB_USER}/frontend:latest
            docker push ${DOCKERHUB_USER}/frontend:latest
        '''
    }
}
