# Data Model

SQLite migration `004-logistics-domain` provides orders, order items, products,
stock, facilities, vehicles, drivers, routes and events. The schema has no
validated customs declaration, port call, carrier milestone or import-document
tables; those are P1/P0 design dependencies, not inferred fields.
