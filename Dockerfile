FROM node:18-alpine

# Tạo thư mục app trong container
WORKDIR /app

# Copy file package trước để cache dependencies
COPY package.json yarn.lock ./

# Cài dependencies
RUN yarn install

# Copy toàn bộ code
COPY . .

# Build TypeScript sang JS
RUN yarn build

# Expose cổng server
EXPOSE 3000

# Start app (chạy file đã build trong dist)
CMD ["yarn", "start"]
