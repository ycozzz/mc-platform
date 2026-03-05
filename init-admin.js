const Database = require('better-sqlite3');
const crypto = require('crypto');
const db = new Database('./mc.db');

// Add role and permissions columns
db.exec(`
  -- Add role to users table
  ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'moderator'));
  
  -- Create sessions table for auth
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
`);

// Create default admin user
const adminPassword = crypto.createHash('sha256').update('admin123').digest('hex');
try {
  db.prepare(`
    INSERT INTO users (username, email, password_hash, display_name, role)
    VALUES ('admin', 'admin@mcplatform.com', ?, 'Administrator', 'admin')
  `).run(adminPassword);
  console.log('✅ Admin user created (username: admin, password: admin123)');
} catch (e) {
  console.log('ℹ️  Admin user already exists');
}

console.log('✅ Admin system initialized');
db.close();
