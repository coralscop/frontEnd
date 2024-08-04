import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Homepage from '@/components/Homepage.vue';
import Model from '@/components/Model.vue';
import UserManual from '@/components/UserManual.vue';
import Collection from '@/components/UserCollection.vue';
import Login from '@/components/Login.vue';



const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "home",
        component: Homepage,
    },
    {
        path: "/model",
        name: "model",
        component: Model,
    },
    {
        path: "/usermanual",
        name: "usermanual",
        component: UserManual,
    },
    {
        path: "/auth/login",
        name: "login",
        component: Login,
    },
    {
        path: "/collection",
        name: "collection",
        component: Collection,
        meta: {
            requiresAuth: true
          }
    },


]
const router = createRouter({
    routes,
    history: createWebHistory('/')
})


export default router
