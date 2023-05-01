const AddThreadCommentUseCase = require('../AddThreadCommentUseCase');
const AddedThreadComment = require('../../../Domains/comments/entities/AddedThreadComment');
const NewThreadComment = require('../../../Domains/comments/entities/NewThreadComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddThreadCommentUseCase', () => {
  it('should orchestrating add thread comment correctly', async () => {
    const useCasePayload = {
      content: 'new content',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const addedThreadComment = new AddedThreadComment({
      id: 'comment-123',
      content: 'new content',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.checkThreadAvailability = jest.fn()
        .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addThreadComment = jest.fn()
        .mockImplementation(() => Promise.resolve(new AddedThreadComment({
          id: 'comment-123',
          content: useCasePayload.content,
          owner: 'user-123',
        })));

    const addThreadCommentUseCase = new AddThreadCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const addThreadComment = await addThreadCommentUseCase.execute(useCasePayload);

    expect(addThreadComment).toStrictEqual(addedThreadComment);
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addThreadComment).toBeCalledWith(new NewThreadComment({
      content: useCasePayload.content,
      threadId: useCasePayload.threadId,
      owner: useCasePayload.owner,
    }));
  });
});
