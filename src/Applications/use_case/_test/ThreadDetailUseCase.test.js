const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadDetailUseCase = require('../ThreadDetailUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('ThreadDetailUseCase', () => {
  it('should get return thread detail correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const expectedThread = {
      id: 'thread-123',
      title: 'new title',
      body: 'new body',
      date: '2023-04-23 15.00',
      username: 'dicoding',
    };

    const expectedComment = [{
      id: 'comment-123',
      content: 'new content',
      username: 'dicoding',
      date: '2023-04-23 17.00',
      is_delete: true,
    },
    {
      id: 'comment-222',
      content: 'new content 2',
      username: 'john',
      date: '2023-04-23 17.10',
      is_delete: false,
    },
    ];

    const expectedReplies = [{
      id: 'reply-123',
      comment_id: 'comment-123',
      content: 'new reply',
      username: 'john',
      date: '2023-04-24 10.00',
      is_delete: false,
    },
    {
      id: 'reply-897',
      comment_id: 'comment-123',
      content: 'new reply 2',
      username: 'dicoding',
      date: '2023-04-24 11.00',
      is_delete: true,
    }];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkThreadAvailability = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadDetail = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getThreadComment = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedComment));
    mockReplyRepository.getCommentReplies = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedReplies));

    const threadDetailUseCase = new ThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const threadDetail = await threadDetailUseCase.execute(useCasePayload);
    expect(mockThreadRepository.getThreadDetail)
        .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getThreadComment)
        .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getCommentReplies)
        .toHaveBeenCalledWith(expectedComment[0].id);
    expect(mockReplyRepository.getCommentReplies)
        .toHaveBeenCalledWith(expectedComment[1].id);
    expect(threadDetail).toStrictEqual({
      thread: {
        id: 'thread-123',
        title: 'new title',
        body: 'new body',
        date: '2023-04-23 15.00',
        username: 'dicoding',
        comments: [{
          id: 'comment-123',
          content: '**komentar telah dihapus**',
          username: 'dicoding',
          date: '2023-04-23 17.00',
          replies: [{
            id: 'reply-123',
            content: 'new reply',
            username: 'john',
            date: '2023-04-24 10.00',
          },
          {
            id: 'reply-897',
            content: '**balasan telah dihapus**',
            username: 'dicoding',
            date: '2023-04-24 11.00',
          }],
        },
        {
          id: 'comment-222',
          content: 'new content 2',
          username: 'john',
          date: '2023-04-23 17.10',
          replies: [],
        }],
      },
    });
  });
});
