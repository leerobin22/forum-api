class NewCommentReply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.content = payload.content;
    this.threadId = payload.threadId;
    this.commentId = payload.commentId;
    this.owner = payload.owner;
  }

  _verifyPayload(payload) {
    const {content, threadId, commentId, owner} = payload;

    if (!content || !threadId || !owner || !commentId) {
      throw new Error('NEW_COMMENT_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof threadId !== 'string' || typeof owner !== 'string' || typeof commentId !== 'string') {
      throw new Error('NEW_COMMENT_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewCommentReply;
