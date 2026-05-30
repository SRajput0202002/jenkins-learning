# Custom Jenkins image with Node, Python 3.12, and Docker CLI for pipeline stages
FROM jenkins/jenkins:lts

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Docker CLI + daemon package (CLI is separate on Debian Trixie). Socket mounted at runtime.
RUN apt-get update && apt-get install -y --no-install-recommends \
    docker.io \
    docker-cli \
    && rm -rf /var/lib/apt/lists/* \
    && usermod -aG docker jenkins

ARG COMPOSE_VERSION=2.32.4
RUN ARCH=$(uname -m) && \
    case "$ARCH" in \
      x86_64) COMPOSE_ARCH=x86_64 ;; \
      aarch64|arm64) COMPOSE_ARCH=aarch64 ;; \
      *) echo "unsupported arch: $ARCH" && exit 1 ;; \
    esac && \
    mkdir -p /usr/local/lib/docker/cli-plugins && \
    curl -fsSL "https://github.com/docker/compose/releases/download/v${COMPOSE_VERSION}/docker-compose-linux-${COMPOSE_ARCH}" \
      -o /usr/local/lib/docker/cli-plugins/docker-compose && \
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

USER jenkins
