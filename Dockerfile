FROM node:18.6.0


WORKDIR /app
 
COPY package.json /app/
COPY package-lock.json /app/
COPY .env ./

RUN npm install

RUN npm install -g typescript
RUN npm install pm2 -g
 
COPY ./ ./
CMD ["pm2-runtime", "npm", "run", "dev"]
#CMD ["npm","run","dev"]