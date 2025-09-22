This application is for streaming IPTV from your subscription to a local proxy application which will launch mpv or VLC to play the stream.

We use shadcn for components.

bun should be used as the package manager for the project. It is used to manage dependencies and run scripts. The `bun install` command should be used to install dependencies, and `bun run` should be used to run scripts. This applies to both local development and CI/CD deployments.

We have a backend API server written in python (fastapi) which the frontend communicates with. There is also a local proxy application which runs in user space on the user's machine. The proxy application is written in ASP.Net

All component should use snake-case for filenames and CamelCase for component names.

All our API calls should be run using axios.

This app uses local-ssl-proxy so we can run it on https, the cert is letsencrypt and the local url will be https://streams.dev.fergl.ie:3000/

Keep comments in the code to a minimum, only add comments where absolutely necessary.

All components in src/components/ui should never be edited as these are shadcn components. If you need to modify a component, create a new component in src/components with the modifications you need but only do this as an absolute last resort and ask me first .