let OK = 0
let NOT_LOGGED_IN = -1
let AUTH_FAILED = -2
let PERMISSION_DENIED = -3
let INFO_INCOMPLETE = -4
let NO_RESULT = -5

function error(i, detail)
{
   let res = {code: i}
   if (i == OK)
       res['msg'] = 'Everything OK.'
   else if (i == NOT_LOGGED_IN)
       res['msg'] = 'Not logged in.'
   else if (i == AUTH_FAILED)
       res['msg'] = 'Authorize failed.'
   else if (i == PERMISSION_DENIED)
       res['msg'] = 'Permission denied.'
  else if (i == INFO_INCOMPLETE)
      res['msg'] = 'Information incomplete.'
  else if (i == NO_RESULT)
      res['msg'] = 'No result.'
  else
      res['msg'] = 'Unexpected exception.'
  
  if (detail)
      res['detail'] = detail
  
  return res
}

module.exports = {
  OK,
  NOT_LOGGED_IN,
  AUTH_FAILED,
  PERMISSION_DENIED,
  INFO_INCOMPLETE,
  NO_RESULT,
  error
}