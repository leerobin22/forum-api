const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeDislikeCommentUseCase = require('../LikeDislikeCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('LikeDislikeCommentUseCase', () => {
  it('should thow error if use case payload does not contain threadId and commentId', async () => {
    const useCasePayload = {};
    const likeDislikeCommentUseCase = new LikeDislikeCommentUseCase({});

    await expect(likeDislikeCommentUseCase.execute(useCasePayload))
        .rejects.toThrowError('LIKE_DISLIKE_COMMENT_USE_CASE.NOT_CONTAIN_REQUIRED_ATTRIBUTES');
  });
  it('should thow error if use case payload does not contain required attributes types', async () => {
    const useCasePayload = {
      threadId: 123,
      commentId: true,
      owner: {},
    };
    const likeDislikeCommentUseCase = new LikeDislikeCommentUseCase({});

    await expect(likeDislikeCommentUseCase.execute(useCasePayload))
        .rejects.toThrowError('LIKE_DISLIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
  it('should orchestrating like dislike comment action correctly', async () => {
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
    mockCommentRepository.likeDislikeComment = jest.fn()
        .mockImplementation(() => Promise.resolve());

    const likeDislikeCommentUseCase = new LikeDislikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await likeDislikeCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.checkThreadAvailability)
        .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkThreadCommentAvailability)
        .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockCommentRepository.likeDislikeComment)
        .toHaveBeenCalledWith(useCasePayload);
  });
});
