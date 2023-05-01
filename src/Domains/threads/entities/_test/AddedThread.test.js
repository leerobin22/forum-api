const AddedThread = require('../AddedThread');

describe('AddedThread entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      title: 'new_title',
    };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: '123',
      title: 123,
      owner: {},
    };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newthread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'new_title',
      owner: 'user-123',
    };

    const addedThread = new AddedThread(payload);

    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
