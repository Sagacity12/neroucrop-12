FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Create log directory
RUN mkdir -p /app/logs

# Set volume for logs
VOLUME ["/app/logs"]

EXPOSE 3000

CMD ["npm", "start"] 