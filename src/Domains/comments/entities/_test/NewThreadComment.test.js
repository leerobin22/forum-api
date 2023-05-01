const NewThreadComment = require('../NewThreadComment');

describe('NewThreadComment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {};

    expect(() => new NewThreadComment(payload)).toThrowError('NEW_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: 123,
      threadId: true,
      owner: {},
    };

    expect(() => new NewThreadComment(payload)).toThrowError('NEW_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newthreadcomment object correctly', () => {
    const payload = {
      content: 'new_content',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const newThread = new NewThreadComment(payload);

    expect(newThread).toBeInstanceOf(NewThreadComment);
    expect(newThread.content).toEqual(payload.content);
    expect(newThread.threadId).toEqual(payload.threadId);
    expect(newThread.owner).toEqual(payload.owner);
  });
});
