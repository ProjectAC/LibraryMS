var router = require('koa-router')()
import {sql} from '../lib/sql'
import * as response from '../lib/response'

// Administrator Login 
router.post('/login', async function (ctx, next) {

  let info = ctx.request.body

  if (info['ano'] == null || info['password'] == null)
  {
    ctx.response.body = response.error(response.INFO_INCOMPLETE);
    return
  }
  
  let res = (await sql('\
    select *\
    from admin\
    where ano = ?\
    and password = md5(?);\
  ', [
    info['ano'],
    info['password']
  ])) [0]

  if (res == null)
  {
    ctx.response.body = response.error(response.AUTH_FAILED);
    return
  }
  ctx.response.body = ctx.session['admin'] = {
    ano: res['ano'],
    name: res['name'],
    contact: res['contact']
  }
})

router.post('/', async function (ctx,next) {
  if (ctx.session['admin'])
    ctx.response.body = ctx.session['admin']
  else
    ctx.response.body = response.error(response.NOT_LOGGED_IN)
})

// Administrator Logout
router.post('/logout', async function (ctx, next) {
  
  if (ctx.session['admin'])
  {
    ctx.session['admin'] = null;
    ctx.response.body = response.error(response.OK)
  }
  else
    ctx.response.body = response.error(response.NOT_LOGGED_IN)
})

module.exports = router
