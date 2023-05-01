const AddCommentReplyUseCase = require('../AddCommentReplyUseCase');
const AddedCommentReply = require('../../../Domains/replies/entities/AddedCommentReply');
const NewCommentReply = require('../../../Domains/replies/entities/NewCommentReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('AddThreadCommentUseCase', () => {
  it('should orchestrating add reply correctly', async () => {
    const useCasePayload = {
      content: 'new reply',
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const addedCommentReply = new AddedCommentReply({
      id: 'reply-123',
      content: 'new reply',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkThreadAvailability = jest.fn()
        .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkThreadCommentAvailability = jest.fn()
        .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addCommentReply = jest.fn()
        .mockImplementation(() => Promise.resolve(new AddedCommentReply({
          id: 'reply-123',
          content: useCasePayload.content,
          owner: useCasePayload.owner,
        })));

    const addCommentReplyUseCase = new AddCommentReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const addCommentReply = await addCommentReplyUseCase.execute(useCasePayload);

    expect(addCommentReply).toStrictEqual(addedCommentReply);
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkThreadCommentAvailability).toBeCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.addCommentReply).toBeCalledWith(new NewCommentReply({
      content: useCasePayload.content,
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    }));
  });
});
