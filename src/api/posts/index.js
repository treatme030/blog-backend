const Router = require('koa-router');
const postsCtrl = require('./posts.ctrl');

const posts = new Router;

posts.get('/', postsCtrl)
posts.post('/', postsCtrl)
posts.get('/:id', postsCtrl)
posts.delete('/:id', postsCtrl)
posts.put('/:id', postsCtrl)
posts.patch('/:id', postsCtrl)

module.exports = posts;