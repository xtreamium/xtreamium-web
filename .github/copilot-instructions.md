This application is for streaming IPTV from your subscription to a local proxy application which will launch mpv or VLC to play the stream.

We use shadcn for components.

bun should be used as the package manager for the project. It is used to manage dependencies and run scripts. The `bun install` command should be used to install dependencies, and `bun run` should be used to run scripts. This is only for local development, for running tests and github actions, npm should be used as the package manager.

We have a backend API server written in python (fastapi) which the frontend communicates with. There is also a local proxy application which runs in user space on the user's machine. The proxy application is written in ASP.Net

All component should use snake-case for filenames and CamelCase for component names.

This app uses local-ssl-proxy so we can run it on https, the cert is letsencrypt and the local url will be https://streams.dev.fergl.ie:3000/
