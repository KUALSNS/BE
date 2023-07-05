FROM node:18.6.0 as blue


WORKDIR /app
 
COPY package.json /app/
COPY package-lock.json /app/
COPY .env ./

RUN npm install

RUN npm install -g typescript
RUN npm install pm2 -g
 
COPY ./ ./

EXPOSE 3000


CMD ["npm","run","dev"]



FROM node:18.6.0 as green


WORKDIR /app
 
COPY package.json /app/
COPY package-lock.json /app/
COPY .env ./

RUN npm install

RUN npm install -g typescript
RUN npm install pm2 -g
 
COPY ./ ./

EXPOSE 3001

CMD ["npm","run","dev"]


