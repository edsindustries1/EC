# Mock dispatch trip log as its own Railway service (stands in for everywheretrans.com during testing).
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server/dispatch ./server/dispatch
COPY dev/mock-dispatch ./dev/mock-dispatch
ENV MOCK_DISPATCH_PORT=4100
EXPOSE 4100
CMD ["node", "dev/mock-dispatch/server.js"]
