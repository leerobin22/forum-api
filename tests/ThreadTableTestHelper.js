/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadTableTestHelper = {
  async cleanTableThreads() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },

  async cleanTableThreadComments() {
    await pool.query('DELETE FROM thread_comments WHERE 1=1');
  },

  async cleanTableCommentReplies() {
    await pool.query('DELETE FROM comment_replies WHERE 1=1');
  },

  async addThread({id = 'thread-123', title, body, owner, date = new Date().toISOString()}) {
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, owner, date],
    };

    await pool.query(query);
  },

  async findThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },
  async findThreadCommentById(id) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1 AND is_delete = false',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },
  async addThreadComment({id = 'comment-123', threadId, content, owner, date = new Date().toISOString(), isDelete = false}) {
    const query = {
      text: 'INSERT INTO thread_comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, threadId, content, owner, date, isDelete],
    };

    await pool.query(query);
  },
  async findCommentReplyById(id) {
    const query = {
      text: 'SELECT * FROM comment_replies WHERE id = $1 AND is_delete = false',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },
  async addCommentReply({id = 'reply-123', commentId, content, owner, date = new Date().toISOString(), isDelete = false}) {
    const query = {
      text: 'INSERT INTO comment_replies VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, commentId, content, owner, date, isDelete],
    };

    await pool.query(query);
  },
};

module.exports = ThreadTableTestHelper;
