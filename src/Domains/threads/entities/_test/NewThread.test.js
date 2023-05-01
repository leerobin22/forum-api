const NewThread = require('../NewThread');

describe('NewThread entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      title: 'new_title',
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 123,
      body: true,
      owner: {},
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newthread object correctly', () => {
    const payload = {
      title: 'new_title',
      body: 'long_body',
      owner: 'user-123',
    };

    const newThread = new NewThread(payload);

    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
    expect(newThread.owner).toEqual(payload.owner);
  });
});
