const ThreadCommentDetail = require('../ThreadCommentDetail');

describe('ThreadCommentDetail entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {};

    expect(() => new ThreadCommentDetail(payload)).toThrowError('THREAD_COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      threadId: true,
    };

    expect(() => new ThreadCommentDetail(payload)).toThrowError('THREAD_COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ThreadDetail object correctly', () => {
    const payload = {
      threadId: 'comment-123',
    };

    const commentDetail = new ThreadCommentDetail(payload);
    expect(commentDetail.threadId).toEqual(payload.threadId);
  });
});
