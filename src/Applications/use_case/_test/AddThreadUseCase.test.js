const AddThreadUseCase = require('../AddThreadUseCase');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddThreadUseCase', () => {
  it('should orchestrating add thread action correctly', async () => {
    const useCasePayload = {
      title: 'thread_title',
      body: 'thread_body',
      owner: 'user-987',
    };

    const addedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest.fn()
        .mockImplementation(() => Promise.resolve(new AddedThread({
          id: 'thread-123',
          title: useCasePayload.title,
          owner: useCasePayload.owner,
        })));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const addThread = await addThreadUseCase.execute(useCasePayload);

    expect(addThread).toStrictEqual(addedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(new NewThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    }));
  });
});
