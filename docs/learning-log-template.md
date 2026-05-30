# CI/CD Learning Log

Fill one row after each Jenkins build (Phase 18).

| Build # | Branch | Failed stage? | Root cause | Fix | What Jenkins did internally |
|---------|--------|---------------|------------|-----|------------------------------|
| 1 | main | no | — | — | Checked out repo to workspace, ran npm/pytest |
| 2 | main | Frontend Build | `npm run buld` typo | Fixed script name | Stopped pipeline; later stages skipped |
| | | | | | |

## Reflection prompts

1. What was `$WORKSPACE` path for this build?
2. Which files existed after Checkout?
3. Which command had the first non-zero exit code?
4. What would a production team do differently? (caching, parallel tests, K8s deploy, etc.)
