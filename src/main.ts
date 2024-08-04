import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'
import './style.css'
import App from './App.vue'
import router from './router'
import { getCookie } from './store/cookies'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPersist)
app.use(router)
app.use(pinia)
app.mount('#app')

router.beforeEach((to, from, next) => {
  let isLogin = getCookie('isLogin');

  if (to.matched.some(record => record.meta.requiresAuth)) {
      // this route requires auth, check if logged in
      // if not, redirect to login page.
      if (!isLogin) {        
        next({ name: 'login', query:{ redirect: to.path?.toString()} })
      } else {
        next() 
      }
    } else {
      next()
    }
  })



