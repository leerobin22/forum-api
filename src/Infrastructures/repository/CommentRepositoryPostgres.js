const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedThreadComment = require('../../Domains/comments/entities/AddedThreadComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThreadComment(payload) {
    const {content, threadId, owner} = payload;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDelete = false;

    const query = {
      text: 'INSERT INTO thread_comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, threadId, content, owner, date, isDelete],
    };

    const result = await this._pool.query(query);
    return new AddedThreadComment({...result.rows[0]});
  }

  async checkThreadCommentAvailability(id) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async checkThreadCommentOwner(payload) {
    const {commentId, owner} = payload;

    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    };
    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('tidak dapat mengakses data');
    };
  }

  async deleteThreadComment(id) {
    const query = {
      text: 'UPDATE thread_comments SET is_delete = true WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }

  async getThreadComment(id) {
    const query = {
      text: `SELECT thread_comments.id, thread_comments.content, thread_comments.date, users.username, thread_comments.is_delete
      FROM thread_comments
      LEFT JOIN users ON users.id = thread_comments.owner
      WHERE thread_comments.thread_id = $1
      ORDER BY thread_comments.date ASC`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    return result.rows;
  }

  async likeDislikeComment(payload) {
    const {commentId, owner} = payload;

    const checkLikedCommentQuery = {
      text: 'SELECT * from comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };
    const likedComment = await this._pool.query(checkLikedCommentQuery);

    if (!likedComment.rowCount) {
      const id = `likes-${this._idGenerator()}`;
      const date = new Date().toISOString();

      const addLikeCommentQuery = {
        text: 'INSERT INTO comment_likes VALUES($1, $2, $3, $4)',
        values: [id, commentId, owner, date],
      };

      return await this._pool.query(addLikeCommentQuery);
    } else {
      const deleteLikedCommentQuery = {
        text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2',
        values: [commentId, owner],
      };

      return await this._pool.query(deleteLikedCommentQuery);
    }
  }

  async getLikeCount(id) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rowCount;
  }
}

module.exports = CommentRepositoryPostgres;
