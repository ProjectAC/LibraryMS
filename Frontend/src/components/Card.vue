<template>
  <div>
    <button class="button" style="float: right; width: 200px; margin-top: 10px;margin-right: 50px;" v-if="res['list']" v-on:click="showPrompt()">
      添加新的借书证
    </button>

    <prompt ref="prompt">
      <div style="background-color: rgb(48, 48, 48); color: white; padding: 20px;">
        <div style="width: 100%; text-align: center; padding-bottom: 10px; font-weight: bold; font-size: 20px;">添加借书证</div>
      </div>
      <div style="background-color: white; color: black; padding: 30px;">
        <div class="row">
          <font class="label">卡号</font>
          <input type="text" v-on:input="icno = $event.target.value" class="marginLeft" id=""/>
        </div>
        <div class="row">
          <font class="label">姓名</font>
          <input type="text" v-on:input="iname = $event.target.value" class="marginLeft" id=""/>
        </div>
        <div class="row">
          <font class="label">院系</font>
          <input type="text" v-on:input="idept = $event.target.value" class="marginLeft" id=""/>
        </div>
        <div class="row">
          <font class="label">类别</font>
          <select v-on:change="itype = $event.target.value" class="marginLeft">
            <option value="U">本科生</option>
            <option value="G">研究生</option>
            <option value="P">教师</option>
            <option value="S">职工</option>
          </select>
        </div>
        <br/>
        <button class="button" v-on:click="addCard()">创建</button>
      </div>
    </prompt>

    <rectangle color="red">图书卡列表</rectangle>
    <div style="padding: 0px 50px 0px 50px;">
      <div v-if="res['err'] == 'failed'">
        加载失败。<br/>
        请稍等再试。
      </div>
      <div v-else-if="res['code']">
        您没有权限访问这里。<br/>
        如有疑问，请联系工作人员。<br/>
      </div>
      <div v-else-if="res['list']">
        <div class="line" style="border-bottom: 1px solid rgba(99, 199, 204, 1); margin-bottom: 5px; font-weight: bold;">
          <div style="flex: 2">卡号</div>
          <div style="flex: 4">姓名</div>
          <div style="flex: 8">院系</div>
          <div style="flex: 2">类别</div>
          <div style="flex: 1">超/借</div>
          <div style="flex: 1.5">操作</div>
        </div>
        <div v-for="(item, index) in res['list']" :class="'line color' + (index & 1)" v-on:click="">
          <div style="flex: 2"><font class="label">#{{ item['cno'] }}</font></div>
          <div style="flex: 4">{{ item['name'] }}</div>
          <div style="flex: 8">{{ item['department'] }}</div>
          <div style="flex: 2">{{ typeName[item['type']] }}</div>
          <div style="flex: 1">
            <font :style="'color: ' + (parseInt(item['Owed']) ? 'red' : 'rgba(99, 199, 204, 1)')"> {{ item['Owed'] }} </font> / {{ item['Borrowed'] }}</div>
          <div style="flex: 1.5">
            <button class="button btnred" style="width: 50px;" v-on:click="deleteCard(item['cno'])"> 删除 </button>
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
      iname: '',
      idept: '',
      itype: 'U',
      typeName: {
        'U': '本科生',
        'G': '研究生',
        'P': '教师',
        'S': '职工'
      }
    }
  },
  methods: {
    showPrompt()
    {
      this.$refs.prompt.show = true
    },
    search: async function () {
      let self = this
      
      let res = await self.$http.post(
        serverURL + '/card/list',
        {},
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
    addCard: async function()
    {
      let self = this
      let res = await self.$http.post(
        serverURL + '/card/add',
        {
          cno: self.icno,
          name: self.iname,
          department: self.idept,
          type: self.itype
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
    deleteCard: async function(cno)
    {
      let self = this

      if (confirm('确实要删除卡号 #' + cno + ' 吗？'))
      {
        let res = await self.$http.post(
          serverURL + '/card/remove',
          {
            cno: cno
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
        else if (res.body['code'])
        {
          alert('您没有权限执行此动作。')
        }
        else
        {
          await this.search()
          alert('删除成功。')
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