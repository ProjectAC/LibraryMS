// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './App'
import router from './router'

Vue.config.productionTip = false

Vue.use(VueResource)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  http: {
    emulateJSON: true,
    withCredentials: true
  },
  template: '<App/>',
  components: { App }
})

Vue.http.interceptors.push((request, next) => {
    request.credentials = true;
    next();
});