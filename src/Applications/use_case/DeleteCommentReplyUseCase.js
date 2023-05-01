class DeleteCommentReplyUseCase {
  constructor({threadRepository, commentRepository, replyRepository}) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    await this._threadRepository.checkThreadAvailability(useCasePayload.threadId);
    await this._commentRepository.checkThreadCommentAvailability(useCasePayload.commentId);
    await this._replyRepository.checkCommentReplyAvailability(useCasePayload.replyId);
    await this._replyRepository.checkCommentReplyOwner(useCasePayload);
    await this._replyRepository.deleteCommentReply(useCasePayload.replyId);
  }

  _validatePayload(payload) {
    const {threadId, commentId, replyId, owner} = payload;
    if (!threadId || !commentId || !replyId || !owner) {
      throw new Error('DELETE_COMMENT_REPLY_USE_CASE.NOT_CONTAIN_REQUIRED_ATTRIBUTES');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof replyId !== 'string' || typeof owner !== 'string') {
      throw new Error('DELETE_COMMENT_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteCommentReplyUseCase;
