const AddedThreadComment = require('../AddedThreadComment');

describe('AddedThreadComment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {};

    expect(() => new AddedThreadComment(payload)).toThrowError('ADDED_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: true,
      owner: {},
    };

    expect(() => new AddedThreadComment(payload)).toThrowError('ADDED_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedThreadComment object correctly', () => {
    const payload = {
      id: 'comment-123',
      content: 'new content',
      owner: 'user-123',
    };

    const newComment = new AddedThreadComment(payload);

    expect(newComment).toBeInstanceOf(AddedThreadComment);
    expect(newComment.id).toEqual(payload.id);
    expect(newComment.content).toEqual(payload.content);
    expect(newComment.owner).toEqual(payload.owner);
  });
});
