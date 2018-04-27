# ProjectAC::LibraryMS

## 简介

__本项目（ProjectAC::LibraryMS，简称ACLMS）是一个基于Web的图书管理系统__，尽可能地贴近现实需求，利用关系型数据库（MySQL）对数据进行管理、统计。它的后端和数据库应该部署于图书馆内网，而客户端仅限于管理员登录和自助终端机刷卡登录，可以避免隐私数据（例如借还书信息）通过非官方终端泄露。  
ACLMS采用的技术栈是：__Mysql + koa2(on Node.js) + Vue.js + ProjectAC::UI__。在正式上线时，请务必使用https以保证用户隐私数据的安全性（因为没有另外加安全措施）。  
ACLMS具有3级权限系统：  
- 第0级：未登录 - 此时只能进行图书查询功能，可以应用于自助图书检索终端；
- 第1级：自动柜员机（用户） - 可以通过刷借书证进行借还书；
- 第2级：工作人员 - 除了可以借还书，还可以办理办卡、注销卡、入库等业务；
- 隐藏级：后台 - 由专职的技术人员直接对后台进行操作，可以添加管理员或者建立新的业务。
__本项目以GPLv3协议在Github网站上开源__。另外，__一个测试性的ACLMS系统已经在[这里]{http://sol-pic.com:8080}上线测试环境__，可以进行各种功能的在线体验。

## 使用方法

### 本地开发

1. 首次运行，请先配置好运行环境：

```
cd path/to/LibraryMS/
npm install -g nodemon
npm install
cd Frontend
npm install
```

2. 开服

需要至少两个终端。  

前端（nodemon测试服）：

```
npm run dev
```
测试服端口号： 8080

后端（调试服）：

```
npm start
```
测试服端口号：2333

### 部署（测试或上线运营）

1. 在前端文件中修改后端服务器地址为真实地址

```
vim Frontend/src/config.js
```

会看见类似：
```
let serverURL = 'http://localhost:2333'

module.exports = {
  serverURL
}
```
的内容，将serverURL的值改为真实服务器地址。

2. 将设置数据库账户密码

```
vim lib/sql.js
```

会看见类似：
```
var wrapper = require("co-mysql");
var mysql = require("mysql");

var option = 
{
    host: 'localhost',
    port: 3306,
    database: 'library',
    user: 'access',
    password: '',
    multipleStatements: true
}

var pool = mysql.createPool(option);
var p = wrapper(pool);

console.log('[INFO] MySQL Connector ready.');

async function execute(sql, args)
{
    return await p.query(mysql.format(sql, args));
}

exports.sql = execute;
```
的内容，将option中的信息设置为服务器Mysql实际的配置。

3. 数据库建立

在Mysql中运行source init.sql即可。

4. 生成前端

```
./prepare.sh
```

5. 开服

```
npm run koa
```

如果需要使用pm2来托管，请输入

```
npm run pm2
```

6. 完成

打开 yourserver:yourport （例如sol-pic.com:8080），即可进入应用首页

## 路径

后端的核心逻辑位于目录：_/routes_  
前端的核心逻辑位于目录：_/Frontend/src_  


## 后端接口

__如果需要对后端进行业务逻辑的更改，或是更好地了解ACLMS，请认真阅读本节内容。__  
ACLMS的后端主要分布在三个根url：__/admin__，__/book__，和__/card__。
说明：如果返回值为一个数字（或后面接一点信息而不是json格式），表示返回错误编码。其中：
```
let OK = 0
let NOT_LOGGED_IN = -1
let AUTH_FAILED = -2
let PERMISSION_DENIED = -3
let INFO_INCOMPLETE = -4
let NO_RESULT = -5
```

### /admin

- /admin/login
功能：登录管理员账号  
参数：
```
{
    ano: 管理员用户ID,
    password: 密码
}
```

返回值：  
_失败_
```
-2
```
_成功_
```
{
    ano: 管理员用户ID,
    name: 管理员名字,
    contact: 管理员联系方式
}
```

- /admin/logout
功能：登出管理员账号  
参数：无  
返回值：  
_未登录_
```
-1
```
_成功_
```
0
```

- /admin
功能：查看当前登录的账号  
参数：无  
返回值：  
_未登录_
```
-1
```
_已登录_
```
{
    ano: 管理员用户ID,
    name: 管理员名字,
    contact: 管理员联系方式
}
```

### /book

- /book
功能：查询图书  
参数：
```
{
    bno: （可选）书号,
    category: （可选）分类,
    title: （可选）标题,
    press: （可选）出版社,
    yearl: （可选）年份下限,
    yearr: （可选）年份上限,
    author: （可选）作者,
    pricel: （可选）价格下限,
    pricer: （可选）价格上限,
    order: （可选）排序方式（默认title）,
    number:（可选）显示的条数（默认50）
}
```
返回值：
```
{
    list: [
        {
            bno: 书号,
            category: 分类,
            title: 标题,
            press: 出版社,
            year: 年份,
            author: 作者,
            price: 价格,
            total: 总量,
            stock: 库存
        },
        ...
    ]
}
```

- /book/inbound
功能：批量入库  
参数：
```
{
    bno: 书号,
    category: 分类,
    title: 标题,
    press: 出版社,
    year: 年份,
    author: 作者,
    price: 价格,
    total: 总量,
    stock: 库存
}
```
返回值：  
_未登录权限2_
```
-1
```
_成功_
```
0
```

- /book/borrowed
功能：显示某一张卡的借阅列表  
参数：
```
{
    cno: 卡号
}
```
返回值：  
_未登录权限1_
```
-1
```
_成功_
```
{
    list: [
        {
            bno: 书号,
            title: 书名,
            borrow_date: （最早）结束时间,
            return_date: （最近）预计归还时间,
            owed: 是否超期,
            amount: 数量
        },
        ...
    ]
}
```

- /book/borrow
功能：借书  
参数：
```
{
    bno: 要借的书的编号,
    cno: 卡号
}
```
返回值：  
_未登录权限1_
```
-1
```
_书被借完_
```
-5, 最近预计归还时间
```
_书不存在_
```
-3
```
_成功_
```
0
```

- /book/return
功能：还书  
参数：
```
{
    bno: 要还的书的编号,
    cno: 卡号
}
```
返回值：  
_未登录权限1_
```
-1
```
_未借阅此书_
```
-5
```
_书不存在_
```
-3
```
_成功_
```
0
```

### /card

- /card/list
功能：查看所有的卡信息  
参数：无  
返回值：
_未登录权限2_
```
-1
```
_成功_
```
{
    list: [
        {
            cno: 卡号,
            name: 名字,
            department: 院系,
            type: 类型,
            Borrowed: 借书未还数目,
            Owed: 超期未还数目
        },
        ...
    ]
}
```

- /card/login
功能：刷卡登录  
参数：
```
{
    cno: 卡号
}
```
返回值：  
_卡不存在_
```
-5
```
_成功_
```
{
    cno: 卡号,
    name: 名字,
    department: 院系,
    type: 类型
}
```

- /card/add
功能：添加一张卡  
参数：
```
{
    cno: 卡号,
    name: 名字,
    department: 院系,
    type: 类型
}
```
返回值：  
_卡号已存在_
```
-3
```
_成功_
```
0
```

- /card/remove
功能：删除一张卡  
参数：
```
{
    cno: 卡号
}
```
返回值：  
_卡号不存在_
```
-5
```
_成功_
```
0
```

