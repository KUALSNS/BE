FROM node:18.6.0


WORKDIR /app
 
COPY package.json /app/
COPY .env ./

RUN npm install

RUN npm install -g typescript
 
COPY ./ ./
CMD ["npm","run","dev"] 