const pool = require('../../database/postgres/pool');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

const NewThreadComment = require('../../../Domains/comments/entities/NewThreadComment');
const AddedThreadComment = require('../../../Domains/comments/entities/AddedThreadComment');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTableCommentReplies();
    await ThreadTableTestHelper.cleanTableThreadComments();
    await ThreadTableTestHelper.cleanTableThreads();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThreadComment function', () => {
    it('should persist add thread comment', async () => {
      await UsersTableTestHelper.addUser({id: 'user-111', username: 'new_user'});
      await ThreadTableTestHelper.addThread({id: 'thread-123', title: 'new Title', body: 'new Body', owner: 'user-111'});

      const newThreadComment = new NewThreadComment({
        content: 'new comment',
        threadId: 'thread-123',
        owner: 'user-111',
      });

      const fakeIdGeneratorIdGenerator = () => '321';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      const addedThreadComment = await commentRepositoryPostgres.addThreadComment(newThreadComment);

      const getThreadComment = await ThreadTableTestHelper.findThreadCommentById('comment-321');
      expect(getThreadComment).toHaveLength(1);
      expect(addedThreadComment).toStrictEqual(new AddedThreadComment({
        id: 'comment-321',
        content: 'new comment',
        owner: 'user-111',
      }));
    });
  });

  describe('checkThreadCommentAvailability function', () => {
    it('should throw notFoundError if thread does not exist', async () => {
      const fakeIdGeneratorIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      await expect(commentRepositoryPostgres.checkThreadCommentAvailability('123'))
          .rejects.toThrowError(NotFoundError);
    });
    it('should not throw notFoundError if thread exist', async () => {
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

      const fakeIdGeneratorIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);
      await expect(commentRepositoryPostgres.checkThreadCommentAvailability('comment-123'))
          .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('checkThreadCommentOwner function', () => {
    it('should throw NotFoundError if comment is not found', async () => {
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

      const fakeIdGeneratorIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      await expect(commentRepositoryPostgres.checkThreadCommentOwner({commentId: '123', owner: '123'}))
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

      const fakeIdGeneratorIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      await expect(commentRepositoryPostgres.checkThreadCommentOwner({commentId: 'comment-123', owner: '123'}))
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

      const fakeIdGeneratorIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);
      await expect(commentRepositoryPostgres.checkThreadCommentOwner({commentId: 'comment-123', owner: 'user-212'}))
          .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteThreadComment function', () => {
    it('should delete thread comment correctly', async () => {
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

      const fakeIdGeneratorIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);
      await commentRepositoryPostgres.deleteThreadComment('comment-123');

      const comment = await ThreadTableTestHelper.findThreadCommentById('comment-123');
      expect(comment).toHaveLength(0);
    });
  });

  describe('getThreadComment function', () => {
    it('should throw notFoundError if comment does not exist', async () => {
      const fakeIdGeneratorIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      await expect(commentRepositoryPostgres.getThreadComment('123'))
          .rejects.toThrowError(NotFoundError);
    });
    it('should return thread comments correctly', async () => {
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
        date: '2023-04-25 16.00',
        isDelete: false,
      };

      await UsersTableTestHelper.addUser(newUser);
      await ThreadTableTestHelper.addThread(newThread);
      await ThreadTableTestHelper.addThreadComment(newComment);

      const fakeIdGeneratorIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      const comment = await commentRepositoryPostgres.getThreadComment('thread-123');
      expect(comment).toHaveLength(1);
      expect(comment[0].id).toStrictEqual(newComment.id);
      expect(comment[0].content).toStrictEqual(newComment.content);
      expect(comment[0].date).toStrictEqual(newComment.date);
      expect(comment[0].username).toStrictEqual(newUser.username);
      expect(comment[0].is_delete).toStrictEqual(newComment.isDelete);
    });
  });

  describe('likeDislikeComment function', () => {
    it('should like comment successfully', async () => {
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
        date: '2023-04-25 16.00',
        isDelete: false,
      };

      await UsersTableTestHelper.addUser(newUser);
      await ThreadTableTestHelper.addThread(newThread);
      await ThreadTableTestHelper.addThreadComment(newComment);

      const payload = {
        commentId: 'comment-123',
        owner: 'user-123',
      };

      const fakeIdGeneratorIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      await commentRepositoryPostgres.likeDislikeComment(payload);
      const likedComment = await ThreadTableTestHelper.getCommentLike(payload);

      expect(likedComment).toHaveLength(1);
      expect(likedComment[0].comment_id).toStrictEqual(payload.commentId);
      expect(likedComment[0].owner).toStrictEqual(payload.owner);
    });
    it('should dislike comment successfully', async () => {
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
        date: '2023-04-25 16.00',
        isDelete: false,
      };

      await UsersTableTestHelper.addUser(newUser);
      await ThreadTableTestHelper.addThread(newThread);
      await ThreadTableTestHelper.addThreadComment(newComment);

      const payload = {
        id: 'likes-123',
        commentId: 'comment-123',
        owner: 'user-123',
        date: '2023-05-02 20.00',
      };

      await ThreadTableTestHelper.addCommentLike(payload);

      const fakeIdGeneratorIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      await commentRepositoryPostgres.likeDislikeComment(payload);
      const likedComment = await ThreadTableTestHelper.getCommentLike(payload);

      expect(likedComment).toHaveLength(0);
    });
  });
  describe('getLikeCount function', () => {
    it('should get comment like count successfully', async () => {
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
        date: '2023-04-25 16.00',
        isDelete: false,
      };

      await UsersTableTestHelper.addUser(newUser);
      await ThreadTableTestHelper.addThread(newThread);
      await ThreadTableTestHelper.addThreadComment(newComment);

      const payload = {
        id: 'likes-123',
        commentId: 'comment-123',
        owner: 'user-123',
        date: '2023-05-02 20.00',
      };

      await ThreadTableTestHelper.addCommentLike(payload);

      const fakeIdGeneratorIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGeneratorIdGenerator);

      const likeCount = await commentRepositoryPostgres.getlikeCount('comment-123');

      expect(likeCount).toStrictEqual(1);
    });
  });
});
