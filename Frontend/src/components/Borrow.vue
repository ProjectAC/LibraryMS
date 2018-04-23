<template>
  <div>
    <div v-if="card['cno']">
      <button class="button" style="float: right; width: 150px; margin-top: 10px;margin-right: 50px;" v-on:click="showPrompt()">
        借书
      </button>
      <button class="button btnred" style="float: right; width: 150px; margin-top: 10px;margin-right: 50px;" v-on:click="logout()">
        退卡
      </button>
    </div>

    <prompt ref="prompt">
      <div style="background-color: rgb(48, 48, 48); color: white; padding: 20px;">
        <div style="width: 100%; text-align: center; padding-bottom: 10px; font-weight: bold; font-size: 20px;">借阅</div>
      </div>
      <div style="background-color: white; color: black; padding: 30px;">
        <div class="row">
          <font class="label">书号</font>
          <input type="text" v-on:input="searchBook($event.target.value)" class="marginLeft" id=""/>
          <button class="button" style="float: right; width: 300px;" v-on:click="borrowBook()">借阅</button>
        </div>
        <br/>
        <div style="width: 70vw; height: 30vh; overflow: auto;">
          <div style="font-size:15px">
            <div class="line" style="border-bottom: 1px solid rgba(99, 199, 204, 1); margin-bottom: 5px; font-weight: bold;">
              <div style="flex: 2">书号</div>
              <div style="flex: 4">分类</div>
              <div style="flex: 10">书名</div>
              <div style="flex: 6">出版社</div>
              <div style="flex: 2">年份</div>
              <div style="flex: 3">作者</div>
              <div style="flex: 2">价格</div>
              <div style="flex: 2">存/总</div>
            </div>
            <div v-for="(item, index) in searchById" :class="'line color' + (index & 1)" v-on:click="">
              <div style="flex: 2"><font class="label">#{{ item['bno'] }}</font></div>
              <div style="flex: 4">{{ item['category'] }}</div>
              <div style="flex: 10">{{ item['title'] }}</div>
              <div style="flex: 6">{{ item['press'] }}</div>
              <div style="flex: 2">{{ item['year'] }}</div>
              <div style="flex: 3">{{ item['author'] }}</div>
              <div style="flex: 2">{{ item['price'] }}</div>
              <div style="flex: 2">
                <font :style="'color: ' + (parseInt(item['stock']) ? 'rgba(99, 199, 204, 1)' : 'red')"> {{ item['stock'] }} </font> / {{ item['total'] }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </prompt>

    <rectangle color="red">借书记录</rectangle>
    <div style="padding: 0px 50px 0px 50px;">
      <div v-if="res['err'] == 'failed'">
        加载失败。<br/>
        请稍等再试。
      </div>
      <div v-else-if="res['code'] == -4">
        请刷卡或输入卡号。
        <div style="padding-top: 50px;">
          <div class="row">
            <font class="label">卡号</font>
            <input type="text" v-on:input="icno = $event.target.value" class="marginLeft" id=""/>
          </div>
          <button class="button btnred" style="width: 252px;" v-on:click='getCard()'>刷卡</button>
        </div> 
      </div>
      <div v-else-if="res['code']">
        您没有权限访问这里。<br/>
        如有疑问，请联系工作人员。<br/>
      </div>
      <div v-else-if="res['list']">
        <div class="line" style="border-bottom: 1px solid rgba(99, 199, 204, 1); margin-bottom: 5px; font-weight: bold;">
          <div style="flex: 2">书号</div>
          <div style="flex: 8">书名</div>
          <div style="flex: 4">最早借阅时间</div>
          <div style="flex: 4">最早归还时间</div>
          <div style="flex: 2">数量</div>
          <div style="flex: 2">操作</div>
        </div>
        <div v-for="(item, index) in res['list']" :class="'line color' + (index & 1)" v-on:click="">
          <div style="flex: 2"><font class="label">#{{ item['bno'] }}</font></div>
          <div style="flex: 8">{{ item['title'] }}</div>
          <div style="flex: 4">{{ toDateStr(item['borrow_date']) }}</div>
          <div style="flex: 4"><font :style="item['owed'] ? 'color: red;' : ''">{{ toDateStr(item['return_date']) }}</font></div>
          <div style="flex: 2">{{ item['amount'] }}</div>
          <div style="flex: 2">
            <button class="button btnred" style="width: 50px;" v-on:click="returnBook(item['title'], item['bno'])"> 归还 </button>
          </div>
        </div>
      </div>
      <div v-else>
        正在加载……
      </div>
    </div>
  </div>
</template>

<script>
import Rectangle from './templates/Rectangle'
import Prompt from './templates/Prompt'
import {serverURL} from '../config'

export default {
  data () {
    return{
      res: {},
      prompt: null,
      icno: '',
      ibno: '',
      card: {},
      searchById: []
    }
  },
  methods: {
    toDate (str) {
      var sd = [
        str.substring( 0,  4),
        str.substring( 5,  7),
        str.substring( 8, 10),
        str.substring(11, 13),
        str.substring(14, 16),
        str.substring(17, 19)
      ]
      return new Date(sd[0], parseInt(sd[1]) - 1, sd[2], sd[3], sd[4], sd[5])
    },
    toDateStr (str) {
      var sd = [
        str.substring( 0,  4),
        str.substring( 5,  7),
        str.substring( 8, 10),
        str.substring(11, 13),
        str.substring(14, 16),
        str.substring(17, 19)
      ]
      return sd[1] + '月' + sd[2] + '日' + sd[3] + '时'   
    },
    searchBook: async function (str)
    {
      let self = this
      self.ibno = str

      let res = await self.$http.post(
        serverURL + '/book',
        {
          bno: self.ibno
        },
        {
          emulateJSON: true,
          withCredentials: true
        }
      )
      if (res.status != 200 || res['code'])
      {
      }
      else
      {
        self.searchById = []
        self.$nextTick(() => (self.searchById = res.body['list']))
      }
    },
    showPrompt()
    {
      this.$refs.prompt.show = true
    },
    getCard: async function()
    {
      let self = this
      
      let res = await self.$http.post(
        serverURL + '/card/login',
        {
          cno: this.icno
        },
        {
          emulateJSON: true,
          withCredentials: true
        }
      )
      if (res.status != 200)
      {
        alert('登录失败。请稍等再试。');
      }
      else if (res.body['code'] == -5)
      {
        alert('卡号不存在。');
      }
      else if (res.body['code'] == -3)
      {
        alert('您没有权限访问这里。\n如有疑问，请联系管理员。');
      }
      else if (res.body['code'])
      {
        alert('登录失败。请稍等再试。');
      }
      else
      {
        self.card = res.body
        this.search()
      }
    },
    logout: async function () {
      this.card = {}
      await this.search()
    },
    search: async function () {
      let self = this
      
      if (!self.card['cno'])
      {
        self.res = {code: -4};
        return;
      }

      let res = await self.$http.post(
        serverURL + '/book/borrowed',
        {
          cno: self.card['cno']
        },
        {
          emulateJSON: true,
          withCredentials: true
        }
      )
      if (res.status != 200)
      {
        self.res = {err: 'failed'}
      }
      else
      {
        self.res = res.body
      }
    },
    borrowBook: async function()
    {
      let self = this
      let res = await self.$http.post(
        serverURL + '/book/borrow',
        {
          cno: self.card.cno,
          bno: self.ibno
        },
        {
          emulateJSON: true,
          withCredentials: true
        }
      )
      if (res.status != 200)
      {
        alert('删除失败，请稍等再试。')
      }
      else if (res.body['code'] == -4)
      {
        alert('数据不完整。')
      }
      else if (res.body['code'] == -5)
      {
        alert('卡信息不正确或没有此书。')
      }
      else if (res.body['code'])
      {
        alert('您没有权限执行此动作。')
      }
      else
      {
        await this.search()
        alert('借书成功。')
        this.$refs.prompt.show = false
      }
    },
    returnBook: async function(title, bno)
    {
      let self = this

      if (confirm(self.card.name + '确实要归还一本《' + title + '》(#' + bno + ') 吗？'))
      {
        let res = await self.$http.post(
          serverURL + '/book/return',
          {
            cno: self.card.cno,
            bno: bno
          },
          {
            emulateJSON: true,
            withCredentials: true
          }
        )
        if (res.status != 200)
        {
          alert('归还失败，请稍等再试。')
        }
        else if (res.body['code'])
        {
          alert('您没有权限执行此动作。')
        }
        else
        {
          await this.search()
          alert('归还成功。')
        }
      }
    }
  },
  components: {
    Rectangle,
    Prompt
  },
  mounted: async function () {
    await this.search()
  }
}
</script>

<style scoped>

.marginLeft
{
  display: inline block;
  margin-left: 12px;
}

.row
{
  height: 50px;
}

</style>
