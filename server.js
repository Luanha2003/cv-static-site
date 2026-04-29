require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL successfully!'))
  .catch(err => console.error('❌ Database Connection Error:', err.stack));

// Cấu hình Multer để lưu ảnh upload vào img/projects
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'img', 'projects');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'proj-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ==========================================
// API - PROJECTS 
// ==========================================

// Lấy danh sách dự án
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY display_order ASC, created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm dự án mới (có upload ảnh)
app.post('/api/projects', upload.single('image'), async (req, res) => {
  const { title, description, github_link, live_link, tech_stack } = req.body;
  const image_url = req.file ? `/img/projects/${req.file.filename}` : '';
  
  // tech_stack truyền lên dưới dạng chuỗi cách nhau bằng dấu phẩy
  const techArray = tech_stack ? tech_stack.split(',').map(t => t.trim()) : [];

  try {
    const result = await pool.query(
      `INSERT INTO projects (title, description, github_link, live_link, tech_stack, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, github_link, live_link, techArray, image_url]
    );
    res.json({ success: true, project: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa dự án
app.delete('/api/projects/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// API - MESSAGES
// ==========================================

app.post('/api/messages', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Vui lòng điền đủ thông tin!' });
  }
  try {
    await pool.query(
      'INSERT INTO messages (name, email, message) VALUES ($1, $2, $3)',
      [name, email, message]
    );
    res.json({ success: true, message: 'Đã gửi tin nhắn thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/messages/:id/read', async (req, res) => {
  try {
    await pool.query('UPDATE messages SET is_read = true WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
