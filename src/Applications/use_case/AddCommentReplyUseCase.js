const NewCommentReply = require('../../Domains/replies/entities/NewCommentReply');

class AddCommentReplyUseCase {
  constructor({threadRepository, commentRepository, replyRepository}) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const newCommentReply = new NewCommentReply(useCasePayload);
    await this._threadRepository.checkThreadAvailability(newCommentReply.threadId);
    await this._commentRepository.checkThreadCommentAvailability(newCommentReply.commentId);
    return this._replyRepository.addCommentReply(newCommentReply);
  }
}

module.exports = AddCommentReplyUseCase;
