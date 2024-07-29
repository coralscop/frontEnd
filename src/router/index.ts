import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Homepage from '@/components/Homepage.vue';
import Model from '@/components/Model.vue';
import UserManual from '@/components/UserManual.vue';
import Collection from '@/components/UserCollection.vue';

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
        path: "/collection",
        name: "collection",
        component: Collection,
    },


]
const router = createRouter({
    routes,
    history: createWebHistory('/')
})

export default router
