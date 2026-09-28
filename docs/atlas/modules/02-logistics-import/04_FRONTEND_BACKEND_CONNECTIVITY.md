# Frontend/Backend Connectivity

`LogisticsView` and `CommandCenter` consume live logistics routes. The
Command Center now requests `/api/logistics/data-quality` and displays a
truthful LIVE/REVIEW indicator. A missing or stale source never becomes a
successful-looking live feed.
