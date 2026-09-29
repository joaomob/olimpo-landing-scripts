# Olimpo landing scripts

Two scripts of the Olimpo landing page (https://olimpoap.webflow.io), a portfolio site built in Webflow. They are served
from here by jsDelivr at a fixed tag, so the page's HTML stays light, and the page loads them after its largest paint.

- `codex-reader`: the Codex reader, a tabbed panel that opens the glossary entries in the page.
- `app-scenes`: the product scenes that are still custom code (Oracle, Focus Mode, archetype band, Curfew clock).

`src/` has the readable code and `dist/` the minified files the page loads, each checked by an integrity hash.
Both are generated from the site's project; changes go there, then a new tag here.
