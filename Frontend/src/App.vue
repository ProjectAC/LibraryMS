<template>
  <div id="app">

    <div class="list" :style="show && !admin['ano'] ? 'top: 70px;' : 'top: -100px;'">
      <div style="padding: 20px;">
        <div class="row">编号 <input type="text" v-on:input="ano = $event.target.value" style="margin-left: 12px; color: white;"/></div>
        <div class="row">密码 <input type="password" v-on:input="password = $event.target.value" style="margin-left: 12px; color: white;"/></div>
        <button class="button" v-on:click="login()">登录</button>
      </div>
    </div>

    <div class="list" :style="show && admin['ano'] ? 'top: 70px;' : 'top: -200px;'">
      <router-link to='/card'><div class="box highlight">检查卡信息</div></router-link>
      <router-link to='/borrow'><div class="box highlight">借书/还书</div></router-link>
      <div class="box highlight" v-on:click='logout()'>登出</div>
    </div>

    <head-bar height="70px">
      <div class="titleCell highlight" style="float: right; position: relative;">
        <div class="full" v-if="admin['ano'] == null">
          <div class="full table" style="padding-right: 30px; padding-left: 30px;" v-on:click="show = !show">
            <font class="vcenter" style="font-size: 15px;">管理员登录</font>
          </div>
        </div>
        <div class="full" v-else>
          <div class="full table" style="font-size: 12px; padding-right: 20px; padding-left: 20px;" v-on:click="show = !show">
            <font class="vcenter">
              编号 #{{admin['ano']}}<br/>
              名称 {{admin['name']}}
            </font>
          </div>
        </div>
      </div>
      <div class="titleCell" style="vertical-align: bottom; margin-left: 50px;">
        <div class="vcenter">
          <router-link to="/" class="box">
            <font style="font-size: 23px;">图书馆管理系统</font><font class="label" style="font-size: 15px; padding-left:20px">Project AC</font>
          </router-link>
        </div>
      </div>
    </head-bar>
    <div style="padding-top:80px"></div>
    <router-view v-if='flush' />
  </div>
</template>

<script>

import HeadBar from './components/templates/HeadBar.vue'
import {serverURL} from './config'

export default {
  name: 'app',
  data () {
    return {
      show: false,
      admin: {},
      ano: '',
      password: '',
      flush: true
    }
  },
  components: {
    HeadBar
  },
  methods: {
    async login() {
      let self = this

      if (self.ano === '' || self.password === '')
      {
        alert('用户名或密码不能为空。')
        return
      }
      else
      {
        this.show = false
        
        let res = {}
        try
        {
          res = await self.$http.post(
            serverURL + '/admin/login',
            {
              ano: self.ano,
              password: self.password
            },
            {
              emulateJSON: true,
              withCredentials: true
            }
          )
        } catch (err)
        {
          this.show = true
          alert('登录失败，请稍等再试。')
          return
        }

        if (res.status != 200)
        {
          this.show = true
          alert('登录失败，请稍等再试。')
        }
        else if (res.body['code'])
        {
          alert('用户名或密码不正确。')
          this.show = true
        }
        else
        {
          self.admin = res.body
          self.flush = false
          self.$nextTick(() => (this.flush = true))
        }
      }
    },
    async logout() {
      let self = this
      this.show = false
        
      let res = await self.$http.post(
        serverURL + '/admin/logout',
        {
          ano: self.ano,
          password: self.password
        },
        {
          emulateJSON: true,
          withCredentials: true
        }
      )
      if (res.status != 200)
      {
        this.show = true
        alert('登出失败，请稍等再试。\n请务必保证登出成功，以免管理员权限被滥用。')
      }
      else
      {
        self.admin = {}
        self.flush = false
        self.$nextTick(() => (this.flush = true))
      }
    }
  },
  created: async function () {
    let self = this
    let res = await self.$http.post(
      serverURL + '/admin',
      {},
      {
        emulateJSON: true,
        withCredentials: true
      }
    )

    if (!(res.status != 200 || res.body['code']))
      self.admin = res.body
  }
}

</script>

<style scoped>

.box
{
  padding: 10px 40px 10px 40px;
  text-decoration: none;
  color: white;
  font-size: 15px; 
}

.full
{
  width: 100%;
  height: 100%;
}

.list
{
  position: fixed;
  top: 70px;
  right: 0px;
  background-color: rgba(48, 48, 48, 0.8);
  font-size: 15px;
  color: white;
  
  z-index: 1000;
  transition: 0.6s all;
}

.titleCell
{
  display: table;
  height: 100%;
}

.vcenter
{
  display: table-cell;
  vertical-align: middle;
}

</style>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0px;
  margin: 0px auto;
  /*max-width: 1000px;*/
  font-size: 17px;
}

a {
  text-decoration: none;
}

.table
{
  display: table;
}

.highlight
{
  transition: 0.7s;
}

.highlight:hover
{
  background-color: rgba(255, 255, 255, 0.7);
  color: black;
  transition: 0.7s;
}

font.label
{
  color: rgb(62, 125, 127);
  font-weight: bold;
}

input, select
{
  width: 200px;
  height: 20px;
  border: 1px rgba(50, 155, 155, 1);
  border-style: none none solid none;
  font-size: 17px;

  background-color: rgba(255, 255, 255, 0);
  padding-bottom: 3px;
}

select
{
  height: 30px;
}

input:focus, select:focus
{
  border: 1px rgba(50, 155, 155, 1);
  border-style: none none solid none;
  outline: medium;
}

.short
{
  width: 93px;
}

.row
{
  height: 40px;
}

.button
{
  width: calc(100%);
  height: 30px;
  border: 0px;
  background-color: rgb(30, 160, 30);
  color: white;
  border: none;
  outline: medium;
  transition: 0.7s;
  font-size: 17px;
}

.button:hover
{
  background-color: rgb(130, 230, 130);
  color :black;
  transition: 0.7s;
  font-size: 17px;
}

.btnred
{
  background-color: rgba(220, 60, 60, 1);
}

.btnred:hover
{
  background-color: rgba(255, 160, 160, 1);
}


.line
{
  display: flex;
  padding-top: 10px;
  padding-bottom: 10px;
}

.color1
{
  background-color: rgba(240, 240, 240, 1);
}

.color0
{
  background-color: rgba(209, 249, 255, 1);
}

</style>