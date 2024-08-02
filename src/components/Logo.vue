<template>
    <div class="home-logo" @click="handleBackHome">
        <el-image style="width:60px;height:50px;padding:5px 5px 0 5px;border-radius: 16px;background-color: white;" :src="logoUrl" lazy></el-image>
        <el-text><p>Coral<br>SCOP</p></el-text>
    </div>
</template>

<script lang="ts" setup>
import logoUrl from '@/assets/coral_logo.png'
import { useRouter } from 'vue-router'
const router = useRouter()
const handleBackHome = () => {
    router.push('/');
}
</script>

<style  scoped>
.home-logo {
    position: absolute;
    top: 0;
    left: 30px;
    margin:0;
    padding:0;
    background-color: white;
    border-radius: 8px;
    z-index: 800;
    cursor: pointer;
    p {
        margin: 0;
        padding: 0;
        font-family: MarkerFelt;
        font-weight: bold;
        font-size: 20px;
    }
}
</style>