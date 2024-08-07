import { defineStore } from 'pinia';
import { setCookie, getCookie, removeCookie } from '@/store/cookies';
export const userInfoStore = defineStore('userInfo', {
    state: () => ({
        isLogin: false,
        userInfo: {
            fullname: '',
            email: '',
            token: '',
        },
    }),
    persist: {
        enabled: true
    },
    getters: {        
        getUserInfo():any {
            const userInfo = JSON.parse(getCookie('userInfo'));
            if (userInfo) {
                this.userInfo = userInfo;
            }
            return this.userInfo;     
        }
    },
    actions: {
        setIsLogin(login: boolean) {
            this.isLogin = login;
            setCookie('isLogin', JSON.stringify(login), 30);
        },
        setUserInfo(info) {
            this.userInfo = info;
            setCookie('userInfo', JSON.stringify(info), 30);
        },
        loadFromCookie() {
            // console.log(getCookie('userInfo'));
            let cookieData = getCookie('userInfo');
            if (cookieData) {
                this.userInfo = JSON.parse(cookieData);
            }
            const isLogin = getCookie('isLogin');
            this.isLogin = isLogin?isLogin:false;
        },
        clearUserInfo() {
            this.isLogin = false;
            removeCookie('isLogin');
            this.userInfo = {
                fullname: '',
                email: '',
                token: '',
            };
            removeCookie('userInfo');
        },
    }
})

export const userDataStore = defineStore('userDataStore', {
    state: () => ({
        listOfCollections: <any>[]
    }),
    actions: {
        updateListOfCollections(newList) {
            this.listOfCollections = newList;
        }
    }
})