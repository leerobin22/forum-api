class DeleteThreadCommentUseCase {
  constructor({threadRepository, commentRepository}) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    await this._threadRepository.checkThreadAvailability(useCasePayload.threadId);
    await this._commentRepository.checkThreadCommentAvailability(useCasePayload.commentId);
    await this._commentRepository.checkThreadCommentOwner(useCasePayload);
    await this._commentRepository.deleteThreadComment(useCasePayload.commentId);
  }

  _validatePayload(payload) {
    const {threadId, commentId, owner} = payload;
    if (!threadId || !commentId || !owner) {
      throw new Error('DELETE_THREAD_COMMENT_USE_CASE.NOT_CONTAIN_REQUIRED_ATTRIBUTES');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof owner !== 'string') {
      throw new Error('DELETE_THREAD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteThreadCommentUseCase;
