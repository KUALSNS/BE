FROM node:18.6.0 as blue

WORKDIR /app
 
COPY package.json /app/
COPY package-lock.json /app/
COPY .env ./

RUN npm install

 
COPY ./ ./

EXPOSE 3000


CMD ["npm","run","dev"]






