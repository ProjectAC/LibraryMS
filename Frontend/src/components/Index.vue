<template>
  <div>
    <button class="button" style="float: right; width: 200px; margin-top: 10px;margin-right: 50px;" v-if="res['list']" v-on:click="showPrompt()">
      新书入库
    </button>
    
    <prompt ref="prompt">
      <div style="background-color: rgb(48, 48, 48); color: white; padding: 20px;">
        <div style="width: 100%; text-align: center; padding-bottom: 10px; font-weight: bold; font-size: 20px;">新书入库</div>
      </div>
      <div style="background-color: white; color: black; padding: 30px;">
        将要入库的书名按照JSON格式打包。单本入库请直接填写以下表格。<br/><br/>
        <textarea style="width: 80vw; height: 40vh;" id="ibooks">[
  {
    "bno": "",
    "category": "",
    "title": "",
    "press": "",
    "author": "",
    "year": ,
    "price": ,
    "total": 
  }
]</textarea>
        <br/>
        <button class="button" v-on:click="addBooks()">入库</button>
      </div>
    </prompt>

    <rectangle color="red">查询书目</rectangle>
    
    <side label="搜索">
      
      <div class="row title"><h3>搜索书籍</h3></div> 
      <div class="row"></div>
      
      <div class="row"><font class="label">分类</font> <input type="text" v-on:input="set('category', $event.target.value)" class="marginLeft" id=""/></div>
      <div class="row"><font class="label">书名</font> <input type="text" v-on:input="set('title', $event.target.value)" class="marginLeft" id=""/><br/></div>
      <div class="row"><font class="label">出版</font> <input type="text" v-on:input="set('press', $event.target.value)" class="marginLeft" id=""/><br/></div>
      <div class="row"><font class="label">年份</font> <input type="text" v-on:input="set('yearl', $event.target.value)" class="short marginLeft" id=""/> - <input type="text" v-on:input="set('yearr', $event.target.value)" class="short" id=""/><br/></div>
      <div class="row"><font class="label">作者</font> <input type="text" v-on:input="set('author', $event.target.value)" class="marginLeft" id=""/><br/></div>
      <div class="row"><font class="label">价格</font> <input type="text" v-on:input="set('pricel', $event.target.value)" class="short marginLeft" id=""/> - <input type="text" v-on:input="set('pricer', $event.target.value)" class="short" id=""/><br/></div>
      <div class="row"></div>
      <div class="row"><font class="label">排序</font>
        <select v-on:input="set('order', $event.target.value)" class="marginLeft" style="width: 140px">
          <option value="title">书名</option>
          <option value="category">分类</option>
          <option value="press">出版社</option>
          <option value="author">作者</option>
          <option value="year">年份</option>
          <option value="price">价格</option>
        </select>
        <button class="button" :style="'width: 50px; color:white; background-color:' + (params['asc'] == 'asc' ? 'red' : 'black')  + ';' " v-on:click="switchOrder()">{{ orderName }}</button>
      </div>
      <div class="row"></div>
      <button class="button" v-on:click="update()">搜索</button>
    </side>

    <div style="padding: 0px 50px 0px 50px;">
      <div v-if="res['err'] == 'failed'">
        加载失败。<br/>
        请稍等再试。
      </div>
      <div v-else-if="res['code']">
        您没有权限访问这里。</br>
        如有疑问，请联系工作人员。
      </div>
      <div v-else-if="res['list']" style="font-size:15px">
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
        <div v-for="(item, index) in res['list']" :class="'line color' + (index & 1)" v-on:click="">
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
      <div v-else>
        正在加载……
      </div>
    </div>
  </div>
</template>

<script>
import Side from './templates/Side'
import Rectangle from './templates/Rectangle'
import Prompt from './templates/Prompt'
import {serverURL} from '../config'

export default {
  data () {
    return{
      res: [],
      params: {asc: 'asc'},
      target: '',
      orderName: '升序'
    }
  },
  methods: {
    showPrompt()
    {
      this.$refs.prompt.show = true
    },
    addBooks: async function ()
    {
      let str = document.getElementById('ibooks').value
      let json = {}
      
      try
      {
        json = JSON.parse(str)
      } catch (err)
      {
        alert('数据格式有误。')
        return
      }

      let self = this;
      let res = await self.$http.post(
        serverURL + '/book/inbound',
        {
          items: json
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
        alert('数据不正确。')
      }
      else if (res.body['code'])
      {
        alert('您没有权限执行此动作。')
      }
      else
      {
        await this.search()
        alert('创建成功。')
        this.$refs.prompt.show = false
      }
    },
    switchOrder()
    {
      if (this.params['asc'] == 'asc')
      {
        this.params['asc'] = 'desc';
        this.orderName = '降序'
      }
      else
      {
        this.params['asc'] = 'asc';
        this.orderName = '升序'
      }
    },
    set: function (key, val) {
      this.params[key] = val == '' ? null : val
    },
    update: function () {
      let res = '/?'
      let params = this.params

      for (let key in params)
        if (params[key] != null)
          res += key + '=' + params[key] + '&'

      res = res.substr(0, res.length - 1)

      this.$router.push({path: res})
      this.search()
    },
    search: async function () {
      let self = this

      let res = await self.$http.post(
        serverURL + '/book',
        self.$route.query,
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
    }
  },
  components: {
    Side,
    Rectangle,
    Prompt
  },
  mounted: async function () {
    this.search()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>

<style scoped>

.marginLeft
{
  display: inline block;
  margin-left: 12px;
}

</style>