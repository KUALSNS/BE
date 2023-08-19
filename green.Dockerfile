FROM node:18.6.0 as green

WORKDIR /app
 
COPY package.json /app/
COPY package-lock.json /app/
COPY .env ./

RUN npm install
 
COPY ./ ./

EXPOSE 3001

CMD ["npm","run","dev"]