# Intentional Pipeline Failures (Phases 6, 7, 8, 12)

Use these one at a time, run the pipeline, read the console log, then revert.

---

## Phase 6 — Test 1: Invalid npm command (Frontend Build FAIL)

In `jenkins/Jenkinsfile.phase5` or root `Jenkinsfile`, change Frontend Build:

```groovy
sh 'npm run buld'   // typo — should be build
```

**Expected:** Stage `Frontend Build` turns red. Later stages do not run.

**Why Jenkins stopped:** Declarative pipeline aborts on first failed `sh` (exit code ≠ 0).

**Debug:** Scroll to `npm ERR!` or `Missing script: "buld"` in console.

---

## Phase 6 — Test 2: Missing Python dependency (Backend Dependencies FAIL)

Temporarily edit `backend/requirements.txt` — remove `fastapi` or add fake package:

```
not-a-real-package==99.0.0
```

**Expected:** `pip install` fails → Backend Dependencies FAIL → pipeline stops.

---

## Phase 7 — Intentional failing pytest

In `backend/tests/test_health.py`:

```python
def test_health_returns_ok():
    assert False, "Intentional failure for learning"
```

**Expected:** Backend Test FAIL. pytest prints assertion in log.

---

## Phase 8 — Intentional failing Vitest

In `frontend/tests/App.test.jsx`:

```javascript
it('intentional fail', () => {
  expect(true).toBe(false);
});
```

**Expected:** Frontend Test FAIL. Vitest shows failed test name.

---

## Phase 12 — Docker build failures

### Wrong Dockerfile path

```groovy
sh 'docker build -f ./backend/Dockerfile.missing -t test ./backend'
```

### Wrong COPY in Dockerfile

```dockerfile
COPY does-not-exist.txt .
```

### Missing dependency in Dockerfile RUN

```dockerfile
RUN pip install nonexistent-package
```

**Debug:** Copy the exact `docker build` line from Jenkins log and run locally.
