<template>
  <div class="main" :style="'height: ' + height + '; '">
    <slot></slot>
  </div>
</template>

<script>

export default {
  props: {
    height: {
      type: String
    }
  }
}
</script>

<style scoped>

.main
{
  width: 100%;
  font-size: 23px;

  position: fixed;
  top: 0;
  left: 0;
  background-color: rgb(48, 48, 48);
  color: white;
  z-index: 100000;
}

</style>