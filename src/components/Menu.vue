<template>
    <label class="burger" for="burger">
        <input type="checkbox" id="burger" ref="menuInput" :onchange="handleShowMenu">
        <span></span>
        <span></span>
        <span></span>
    </label>
    <div class="menu" v-show="showMenu">
        <nav>
            <ul class="menu-content list-style-none">
                <li class="menu-items" v-for="(item, index) in navList" :key="index">
                    <RouterLink :to="item.path" class="menu-item" active-class="active-menu-item" @click="handleRoute" >{{ item.title }}</RouterLink>
                </li>

                <li class="menu-items" @click="handleShowLogin" v-if="!userLogin">
                    <span class="menu-item">Log In</span>
                    <Login ref=logInVisible @openSignup="handleTurnSignup"></Login>
                </li>
                <li class="menu-items" @click="handleShowSignup" v-if="!userLogin">
                    <span class="menu-item">Sign Up</span>
                    <Signup ref=signUpVisible @openLogin="handleTurnLogin"></Signup>
                </li>
                <li class="menu-items" @click="handleLogout" v-if="userLogin">
                    <span class="menu-item">Log out</span>
                </li>
            </ul>
        </nav>
        
        <div class="nav-bottom">
            <ul class="list-style-none r1">
                <li class="nav-item">
                    <a href="https://coralscop.hkustvgd.com/" target="_blank">Paper</a>
                </li>
                <li class="nav-item">
                    <a href="https://www.saikit.org/index.html" target="_blank">Contact us</a>
                </li>
            </ul>
        </div>
        
    </div>
</template>

<script lang="ts" setup>
import {userInfoStore} from '@/store/user';
import { useRouter } from 'vue-router';
import { jwtDecode } from "jwt-decode";

const showMenu = ref(false);
const menuInput = ref();
const logInVisible = ref();
const signUpVisible = ref();
const router = useRouter();

const userLogin = ref(false);
const userStore = userInfoStore();

var navList = [{
    title: 'Home',
    path: '/',
    show: true,
},{
    title: 'Our Model',
    path: '/model',
    show: true,
},{
    title: 'User Manual',
    path: '/usermanual',
    show: true,
},{
    title: 'Collection',
    path: '/collection',
    show: userStore.isLogin,
}];

const handleShowMenu = () => {
    showMenu.value = !showMenu.value;
}

const handleRoute = () => {
    menuInput.value.click();
}

const handleShowLogin = () => {
    logInVisible.value.open();
}

const handleShowSignup = () => {
    signUpVisible.value.open();
}

const handleTurnSignup = () => {
    handleShowSignup();
}
const handleTurnLogin = () => {
    handleShowLogin();
}

const handleLogout = () => {
    userStore.clearUserInfo();
    userLogin.value = false;
    //router.push('/');
    window.location.href = "/"
}
const checkTokenExp = (token:string) => {
    interface BKEToken {
        user_id: string;
        email: string;
        expires: number;
        }
    const decoded = jwtDecode<BKEToken>(token);
    // console.log(decoded);
    if (decoded.expires) {
        const tokenExp = decoded.expires;
        const currentTime = Math.floor(Date.now() / 1000);
        // console.log(tokenExp, currentTime);
        if (tokenExp > currentTime) return true;
    }
    return false;
}

const checkUserState = () => {
    console.log('====check user state====');
    userStore.loadFromCookie();
    if (userStore.isLogin) {
        userStore.isLogin = checkTokenExp(userStore.userInfo.token);
    }
    userLogin.value = userStore.isLogin;
    navList = navList.map(item => {
        let newItem = item;
        if (item.title == 'Collection') newItem.show = userStore.isLogin;
        return newItem;
    });
    navList = navList.filter(item => item.show);
}

onMounted(() => {
    checkUserState();
})

</script>

<style>
.menu {
    width: 20vw;
    height: 100vh;
    background-color: rgba(0, 51, 102, 0.8);
    /* background-color: rgba(19, 159, 225, 0.8); */
    backdrop-filter: blur(5px);
    /* opacity: 0.3; */
    max-width: 405px;
    padding: 0 30px 0 30px;
    margin: 0;
    display: flex;
    flex-flow: column wrap;
    justify-content: space-between;
    align-items: flex-start;
    overflow: auto;
    line-height: 1.2;
    /* z-index: 800; */
    transition: opacity .2s cubic-bezier(0, 0.55, 0.45, 1);
}
.list-style-none {
    list-style: none;
}
.menu-content {
    margin: 30vh 0 0 0;
    padding: 10px 0;
    padding-left: 0;
    max-width: 210px;
    text-align: left;
}
.menu-items {
    padding: 15px;
    cursor: pointer;
}
.menu-item {
    font-size: 26px;
    font-weight: 400;
    font-family: "Gilroy-Regular", Arial, sans-serif;
    padding: 15px;
    color: white;
}
.menu-item:hover {
    color: #cc9900;
}
.active-menu-item {
    text-decoration: underline #cc9900;    
    color: #cc9900;
}
.burger {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 35px;
    height: 25px;
    background: transparent;
    cursor: pointer;
    display: block;
    z-index: 20;
    opacity: 1;
    margin: 10px
}

.burger input {
  display: none;
}

.burger span {
    display: block;
    position: absolute;
    height: 4px;
    width: 100%;
    background: #139FE1;
    /* background: #cc9900; */
    border-radius: 9px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: .25s ease-in-out;
}

.burger span:nth-of-type(1) {
    top: 0px;
    transform-origin: left center;
}

.burger span:nth-of-type(2) {
    top: 50%;
    transform: translateY(-50%);
    transform-origin: left center;
}

.burger span:nth-of-type(3) {
    top: 100%;
    transform-origin: left center;
    transform: translateY(-100%);
}

.burger input:checked ~ span:nth-of-type(1) {
    transform: rotate(45deg);
    top: 0px;
    left: 5px;
    background: #cc9900;
}

.burger input:checked ~ span:nth-of-type(2) {
    width: 0%;
    opacity: 0;
    background: #cc9900;
}

.burger input:checked ~ span:nth-of-type(3) {
    transform: rotate(-45deg);
    top: 25px;
    left: 5px;
    background: #cc9900;
}
.nav-bottom {
    padding-bottom: 40px;
    animation: opacity .8s ease-out forwards;
}
.r1 {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #eac16d;
    padding: 0;
    gap: 16px;
    padding-bottom: 5px;
}
.nav-item {
    color: white;
    a {
        color: white;
    }
}
.nav-item:hover {
    a {
        color: #cc9900;
    }
}
</style>
  @/store/user