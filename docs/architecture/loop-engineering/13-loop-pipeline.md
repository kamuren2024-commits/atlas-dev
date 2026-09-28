# Loop Pipeline (Salience Atlas v5)

## Overview
The `LoopPipeline` defines modular, replaceable stages corresponding to states in the APOS kernel:
1. **Observation**: Read context cues.
2. **Planning**: Formulate execution strategy.
3. **Execution**: Apply changes, call APIs.
4. **Validation**: Test integrity constraints.
5. **Reflection**: Learn from execution metadata.
6. **Completion**: Commit transaction outputs.

Middlewares run at com-posable intercepts around each stage and pipeline boundaries.
