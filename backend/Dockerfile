# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Függőségek telepítése
COPY package*.json ./
RUN npm install

# Kód másolása
COPY . .

# Port megnyitása (az Expressed valószínűleg az 5000-en fut)
EXPOSE 5000

# Indítás (a dev módot a compose fileban állíthatjuk majd, ez az alap)
CMD ["npm", "start"]