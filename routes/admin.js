var router = require('koa-router')()
import {sql} from '../lib/sql'
import * as response from '../lib/response'

// Administrator Login 
router.post('/', async function (ctx, next) {

  let info = ctx.request.body

  if (info['ano'] === undefined || info['password'] === undefined)
  {
    ctx.response.body = response.error(response.INFO_INCOMPLETE);
    return
  }
  
  let res = (await sql('\
    select *\
    from admin\
    where ano = ?\
    and password = md5(?)\
  ', [
    info['ano'],
    info['password']
  ])) [0]

  if (res === undefined)
  {
    ctx.response.body = response.error(response.AUTH_FAILED);
    return
  }
  ctx.response.body = ctx.session = res
})

module.exports = router
