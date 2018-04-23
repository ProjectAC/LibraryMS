var router = require('koa-router')()
import {sql} from '../lib/sql'
import * as response from '../lib/response'

// Query books
router.post('/', async function (ctx, next) {
  
  let info = ctx.request.body

  let query = '\
    select *\
    from book\
    where \
  '
  let param = []

  if (info['bno'])
  {
    query += 'bno like ? and '
    param.push('%' + info['bno'] + '%')
  }
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
    let l = info['yearl'] ? parseInt(info['yearl']) : -1000000000.0
    let r = info['yearr'] ? parseInt(info['yearr']) :  1000000000.0

    l = isNaN(l) ? -1.0 : l
    r = isNaN(r) ? 1000000000.0 : r
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

    l = isNaN(l) ? -1.0 : l
    r = isNaN(r) ? 1000000000.0 : r
    query += 'price between ? and ? and '
    param.push(l, r)
  }
  
  let order = 'title'
  let iod = info['order'] 
  if (iod == 'category' || iod == 'press' || iod == 'year' || iod == 'author' || iod == 'price')
      order = info['order']
  let asc = info['asc'] == 'desc' ? 'desc' : 'asc'
  query += 'true order by ' + order + ' ' + asc + ' '

  let limit = info['number'] ? parseInt(info['number']) : 50 
  query += 'limit ? ;'
  param.push(limit)

  let res = (await sql(query, param))
  ctx.response.body = {list: res}
})

// Inbound
router.post('/inbound', async function (ctx, next) {
  
  let session = ctx.session

  if (!session['admin'] || session['admin']['ano'] == '00000000')
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
    query = query.slice(0, -2) + ' on duplicate key update\
      total = total + values(total),\
      stock = stock + values(stock);'

    try {
      await sql(query, param)
      ctx.response.body = response.error(response.OK)
    } catch (err) {
      console.log(err.message)
      ctx.response.body = response.error(response.INFO_INCOMPLETE)
    }
  }
})

// Show
router.post('/borrowed', async function (ctx, next){
  
  let info = ctx.request.body
  let session = ctx.session
  
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
    select bno as bno, title,\
      min(borrow_date) as borrow_date,\
      min(return_date) as return_date,\
      (min(return_date) < now()) as owed,\
      count(*) as amount\
    from borrow natural join book\
    where cno = ?\
    and act_return_date is null\
    group by bno;\
  ', [
    info['cno']
  ]))

  ctx.response.body = {
    list: res
  }
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