FROM node:20-alpine

WORKDIR /app

# Build-time variables — Railway passes these in automatically via --build-arg
# for any service variable matching the ARG name. Required for any VITE_ prefix
# env var to be baked into the Vite bundle at build time.
ARG VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "server/index.js"]
