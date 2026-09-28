# Entity Resolution

The existing `EntityResolutionEngine` remains additive and review-oriented. It detects shared directors, shared addresses, and duplicate supplier PINs and emits relationship evidence rather than merging records. Duplicate candidates are represented as `POTENTIAL_DUPLICATE` edges with confidence and must be reviewed before canonical consolidation.
