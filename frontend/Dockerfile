# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /frontend


COPY package.json ./
COPY package-lock.json ./
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 5173
EXPOSE 22000
CMD ["npm", "run", "dev","--","--host"]
