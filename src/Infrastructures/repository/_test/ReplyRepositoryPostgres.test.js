const pool = require('../../database/postgres/pool');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

const NewCommentReply = require('../../../Domains/replies/entities/NewCommentReply');
const AddedCommentReply = require('../../../Domains/replies/entities/AddedCommentReply');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTableCommentReplies();
    await ThreadTableTestHelper.cleanTableThreadComments();
    await ThreadTableTestHelper.cleanTableThreads();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addCommentReply function', () => {
    it('should persist add reply', async () => {
      await UsersTableTestHelper.addUser({id: 'user-111', username: 'new_user'});
      await ThreadTableTestHelper.addThread({id: 'thread-123', title: 'new Title', body: 'new Body', owner: 'user-111'});
      await ThreadTableTestHelper.addThreadComment({id: 'comment-123', threadId: 'thread-123', content: 'new comment', owner: 'user-111'});
      const newCommentReply = new NewCommentReply({
        content: 'new reply',
        threadId: 'thread-123',
        commentId: 'comment-123',
        owner: 'user-111',
      });

      const fakeIdGeneratorIdGenerator = () => '321';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      const addedCommentReply = await replyRepositoryPostgres.addCommentReply(newCommentReply);

      const getCommentReply = await ThreadTableTestHelper.findCommentReplyById('reply-321');
      expect(getCommentReply).toHaveLength(1);
      expect(addedCommentReply).toStrictEqual(new AddedCommentReply({
        id: 'reply-321',
        content: 'new reply',
        owner: 'user-111',
      }));
    });
  });

  describe('checkCommentReplyAvailability function', () => {
    it('should throw notFoundError if reply does not exist', async () => {
      const fakeIdGeneratorIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      await expect(replyRepositoryPostgres.checkCommentReplyAvailability('123'))
          .rejects.toThrowError(NotFoundError);
    });
    it('should not throw notFoundError if reply exist', async () => {
      await UsersTableTestHelper.addUser({id: 'user-212'});
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'new Title',
        body: 'new Body',
        owner: 'user-212',
      });
      await ThreadTableTestHelper.addThreadComment({
        threadId: 'thread-123',
        content: 'new content',
        owner: 'user-212',
      });
      await ThreadTableTestHelper.addCommentReply({
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'new reply',
        owner: 'user-212',
      });

      const fakeIdGeneratorIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);
      await expect(replyRepositoryPostgres.checkCommentReplyAvailability('reply-123'))
          .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('checkCommentReplyOwner function', () => {
    it('should throw NotFoundError if reply is not found', async () => {
      await UsersTableTestHelper.addUser({id: 'user-212'});
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'new Title',
        body: 'new Body',
        owner: 'user-212',
      });
      await ThreadTableTestHelper.addThreadComment({
        threadId: 'thread-123',
        content: 'new content',
        owner: 'user-212',
      });
      await ThreadTableTestHelper.addCommentReply({
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'new reply',
        owner: 'user-212',
      });

      const fakeIdGeneratorIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      await expect(replyRepositoryPostgres.checkCommentReplyOwner({replyId: '123', owner: '123'}))
          .rejects.toThrowError(NotFoundError);
    });
    it('should throw AuthorizationError if accessed by invalid owner', async () => {
      await UsersTableTestHelper.addUser({id: 'user-212'});
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'new Title',
        body: 'new Body',
        owner: 'user-212',
      });
      await ThreadTableTestHelper.addThreadComment({
        threadId: 'thread-123',
        content: 'new content',
        owner: 'user-212',
      });
      await ThreadTableTestHelper.addCommentReply({
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'new reply',
        owner: 'user-212',
      });

      const fakeIdGeneratorIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      await expect(replyRepositoryPostgres.checkCommentReplyOwner({replyId: 'reply-123', owner: '123'}))
          .rejects.toThrowError(AuthorizationError);
    });
    it('should not throw AuthorizationError if accessed by valid owner', async () => {
      await UsersTableTestHelper.addUser({id: 'user-212'});
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'new Title',
        body: 'new Body',
        owner: 'user-212',
      });
      await ThreadTableTestHelper.addThreadComment({
        threadId: 'thread-123',
        content: 'new content',
        owner: 'user-212',
      });
      await ThreadTableTestHelper.addCommentReply({
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'new reply',
        owner: 'user-212',
      });

      const fakeIdGeneratorIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);
      await expect(replyRepositoryPostgres.checkCommentReplyOwner({replyId: 'reply-123', owner: 'user-212'}))
          .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteCommentReply function', () => {
    it('should delete reply correctly', async () => {
      await UsersTableTestHelper.addUser({id: 'user-212'});
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'new Title',
        body: 'new Body',
        owner: 'user-212',
      });
      await ThreadTableTestHelper.addThreadComment({
        threadId: 'thread-123',
        content: 'new content',
        owner: 'user-212',
      });
      await ThreadTableTestHelper.addCommentReply({
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'new reply',
        owner: 'user-212',
      });

      const fakeIdGeneratorIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);
      await replyRepositoryPostgres.deleteCommentReply('reply-123');

      const comment = await ThreadTableTestHelper.findCommentReplyById('reply-123');
      expect(comment).toHaveLength(0);
    });
  });

  describe('getCommentReply function', () => {
    it('should return thread comment reply correctly', async () => {
      const newUser = {
        id: 'user-123',
        username: 'dicoding',
      };
      const newThread = {
        id: 'thread-123',
        title: 'new Title',
        body: 'new Body',
        owner: 'user-123',
      };
      const newComment = {
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'new content',
        owner: 'user-123',
      };
      const newReply = {
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'new reply',
        owner: 'user-123',
        date: '2023-04-25 16.15',
        isDelete: false,
      };

      await UsersTableTestHelper.addUser(newUser);
      await ThreadTableTestHelper.addThread(newThread);
      await ThreadTableTestHelper.addThreadComment(newComment);
      await ThreadTableTestHelper.addCommentReply(newReply);

      const fakeIdGeneratorIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      const replies = await replyRepositoryPostgres.getCommentReplies('comment-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toStrictEqual(newReply.id);
      expect(replies[0].content).toStrictEqual(newReply.content);
      expect(replies[0].date).toStrictEqual(newReply.date);
      expect(replies[0].username).toStrictEqual(newUser.username);
      expect(replies[0].is_delete).toStrictEqual(newReply.isDelete);
    });
  });
});
