# ใช้ Node.js version LTS
FROM node:16

# ตั้ง working directory ใน container
WORKDIR /usr/src/app

# คัดลอก package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกโค้ดทั้งหมดไปยัง container
COPY . .

# เปิดพอร์ตสำหรับแอป backend
EXPOSE 8000

# คำสั่งรันแอปพลิเคชัน
CMD ["npm","run", "dev"]
