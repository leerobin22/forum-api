const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const AddThreadCommentUseCase = require('../../../../Applications/use_case/AddThreadCommentUseCase');
const DeleteThreadCommentUseCase = require('../../../../Applications/use_case/DeleteThreadCommentUseCase');
const ThreadDetailUseCase = require('../../../../Applications/use_case/ThreadDetailUseCase');
const AddCommentReplyUseCase = require('../../../../Applications/use_case/AddCommentReplyUseCase');
const DeleteCommentReplyUseCase = require('../../../../Applications/use_case/DeleteCommentReplyUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postThreadCommentHandler = this.postThreadCommentHandler.bind(this);
    this.deleteThreadCommentHandler = this.deleteThreadCommentHandler.bind(this);
    this.getThreadDetailHandler = this.getThreadDetailHandler.bind(this);
    this.postCommentReplyHandler = this.postCommentReplyHandler.bind(this);
    this.deleteCommentReplyHandler = this.deleteCommentReplyHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const owner = request.auth.credentials.id;
    const useCasePayload = {
      title: request.payload.title,
      body: request.payload.body,
      owner,
    };
    const addedThread = await addThreadUseCase.execute(useCasePayload);
    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  };
  async postThreadCommentHandler(request, h) {
    const addThreadCommentUseCase = this._container.getInstance(AddThreadCommentUseCase.name);
    const owner = request.auth.credentials.id;
    const threadId = request.params.threadId;
    const useCasePayload = {
      content: request.payload.content,
      threadId,
      owner,
    };

    const addedComment = await addThreadCommentUseCase.execute(useCasePayload);
    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  };
  async deleteThreadCommentHandler(request, h) {
    const deleteThreadCommentUseCase = this._container.getInstance(DeleteThreadCommentUseCase.name);
    const owner = request.auth.credentials.id;
    const useCasePayload = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      owner,
    };

    await deleteThreadCommentUseCase.execute(useCasePayload);
    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  };
  async getThreadDetailHandler(request, h) {
    const threadDetailUseCase = this._container.getInstance(ThreadDetailUseCase.name);
    const useCasePayload = {
      threadId: request.params.threadId,
    };
    const {thread} = await threadDetailUseCase.execute(useCasePayload);
    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });
    return response;
  };
  async postCommentReplyHandler(request, h) {
    const addCommentReplyUseCase = this._container.getInstance(AddCommentReplyUseCase.name);
    const owner = request.auth.credentials.id;
    const threadId = request.params.threadId;
    const commentId = request.params.commentId;
    const useCasePayload = {
      content: request.payload.content,
      threadId,
      commentId,
      owner,
    };

    const addedReply = await addCommentReplyUseCase.execute(useCasePayload);
    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  };
  async deleteCommentReplyHandler(request, h) {
    const deleteCommentReplyUseCase = this._container.getInstance(DeleteCommentReplyUseCase.name);
    const owner = request.auth.credentials.id;
    const useCasePayload = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      replyId: request.params.replyId,
      owner,
    };

    await deleteCommentReplyUseCase.execute(useCasePayload);
    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  };
}

module.exports = ThreadsHandler;
