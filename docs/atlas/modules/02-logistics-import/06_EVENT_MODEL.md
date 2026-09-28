# Event Model

`logistics_event` is the current dependency/event source. Shipment detail
already exposes entity events, and the events route provides the operational
timeline. Source freshness is derived from persisted `updated_at` timestamps;
no timer-generated UI event is treated as an operational event.
