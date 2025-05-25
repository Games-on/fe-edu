# 🚨 Quick Fix for EduSports Frontend

## 📋 Bạn đang gặp lỗi compile? Hãy làm theo các bước sau:

### 🔧 **Fix ngay lập tức:**

1. **Mở Command Prompt hoặc PowerShell**
2. **Copy và paste từng dòng command sau:**

```bash
# Bước 1: Vào thư mục dự án
cd "C:\Users\ACER\Desktop\fe\fe-edu"

# Bước 2: Cài các dependency bị thiếu
npm install date-fns react-hook-form

# Bước 3: Tạo file environment
echo REACT_APP_API_URL=http://localhost:8080 > .env.local

# Bước 4: Clear cache và restart
npm start
```

### 🚀 **Hoặc chạy script tự động:**

1. Double-click file `quick-fix.bat` trong thư mục frontend
2. Đợi script chạy xong
3. Frontend sẽ tự động start

### 🔍 **Nếu vẫn có lỗi:**

**Lỗi import React:**
```bash
npm install react@18.2.0 react-dom@18.2.0
```

**Lỗi lucide-react:**
```bash
npm install lucide-react@latest
```

**Lỗi tailwind:**
```bash
npm install tailwindcss@latest autoprefixer@latest postcss@latest
```

**Lỗi react-query:**
```bash
npm install react-query@latest
```

### 📱 **Test kết nối Backend:**

Đảm bảo backend đang chạy:
1. Mở tab mới: `http://localhost:8080/api/tournaments`
2. Nếu thấy JSON response → Backend OK
3. Nếu không → Start backend trước

### 🎯 **Sau khi fix xong:**

1. Frontend chạy tại: `http://localhost:3000`
2. Test login/register
3. Test tạo tournament
4. Check browser console for errors

### 📞 **Nếu vẫn không được:**

1. Delete `node_modules` và `package-lock.json`
2. Run `npm install` lại
3. Check Node.js version (cần >= 14.0.0)

```bash
# Check Node version
node --version

# Nếu < 14.0.0, update Node.js
```

---

**✅ Sau khi fix:** Frontend sẽ load không có lỗi và kết nối được với backend!
