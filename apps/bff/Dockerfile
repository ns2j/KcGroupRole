FROM node:20-alpine

WORKDIR /workspace

# Copy shared packages and the sub-app's codebase to maintain correct relative routing
COPY apps/packages ./apps/packages
COPY apps/bff ./apps/bff

WORKDIR /workspace/apps/bff

RUN npm install

# Build TS files into 'dist' folder
RUN npm run build

EXPOSE 8020

CMD ["npm", "start"]
