const NewCommentReply = require('../NewCommentReply');

describe('NewCommentReply entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {};

    expect(() => new NewCommentReply(payload)).toThrowError('NEW_COMMENT_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: 123,
      threadId: true,
      commentId: [],
      owner: {},
    };

    expect(() => new NewCommentReply(payload)).toThrowError('NEW_COMMENT_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newCommentReply object correctly', () => {
    const payload = {
      content: 'new_content',
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const newCommentReply = new NewCommentReply(payload);

    expect(newCommentReply).toBeInstanceOf(NewCommentReply);
    expect(newCommentReply.content).toEqual(payload.content);
    expect(newCommentReply.threadId).toEqual(payload.threadId);
    expect(newCommentReply.commentId).toEqual(payload.commentId);
    expect(newCommentReply.owner).toEqual(payload.owner);
  });
});
