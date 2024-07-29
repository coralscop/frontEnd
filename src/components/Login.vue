<template>
    <el-dialog 
        append-to-body
        width="500"
        class="login-dialog"
        :show-close="false"
        v-model="dialogLogInVisible"
        @keyup.enter="submitLogin"
    >
        <template #header="{ close }">
            <div class="form-title">
                <p>Log in</p>
                <el-icon  @click="close"><Close /></el-icon>
            </div>
        </template>
        <el-form ref="loginFormRef" class="form" :model="loginData" :rules="loginDataRules" :label-position="'top'" style="max-width: 600px; margin: 20px;" label-width="auto">
            
            <el-form-item label="Email" prop="email"><el-input v-model="loginData.email" clearable placeholder="Enter email" /></el-form-item>
                
                
            <el-form-item label="Password" prop="password"><el-input v-model="loginData.password" clearable placeholder="Enter password" type="password"  /></el-form-item>
            
            <button type="button" class="submit" @click="submitLogin">Log in</button>

            <p class="signup-link">
                No account?
                <span class="link-span" @click="handleTurnSignup">Sign up</span>
            </p>

            <p style="color: red;" class="tips">{{ errorMsg }}</p>
        </el-form>
    </el-dialog>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { userInfoStore } from '@/store/user'
import { Close } from '@element-plus/icons-vue'
import { FormRules } from 'element-plus';
// axios api setting
axios.defaults.baseURL =
  process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";
// axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
const base = process.env.NODE_ENV === "development" ? "/bke" : "";

const dialogLogInVisible = ref(false);
const loginFormRef = ref();
const loginData = ref({
    email: '',
    password: '',
    token: '',
    fullname: '',
});
const loginDataRules:Ref<FormRules> = ref({
    email: [
        {required: true, message: 'Please enter email address', trigger: 'blur'},
        {type: 'email', message: 'Please input correct email address', trigger: 'blur' },
    ],
    password: [
        { required: true, message: 'Please enter password', trigger: 'blur' },
        { pattern: /^[A-Za-z0-9]{6,12}$/, message: 'Please enter a valid password', trigger: ['change','blur'] },
    ],
});
const userStore = userInfoStore();

const emit = defineEmits(['openSignup']);
const errorMsg = ref('');

const handleLogin = async () => {
    try {
        console.log("===login===");
        // console.log(process.env.NODE_ENV);
        // console.log(base);
        axios.defaults.baseURL =
            process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";

        const result = await axios.post(base+'/api/v1/user/login', loginData.value, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log(result);
        if (result.status == 200) {
            userStore.setIsLogin(true);
            loginData.value.token = result.data.access_token;
            loginData.value.password = '';
            const {password,...cookieData} = loginData.value;
            userStore.setUserInfo(cookieData);
            window.location.reload();
        } else {
            errorMsg.value = result.data.detail[0].msg;
            ElMessage.success(result.data.message);
        }
        console.log(userStore.isLogin);
        
    } catch (err: any) {
        console.error(err);
        if (err.response.data.detail[0].msg) {
            errorMsg.value = err.response.data.detail[0].msg;
        } else {
            errorMsg.value = err.response.data.detail;
        }
    }
};
const submitLogin = async () => {
    const formInstance = loginFormRef.value as any;
    formInstance.validate(async (valid: boolean) => {
        if (valid) {
            handleLogin();
        } else {
            // Form validation failed, display error messages
        }
    });
};
const handleTurnSignup = () => {
    dialogLogInVisible.value = false;
    emit('openSignup');
}

const open = () => {
    dialogLogInVisible.value = true;
}

defineExpose({
    open
})

</script>

<style>
.login-dialog {
    border-radius: 20px;
    padding: 20px;
}

.form {
  background-color: #fff;
  display: block;
  padding: 1rem;
  max-width: 350px;
}

.form-title {
  font-size: 28px;
  line-height: 1.75rem;
  font-weight: 600;
  text-align: center;
  color: #000;
  margin-top: 0;
}

.input-container {
  position: relative;
}

.input-container input, .form button {
  outline: none;
  border: 1px solid #e5e7eb;
  margin: 8px 0;
}

.input-container input {
  background-color: #fff;
  padding: 16px;
  /* padding-right: 3rem; */
  font-size: 0.875rem;
  line-height: 1.25rem;
  width: 288px;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.submit {
  display: block;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  background-color: #139FE1;
  color: #ffffff;
  font-size: 18px;
  line-height: 1.25rem;
  font-weight: 500;
  width: 100%;
  border-radius: 0.5rem;
  text-transform: uppercase;
}

.signup-link {
  color: #6B7280;
  font-size: 0.875rem;
  line-height: 1.25rem;
  text-align: center;
}

.link-span {
  color: #551A8B; /* Link color */
  cursor: pointer; /* Change cursor to pointer on hover */
  text-decoration: underline;
}

.tips {
    font-size: 16px;
    line-height: 1.75rem;
    font-weight: 500;
    text-align: center;
    color: #0c0c0c;
    margin-top: 0;
}

</style>
  @/store/user