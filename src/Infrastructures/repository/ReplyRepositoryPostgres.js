const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedCommentReply = require('../../Domains/replies/entities/AddedCommentReply');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addCommentReply(payload) {
    const {content, commentId, owner} = payload;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDelete = false;

    const query = {
      text: 'INSERT INTO comment_replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, commentId, content, owner, date, isDelete],
    };

    const result = await this._pool.query(query);
    return new AddedCommentReply({...result.rows[0]});
  }

  async checkCommentReplyAvailability(id) {
    const query = {
      text: 'SELECT * FROM comment_replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async checkCommentReplyOwner(payload) {
    const {replyId, owner} = payload;

    const query = {
      text: 'SELECT * FROM comment_replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }
    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('tidak dapat mengakses data');
    }
  }

  async deleteCommentReply(id) {
    const query = {
      text: 'UPDATE comment_replies SET is_delete = true WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }

  async getCommentReplies(id) {
    const query = {
      text: `SELECT comment_replies.id, comment_replies.comment_id, comment_replies.content, comment_replies.date, users.username, comment_replies.is_delete
      FROM comment_replies
      LEFT JOIN users ON users.id = comment_replies.owner
      WHERE comment_replies.comment_id = $1
      ORDER BY comment_replies.date ASC`,
      values: [id],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
