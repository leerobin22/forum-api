const pool = require('../../database/postgres/pool');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTableCommentReplies();
    await ThreadTableTestHelper.cleanTableThreadComments();
    await ThreadTableTestHelper.cleanTableThreads();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread', async () => {
      await UsersTableTestHelper.addUser({id: 'user-111', username: 'new_user'});

      const newThread = new NewThread({
        title: 'thread title',
        body: 'thread body',
        owner: 'user-111',
      });

      const fakeIdGeneratorIdGenerator = () => '321';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      const getThread = await ThreadTableTestHelper.findThreadById('thread-321');
      expect(getThread).toHaveLength(1);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-321',
        title: 'thread title',
        body: 'thread body',
        owner: 'user-111',
      }));
    });
  });

  describe('checkThreadAvailability function', () => {
    it('should throw notFoundError if thread does not exist', async () => {
      const fakeIdGeneratorIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      await expect(threadRepositoryPostgres.checkThreadAvailability('123'))
          .rejects.toThrowError(NotFoundError);
    });
    it('should not throw notFoundError if thread exist', async () => {
      await UsersTableTestHelper.addUser({id: 'user-212'});
      await ThreadTableTestHelper.addThread({
        title: 'new Title',
        body: 'new Body',
        owner: 'user-212',
      });

      const fakeIdGeneratorIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);
      await expect(threadRepositoryPostgres.checkThreadAvailability('thread-123'))
          .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadDetail function', () => {
    it('should throw notFoundError if thread does not exist', async () => {
      const fakeIdGeneratorIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      await expect(threadRepositoryPostgres.getThreadDetail('123'))
          .rejects.toThrowError(NotFoundError);
    });
    it('should return thread detail correctly', async () => {
      const newUser = {
        id: 'user-123',
        username: 'dicoding',
      };
      const newThread = {
        id: 'thread-123',
        title: 'new Title',
        body: 'new Body',
        owner: 'user-123',
        date: '2023-04-25 16.00',
      };

      await UsersTableTestHelper.addUser(newUser);
      await ThreadTableTestHelper.addThread(newThread);

      const fakeIdGeneratorIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      const threadDetail = await threadRepositoryPostgres.getThreadDetail('thread-123');

      expect(threadDetail.id).toStrictEqual(newThread.id);
      expect(threadDetail.title).toStrictEqual(newThread.title);
      expect(threadDetail.body).toStrictEqual(newThread.body);
      expect(threadDetail.username).toStrictEqual(newUser.username);
      expect(threadDetail.date).toStrictEqual(newThread.date);
    });
  });
});
