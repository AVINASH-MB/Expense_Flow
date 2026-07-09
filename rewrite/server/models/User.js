const { pool } = require("../config/db");

module.exports = {
  async byEmail(email) {
    const [r] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
    return r[0] || null;
  },
  async byId(id) {
    const [r] = await pool.query("SELECT * FROM users WHERE id=?", [id]);
    return r[0] || null;
  },
  async create({ id, name, email, password_hash, role = "user" }) {
    await pool.query(
      "INSERT INTO users (id,name,email,password_hash,role) VALUES (?,?,?,?,?)",
      [id, name, email, password_hash, role],
    );
  },
  async update(id, patch) {
    const cols = ["name", "email", "avatar_url", "role", "status", "password_hash",
      "reset_token", "reset_expires"];
    const sets = []; const vals = [];
    for (const c of cols) if (c in patch) { sets.push(`${c}=?`); vals.push(patch[c]); }
    if (!sets.length) return;
    vals.push(id);
    await pool.query(`UPDATE users SET ${sets.join(",")} WHERE id=?`, vals);
  },
  async remove(id) { await pool.query("DELETE FROM users WHERE id=?", [id]); },
  async all() {
    const [r] = await pool.query(`
      SELECT u.id,u.name,u.email,u.role,u.status,u.created_at AS joined,
        COALESCE((SELECT SUM(amount) FROM transactions t WHERE t.user_id=u.id AND t.type='expense'),0) AS spend
      FROM users u ORDER BY u.created_at DESC`);
    return r;
  },
};
