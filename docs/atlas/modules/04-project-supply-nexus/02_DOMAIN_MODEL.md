# Domain Model

Migration 005 establishes `project_supply_requirement` with project,
work-package, product, quantity, unit, required-by, delivery location,
criticality, procurement, supplier, contract, purchase-order and milestone
link fields. Existing logistics tables remain authoritative for stock and
order evidence. Project, supplier, contract, shipment, warehouse and asset
identity is not duplicated.

Unimplemented entities are documented as future contracts rather than inferred
from UI fixtures.
