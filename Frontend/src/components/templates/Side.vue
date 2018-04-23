<template>
  <div class="body" id="body" :style="'right: ' + (visible ? '0px' : width()) ">
    <div class="main" id="main">
      <slot>
      </slot>
    </div>
    <a class="left" v-on:click="visible = !visible">
      <div class="cell">
        {{ label }}
      </div>
    </a>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String
    }
  },
  data () {
    return {
      visible: true
    }
  },
  methods: {
    width () {
      let x = -document.getElementById('main').clientWidth - 2
      return x.toString() + 'px'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.body
{
  position: fixed;
  bottom: 0px;
  transition: 1s;

  z-index: 100;
}

.main
{
  background-color: rgba(189, 239, 255, 0.8);
  border: 2px rgba(99, 199, 204, 1);
  border-style: solid none solid solid;
  height: calc(80vh - 84px);
  padding: 40px;
  border-bottom-left-radius: 15px;

  float: right;
  display: inline block;
  overflow-y: auto;
}

.main::-webkit-scrollbar
{
  width: 0px;
} 

.left
{
  background-color: rgba(99, 199, 204, 1);
  border-bottom-left-radius: 10px;
  border-top-left-radius: 10px;
  padding-top: 30px;
  padding-bottom: 30px;
  width: 25px;

  float:right;
  display: table;
}

.cell
{
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  line-height: 1em;
}

</style>
