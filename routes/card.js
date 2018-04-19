var router = require('koa-router')()
import {sql} from '../lib/sql'
import * as response from '../lib/response'

// List cards
router.get('/list', async function(ctx, next) {

  let info = ctx.request.body
  let session = ctx.session

  if (session['admin'] == null)
  {
    ctx.response.body = response.error(response.NOT_LOGGED_IN)
    return
  }

  try
  {
    let res = await sql('\
        select A.*, ifnull(__from1__.xx, 0) as Borrowed, ifnull(__from2__.yy, 0) as Owed\
        from card A\
        left join (\
            select cno, count(*) as xx\
            from borrow B\
            where act_return_date is null\
            group by cno\
        ) __from1__\
        on A.cno = __from1__.cno\
        left join (\
            select cno, count(*) as yy\
            from borrow C\
            where act_return_date is null\
            and return_date < now()\
            group by cno\
        ) __from2__\
        on A.cno = __from2__.cno\
        ;\
    ')
    ctx.response.body = res
  } catch (e)
  {
    ctx.response.body = response.error(response.PERMISSION_DENIED)
  }
})

// Add card
router.post('/add', async function (ctx, next) {
  
  let info = ctx.request.body
  let session = ctx.session

  if (session['admin'] == null)
  {
    ctx.response.body = response.error(response.NOT_LOGGED_IN)
    return
  }

  if (info['cno'] == null || info['name'] == null || info['department'] == null || info['type'] == null)
  {
    ctx.response.body = response.error(response.INFO_INCOMPLETE);
    return
  }

  try
  {
    await sql('\
        insert into card values\
        (?, ?, ?, ?)\
    ', [info['cno'], info['name'], info['department'], info['type']])
    ctx.response.body = response.error(response.OK)
  } catch (e)
  {
    ctx.response.body = response.error(response.PERMISSION_DENIED)
  }
})

// Remove card
router.post('/remove', async function (ctx, next) {

  let info = ctx.request.body
  let session = ctx.session

  if (session['admin'] == null)
  {
    ctx.response.body = response.error(response.NOT_LOGGED_IN)
    return
  }

  if (info['cno'] == null)
  {
    ctx.response.body = response.error(response.INFO_INCOMPLETE);
    return
  }

  try
  {
    await sql('\
        delete from card where cno = ?\
    ', [info['cno']])
    ctx.response.body = response.error(response.OK)
  } catch (e)
  {
    ctx.response.body = response.error(response.PERMISSION_DENIED)
  }
})

module.exports = router