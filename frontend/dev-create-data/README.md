# Static data & demos

This folder is served as static files by Nginx (see `deploy/nginx/my_homepage.conf`).

## Homepage profile

- Personal info used by the homepage is stored in `frontend/profile.json`.
- The homepage reads it from `/profile.json`.

## Demos

- `dev-create-data/apps/player/`: A tiny HTML audio player demo.
- `dev-create-data/apps/player/index.html`: A simple launcher page (choose which demo to open).
- `dev-create-data/apps/game/`: A tiny HTML mini-game demo.
