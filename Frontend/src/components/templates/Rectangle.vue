<template>
  <div class="font" :style="
'width: 300px; margin: 20px; display: table;' +
'; border-left: 15px solid ' + (color ? color : 'red') +
'; border-bottom: 3px solid ' + (color ? color : 'red') + 
'; height: ' + (height ? height : '40px') + ';'
">
    <div style="padding-left: 20px; display: table-cell; vertical-align: middle;">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'hello',
  props: {
    height: {
      type: String
    },
    color: {
      type: String
    }
  }
}
</script>

<style scoped>
.font {
  letter-spacing: 4px;
  font-weight: bold;
  font-size: 22px;
}
</style>
