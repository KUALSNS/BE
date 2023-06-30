FROM node:18.6.0

WORKDIR /app
 
COPY package.json /app/
COPY package-lock.json /app/
COPY .env ./

RUN npm install

RUN npm install -g typescript
RUN npm install pm2 -g
 
COPY ./ ./

CMD ["npm","run","dev"]

RUN npm run build

FROM nginx:latest

COPY --from=build /app/build /usr/share/nginx/html
# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]