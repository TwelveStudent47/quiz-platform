# client/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# A React alapértelmezett portja
EXPOSE 3000

CMD ["npm", "start"]