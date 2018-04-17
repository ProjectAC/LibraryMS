const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const views = require('koa-views');
const co = require('co');
const convert = require('koa-convert');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');

const index = require('./routes/index');
const admin = require('./routes/admin');
const book = require('./routes/book');

const cors = require('koa-cors');
import session from "koa-session2";

// middlewares
app.use(cors());
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(convert(logger()));
app.use(convert(require('koa-static')(__dirname + '/public')));

app.use(session({
    key: "SESSIONID",   //default "koa:sess" 
}));
console.log('[INFO] Session ready.');

/*
app.use(views(__dirname + '/views', {
  extension: 'jade'
}));
*/

app.use(views(__dirname + '/views-ejs', {
  extension: 'ejs'
}));


// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

router.use('/', index.routes(), index.allowedMethods());
router.use('/admin', admin.routes(), admin.allowedMethods());
router.use('/book', book.routes(), book.allowedMethods());

app.use(router.routes(), router.allowedMethods());
// response

console.log('[INFO] Server ready.');

app.on('error', function(err, ctx){
  console.log(err)
  log.error('server error', err, ctx);
});

module.exports = app;