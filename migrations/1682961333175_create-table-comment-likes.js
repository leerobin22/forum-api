/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    date: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('comment_likes', 'fk_comment_likes.owner', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('comment_likes', 'fk_comment_likes.comment_id', 'FOREIGN KEY(comment_id) REFERENCES thread_comments(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('comment_likes', 'fk_comment_likes.owner');
  pgm.dropConstraint('comment_likes', 'fk_comment_likes.comment_id');
  pgm.dropTable('comment_likes');
};
