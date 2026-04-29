require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const createTables = async () => {
  try {
    // Bảng Projects
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        tech_stack VARCHAR(255)[] DEFAULT '{}',
        github_link VARCHAR(255),
        live_link VARCHAR(255),
        image_url VARCHAR(255),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Bảng Messages (Hòm thư)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("✅ Khởi tạo bảng thành công!");
    
    // Thêm dữ liệu mẫu nếu bảng rỗng
    const { rows } = await pool.query('SELECT COUNT(*) FROM projects');
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO projects (title, description, tech_stack, github_link, image_url, display_order)
        VALUES 
        ('Movie App UI', 'Ứng dụng xem phim sử dụng React và TMDB API', ARRAY['React', 'TMDB'], 'https://github.com/Luanha2003', '', 1),
        ('Admin Dashboard', 'Trang quản trị với biểu đồ', ARRAY['Node.js', 'Charts'], 'https://github.com/Luanha2003', '', 2),
        ('E-commerce', 'Trang thương mại điện tử', ARRAY['NestJS', 'MongoDB'], 'https://github.com/Luanha2003', '', 3)
      `);
      console.log("✅ Đã thêm dữ liệu projects mẫu!");
    }
  } catch (error) {
    console.error("❌ Lỗi khi tạo bảng:", error);
  } finally {
    pool.end();
  }
};

createTables();
