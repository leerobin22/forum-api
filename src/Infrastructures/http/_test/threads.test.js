const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTableThreads();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and successfuly create new threads', async () => {
      const requestPayload = {
        title: 'new thread title',
        body: 'new thread body',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });
    it('should response 401 if accessed without token', async () => {
      const requestPayload = {
        title: 'new thread title',
        body: 'new thread body',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });
    it('should response 400 if missing payload', async () => {
      const requestPayload = {
        title: 'new thread title',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread harus mengirimkan title dan body');
    });
    it('should response 400 if payload does not meet correct data type', async () => {
      const requestPayload = {
        title: true,
        body: 123,
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread title dan body harus string');
    });
  });
  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and successfuly create new thread comment', async () => {
      const requestPayload = {
        content: 'new thread content',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: requestPayload,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content);
    });
    it('should response 401 if accessed without token', async () => {
      const requestPayload = {
        content: 'new thread content',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });
    it('should response 400 if missing payload', async () => {
      const requestPayload = {};

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: requestPayload,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment harus mengirimkan content');
    });
    it('should response 400 if payload does not meet correct data type', async () => {
      const requestPayload = {
        content: 123,
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: requestPayload,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment content harus string');
    });
    it('should response 404 if threadId not found', async () => {
      const requestPayload = {
        content: 'new content',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-0000/comments`,
        payload: requestPayload,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and comment is deleted successfully', async () => {
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const threadComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: 'new thread content',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadCommentResponse = JSON.parse(threadComment.payload);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${threadCommentResponse.data.addedComment.id}`,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and thread detail is return correctly', async () => {
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const comments = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: 'new thread content',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const commentResponse = JSON.parse(comments.payload);

      await server.inject({
        method: 'PUT',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/like`,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadResponse.data.addedThread.id}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.id).toEqual(threadResponse.data.addedThread.id);
    });
    it('should response 404 if thread not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/123',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and successfuly create new reply', async () => {
      const requestPayload = {
        content: 'new reply content',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: 'new thread content',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const commentResponse = JSON.parse(comment.payload);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/replies`,
        payload: requestPayload,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply.content).toEqual(requestPayload.content);
    });
    it('should response 401 if accessed without token', async () => {
      const requestPayload = {
        content: 'new thread content',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: 'new thread content',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const commentResponse = JSON.parse(comment.payload);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/replies`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });
    it('should response 400 if missing payload', async () => {
      const requestPayload = {};

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: 'new thread content',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const commentResponse = JSON.parse(comment.payload);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/replies`,
        payload: requestPayload,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply harus mengirimkan content');
    });
    it('should response 400 if payload does not meet correct data type', async () => {
      const requestPayload = {
        content: 123,
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: 'new thread content',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const commentResponse = JSON.parse(comment.payload);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/replies`,
        payload: requestPayload,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply content harus string');
    });
    it('should response 404 if threadId not found', async () => {
      const requestPayload = {
        content: 'new content',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: 'new thread content',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const commentResponse = JSON.parse(comment.payload);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/123/comments/${commentResponse.data.addedComment.id}/replies`,
        payload: requestPayload,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
    it('should response 404 if commentId not found', async () => {
      const requestPayload = {
        content: 'new content',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/123/replies`,
        payload: requestPayload,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });
  });
  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and comment is deleted successfully', async () => {
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const threadComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: 'new thread content',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadCommentResponse = JSON.parse(threadComment.payload);

      const reply = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${threadCommentResponse.data.addedComment.id}/replies`,
        payload: {
          content: 'new reply',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const replyResponse = JSON.parse(reply.payload);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${threadCommentResponse.data.addedComment.id}/replies/${replyResponse.data.addedReply.id}`,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
  describe('When PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should return 200 and like comment successfully', async () => {
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const threadComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: 'new thread content',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadCommentResponse = JSON.parse(threadComment.payload);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${threadCommentResponse.data.addedComment.id}/likes`,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
    it('should return 200 and dislike comment successfully', async () => {
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'dicoding indonesia',
        },
      });

      const login = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponse = JSON.parse(login.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title',
          body: 'new body',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadResponse = JSON.parse(thread.payload);

      const threadComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: 'new thread content',
        },
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const threadCommentResponse = JSON.parse(threadComment.payload);

      await server.inject({
        method: 'PUT',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${threadCommentResponse.data.addedComment.id}/likes`,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${threadCommentResponse.data.addedComment.id}/likes`,
        headers: {Authorization: `Bearer ${loginResponse.data.accessToken}`},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
