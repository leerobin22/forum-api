const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteThreadCommentUseCase = require('../DeleteThreadCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('DeleteThreadCommentUseCase', () => {
  it('should thow error if use case payload does not contain threadId and commentId', async () => {
    const useCasePayload = {};
    const deleteThreadComentUseCase = new DeleteThreadCommentUseCase({});

    await expect(deleteThreadComentUseCase.execute(useCasePayload))
        .rejects.toThrowError('DELETE_THREAD_COMMENT_USE_CASE.NOT_CONTAIN_REQUIRED_ATTRIBUTES');
  });
  it('should thow error if use case payload does not contain required attributes', async () => {
    const useCasePayload = {
      threadId: 123,
      commentId: true,
      owner: {},
    };
    const deleteThreadComentUseCase = new DeleteThreadCommentUseCase({});

    await expect(deleteThreadComentUseCase.execute(useCasePayload))
        .rejects.toThrowError('DELETE_THREAD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
  it('should orchestrating delete thread comment action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.checkThreadAvailability = jest.fn()
        .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkThreadCommentAvailability = jest.fn()
        .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkThreadCommentOwner = jest.fn()
        .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteThreadComment = jest.fn()
        .mockImplementation(() => Promise.resolve());

    const deleteThreadComentUseCase = new DeleteThreadCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await deleteThreadComentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.checkThreadAvailability)
        .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkThreadCommentAvailability)
        .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockCommentRepository.checkThreadCommentOwner)
        .toHaveBeenCalledWith(useCasePayload);
    expect(mockCommentRepository.deleteThreadComment)
        .toHaveBeenCalledWith(useCasePayload.commentId);
  });
});
