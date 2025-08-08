const pool = require("../database");

async function insertMessage(account_id, subject, message) {
  const sql = `
    INSERT INTO contact_messages (account_id, subject, message)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [account_id, subject, message];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

async function getMessages() {
  const sql = `
    SELECT cm.*, a.account_firstname, a.account_lastname
    FROM contact_messages cm
    JOIN account a ON cm.account_id = a.account_id
    ORDER BY cm.created_at DESC;
  `;
  const result = await pool.query(sql);
  return result.rows;
}

module.exports = { insertMessage, getMessages };