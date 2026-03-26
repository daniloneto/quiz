import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Quasar, Dialog, Notify, Loading, LoadingBar } from 'quasar'
import quasarLang from 'quasar/lang/pt-BR'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import { createPinia } from 'pinia'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: { Dialog, Notify, Loading, LoadingBar },
  lang: quasarLang,
})

app.mount('#app')
