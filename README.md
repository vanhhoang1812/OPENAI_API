# OPENAI_API


## 🛠️ Cài đặt

### 1. Clone Repository

```
git clone https://github.com/vanhhoang1812/ChatBot_RAG.git
cd ChatBot_RAG
```

### 2. Cài đặt môi trường backend
```
cd backend
python -m venv venv
source venv/bin/activate  # Nếu dùng Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Thiết lập biến môi trường
Tạo file .env trong thư mục backend/ với nội dung như sau:

``` .env
OPENAI_API_KEY=your_openai_api_key_here
```
🔑 Hãy thay your_openai_api_key_here bằng khóa API thật của bạn từ OpenAI.

### 4. Chạy backend
```
flask run
```
Mặc định backend sẽ chạy ở http://127.0.0.1:5000.


## 💻 Frontend
Mở file frontend/index.html bằng trình duyệt hoặc dùng server nội bộ như Live Server để xem giao diện.

### 🔧 Thay đổi đường dẫn API (nếu cần)
Để trỏ frontend đến domain/server khác, hãy chỉnh sửa dòng sau trong frontend/js/script.js:

```js
const response = await fetch('http://127.0.0.1:5000/chat', {
```
👉 Thay đổi thành domain bạn mong muốn, ví dụ:

```js
const response = await fetch('https://your-domain.com/chat', {
```
📂 Cấu trúc thư mục
```
ChatBot_RAG/
├── backend/
│   ├── static/
│   ├── openai_client.py
│   ├── run.py
│   ├── .env
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── img/
│   ├── css/
│   └── js/
└── README.md
```


## 📬 Liên hệ
Tác giả: @vanhhoang1812

Email: vietanhhoang102@gmail.com
