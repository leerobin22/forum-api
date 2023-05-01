const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class ThreadDetailUseCase {
  constructor({threadRepository, commentRepository, replyRepository}) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  };

  async execute(useCasePayload) {
    const {threadId} = new ThreadDetail(useCasePayload);

    await this._threadRepository.checkThreadAvailability(threadId);
    const thread = await this._threadRepository.getThreadDetail(threadId);
    const comment = await this._commentRepository.getThreadComment(threadId);
    const commentDetails = await this._formatComments(comment);
    const threadDetail = {
      ...thread,
      comments: commentDetails,
    };
    return {
      thread: threadDetail,
    };
  };

  async _formatComments(comments) {
    for (const comment of comments) {
      const commentReplies = [];
      const replies = await this._replyRepository.getCommentReplies(comment.id);

      if (replies.length > 0) {
        for (const reply of replies) {
          if (reply.is_delete) {
            reply.content = '**balasan telah dihapus**';
          };
          delete reply.is_delete;
          if (reply.comment_id && reply.comment_id === comment.id) {
            delete reply.comment_id;
            commentReplies.push(reply);
          }
        };
      };

      comment.replies = commentReplies;

      if (comment.is_delete) {
        comment.content = '**komentar telah dihapus**';
      };
      delete comment.is_delete;
    };
    return comments;
  };
};

module.exports = ThreadDetailUseCase;
