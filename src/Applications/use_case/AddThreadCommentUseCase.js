const NewThreadComment = require('../../Domains/comments/entities/NewThreadComment');

class AddThreadCommentUseCase {
  constructor({threadRepository, commentRepository}) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const newThreadComment = new NewThreadComment(useCasePayload);
    await this._threadRepository.checkThreadAvailability(newThreadComment.threadId);

    return this._commentRepository.addThreadComment(newThreadComment);
  }
};

module.exports = AddThreadCommentUseCase;
