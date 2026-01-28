# build stage
# image node with name build
FROM node:22-alpine AS build
WORKDIR /app
# cache package if package 
COPY package*.json  ./
RUN npm install
COPY . .
RUN npm run build
RUN ls


# run stage
FROM nginx:alpine
COPY --from=build ./app/dist /usr/share/nginx/html/
COPY --from=build /app/nginx.conf /etc/nginx/config.d/default.conf
EXPOSE 80

CMD ["nginx","-g","daemon off;"]

