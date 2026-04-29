require('dotenv').config();
const { Pool } = require('pg');

const localPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DB_xin-viec',
  password: 'Luanha2003',
  port: 5432,
});

const neonPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_KjvaQ6bFt1sY@ep-patient-cloud-a4zbhou9-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('🔄 Đang đọc dữ liệu từ Local DB (DB_xin-viec)...');
    const localProjects = await localPool.query('SELECT * FROM projects');
    const localMessages = await localPool.query('SELECT * FROM messages');
    
    console.log(`📦 Tìm thấy ${localProjects.rows.length} dự án và ${localMessages.rows.length} tin nhắn.`);
    console.log('☁️ Đang chuyển dữ liệu lên máy chủ Neon...');

    // Xóa dữ liệu cũ trên Neon nếu có để tránh trùng lặp
    await neonPool.query('TRUNCATE TABLE projects RESTART IDENTITY CASCADE;');
    await neonPool.query('TRUNCATE TABLE messages RESTART IDENTITY CASCADE;');

    // Chuyển Projects
    for (const p of localProjects.rows) {
      await neonPool.query(
        `INSERT INTO projects (title, description, github_link, live_link, image_url, tech_stack, display_order, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [p.title, p.description, p.github_link, p.live_link, p.image_url, p.tech_stack, p.display_order, p.created_at]
      );
    }

    // Chuyển Messages
    for (const m of localMessages.rows) {
      await neonPool.query(
        `INSERT INTO messages (name, email, message, is_read, created_at) 
         VALUES ($1, $2, $3, $4, $5)`,
        [m.name, m.email, m.message, m.is_read, m.created_at]
      );
    }

    console.log('✅ Chuyển dữ liệu hoàn tất thành công!');
  } catch (error) {
    console.error('❌ Có lỗi xảy ra trong quá trình chuyển dữ liệu:', error);
  } finally {
    await localPool.end();
    await neonPool.end();
  }
}

migrate();
