# Government Connector Architecture

Status: `CONTRACT_ONLY`

PPRA, E-GPS, GavaConnect, KETRACO public procurement, and SAP Ariba adapters
must execute only against verified authorized interfaces. No endpoint, credential,
or authenticated scraping path is invented. Current providers return explicit
`NOT_CONFIGURED` or other failure states until authorized access exists.
