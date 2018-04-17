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
    let res = (await sql(query, param))[0]
    ctx.response.body = response.error(response.OK)
  }
})

// Borrow

router.post('/borrow', async function (ctx, next) {

  let info = ctx.request.body
  
  if (row['bno'] === undefined)
    ctx.response.body = response.error(response.INFO_INCOMPLETE)
  
  
  
})

// Return

router.post('/', async function (ctx, next) {
  
})

module.exports = router