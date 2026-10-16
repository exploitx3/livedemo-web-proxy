#!/bin/bash

#npm run config-env
#npm run bundle
# exec so node is PID 1 and receives SIGTERM / SIGUSR2 from Kubernetes
exec node ./src/server.js
