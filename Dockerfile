# Build a node-based static site
FROM node:22 AS build
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn --frozen-lockfile
# `.dockerignore` is important to cache this copy properly
COPY . /app/
RUN yarn test run
RUN yarn build && mv -f build dist
RUN BASE_PATH=/math yarn build && mkdir -p dist && mv -f build dist/math

# Run the static site we just built. No Caddyfile or other config, just static files.
# "The default config file simply serves files from /usr/share/caddy" - https://hub.docker.com/_/caddy
FROM caddy:2.8
COPY --from=build /app/dist/ /usr/share/caddy