# Loop Scheduler (Salience Atlas v5)

## Overview
The `LoopScheduler` provides thread-safe task queueing, prioritization, dependency-aware pipelines, and simulated chron triggers in-memory.

## Priority Queuing
Tasks are assigned numerical weights (higher weights execute first). Dependency queues delay the execution of any downstream task until all designated parent tasks complete.
