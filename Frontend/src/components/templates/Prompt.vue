<template>
  <div class="main" v-show="show">
    <div class="prompt">
      <div class="box">
        <slot>
        </slot>
      </div>
    </div>
    <div v-on:click='show = !show' class="main" style="background-color: rgba(0, 0, 0, 0.4); z-index: 100px;">
    </div>
  </div>
</template>

<script>

export default {
  data () {
    return{
      show: 0
    }
  },
  methods: {
  },
  components: {
  }
}
</script>

<style scoped>

.main
{
    width: 100vw;
    height: 100vh;

    position: fixed;
    top: 0px;
    left: 0px;
}

.box
{
  margin: 0px auto;
}

.prompt
{
  position: fixed;
  top: 40vh;
  z-index: 101;
  
  left: 50%;
  transform: translate(-50%, -50%);
}

</style>