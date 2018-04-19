var router = require('koa-router')()
import {sql} from '../lib/sql'
import * as response from '../lib/response'

// Query books
router.get('/', async function (ctx, next) {
  
  let info = ctx.query

  let query = '\
    select *\
    from book\
    where true and \
  '
  let param = []

  if (info['category'])
  {
    query += 'category like ? and '
    param.push('%' + info['category'] + '%')
  }
  if (info['title'])
  {
    query += 'title like ? and '
    param.push('%' + info['title'] + '%')
  }
  if (info['press'])
  {
    query += 'press like ? and '
    param.push('%' + info['press'] + '%')
  }
  if (info['yearl'] || info['yearr'])
  {
    // Just suppose this system can run until 10^9 AD
    let l = info['yearl'] ? parseInt(info['yearl']) : -1000000000
    let r = info['yearr'] ? parseInt(info['yearr']) :  1000000000

    query += 'year between ? and ? and '
    param.push(l, r)
  }
  if (info['author'])
  {
    query += 'author like ? and '
    param.push('%' + info['author'] + '%')
  }
  if (info['pricel'] || info['pricer'])
  {
    // Just suppose there will be no book more expensive than this
    let l = info['pricel'] ? parseFloat(info['pricel']) : -1.0
    let r = info['pricer'] ? parseFloat(info['pricer']) :  1000000000.0

    query += 'price between ? and ? and '
    param.push(l, r)
  }
  
  let order = info['order'] ? info['order'] : 'title'
  query += 'true order by ? '
  param.push(info['order'])

  let limit = info['number'] ? parseInt(info['number']) : 50 
  query += 'limit ?'
  param.push(limit)

  let res = (await sql(query, param))
  ctx.response.body = res
})

// Inbound
router.post('/inbound', async function (ctx, next) {
  
  let session = ctx.session
  if (!session['admin'])
  {
    ctx.response.body = response.error(response.NOT_LOGGED_IN)
    return
  }

  let info = ctx.request.body
  
  let query = 'insert into book values '
  let param = []

  for (let row of info['items'])
  if (row['bno'] && row['category'] && row['title'] && row['press'] &&
      row['year'] && row['author'] && row['price'] && row['total'])
  {
    query += '(?, ?, ?, ?, ?, ?, ?, ?, ?), '
    param.push(row['bno'], row['category'], row['title'], row['press'],
               parseInt(row['year']), row['author'], parseFloat(row['price']), parseInt(row['total']), parseInt(row['total']))
  }

  if (param.length === 0)
    ctx.response.body = response.error(response.INFO_INCOMPLETE)
  else
  {
    query = query.slice(0, -2) + ';'
    let res = (await sql(query, param))

    console.log(res)

    ctx.response.body = response.error(response.OK)
  }
})

// Show
router.get('/borrowed', async function (ctx, next){
  
  let info = ctx.query
  
  if (session['admin'] == null)
  {
    ctx.response.body = response.error(response.NOT_LOGGED_IN)
    return
  }
  
  if (info['cno'] == null)
  {
    ctx.response.body = response.error(response.INFO_INCOMPLETE)
    return
  }

  let res = (await sql('\
    select book.*\
    from book\
    natural join borrow\
    where borrow.cno = ?\
    and act_return_date is null\
  ', [
    info['cno']
  ]))
  console.log(res)

  ctx.response.body = res
})

// Borrow
router.post('/borrow', async function (ctx, next) {

  let info = ctx.request.body
  let session = ctx.session

  if (session['admin'] == null)
  {
    ctx.response.body = response.error(response.NOT_LOGGED_IN)
    return
  }

  if (info['bno'] == null || info['cno'] == null)
  {
    ctx.response.body = response.error(response.INFO_INCOMPLETE)
    return
  }
  
  try
  {
    let res = (await sql('\
      lock tables card read, book write, borrow write;\
      call borrowBook(?, ?, ?, @borrow_success, @borrow_stock, @borrow_rettime);\
      select @borrow_success as success, @borrow_rettime as rettime;\
      unlock table;',
      [session['admin']['ano'], info['bno'], info['cno']]
    ))[2][0]

    if (res['success'])
      ctx.response.body = response.error(response.OK)
    else
      ctx.response.body = response.error(response.NO_RESULT, res['rettime'])
  }
  catch (e)
  {
    await sql('unlock table;')
    ctx.response.body = response.error(response.PERMISSION_DENIED)
  }
})

// Return
router.post('/return', async function (ctx, next) {
  let info = ctx.request.body
  let session = ctx.session
  
  console.log(session['admin'] == null)

  if (session['admin'] == null)
  {
    ctx.response.body = response.error(response.NOT_LOGGED_IN)
    return
  }

  if (info['bno'] == null || info['cno'] == null)
  {
    ctx.response.body = response.error(response.INFO_INCOMPLETE)
    return
  }
  
  try
  {
    let res = (await sql('\
      lock tables card read, book write, borrow write;\
      call returnBook(?, ?, @return_success);\
      select @return_success as success;\
      unlock table;',
      [info['bno'], info['cno']]
    ))[2][0]

    if (res['success'])
      ctx.response.body = response.error(response.OK)
    else
      ctx.response.body = response.error(response.NO_RESULT)
  }
  catch (e)
  {
    await sql('unlock table;');
    ctx.response.body = response.error(response.PERMISSION_DENIED)
  }
})

module.exports = router