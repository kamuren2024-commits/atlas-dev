# Graph Model

The shared graph supports supplier relationships including `BIDS_ON`,
`AWARDED`, `DIRECTOR_OF`, `DELIVERS_FOR`, and related evidence edges. Supplier
intelligence returns the bounded one-hop neighborhood for a supplier; it does
not load the entire graph or convert inference into fact.
