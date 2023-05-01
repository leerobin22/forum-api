const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentReply = require('../DeleteCommentReplyUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('DeleteCommentReplyUseCase', () => {
  it('should thow error if use case payload does not needed attributes', async () => {
    const useCasePayload = {};
    const deleteCommentReply = new DeleteCommentReply({});

    await expect(deleteCommentReply.execute(useCasePayload))
        .rejects.toThrowError('DELETE_COMMENT_REPLY_USE_CASE.NOT_CONTAIN_REQUIRED_ATTRIBUTES');
  });
  it('should thow error if use case payload does not contain required attributes', async () => {
    const useCasePayload = {
      threadId: 123,
      commentId: true,
      replyId: [],
      owner: {},
    };
    const deleteCommentReply = new DeleteCommentReply({});

    await expect(deleteCommentReply.execute(useCasePayload))
        .rejects.toThrowError('DELETE_COMMENT_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
  it('should orchestrating delete reply action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkThreadAvailability = jest.fn()
        .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkThreadCommentAvailability = jest.fn()
        .mockImplementation(() => Promise.resolve());
    mockReplyRepository.checkCommentReplyAvailability = jest.fn()
        .mockImplementation(() => Promise.resolve());
    mockReplyRepository.checkCommentReplyOwner = jest.fn()
        .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteCommentReply = jest.fn()
        .mockImplementation(() => Promise.resolve());

    const deleteCommentReply = new DeleteCommentReply({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await deleteCommentReply.execute(useCasePayload);

    expect(mockThreadRepository.checkThreadAvailability)
        .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkThreadCommentAvailability)
        .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.checkCommentReplyAvailability)
        .toHaveBeenCalledWith(useCasePayload.replyId);
    expect(mockReplyRepository.checkCommentReplyOwner)
        .toHaveBeenCalledWith(useCasePayload);
    expect(mockReplyRepository.deleteCommentReply)
        .toHaveBeenCalledWith(useCasePayload.replyId);
  });
});
