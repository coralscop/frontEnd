<template>
    <el-dialog 
        append-to-body
        width="500"
        class="signin-dialog"
        :show-close="false"
        v-model="dialogSignUpVisible"
        @keyup.enter="submitSignup"
    >
        <template #header="{ close }">
            <div class="form-title">
                <p v-if="signUpState == 'form'">Sign Up</p>
                <p v-if="signUpState == 'success'">Sign Up Success</p>
                <el-icon  @click="close"><Close /></el-icon>
                <!-- <el-button :icon="Close" style="width: 8px; height:8px; padding: 8px;" @click="close" /> -->
            </div>
        </template>

        <el-form class="form" v-if="signUpState == 'form'" ref="signUpFormRef" :model="signUpData" :rules="signUpDataRules" :label-position="'top'" style="max-width: 600px; margin: 20px;" label-width="auto">
            
            <el-form-item label="Email" prop="email"><el-input v-model="signUpData.email" clearable placeholder="Enter your email" /></el-form-item>
                
            <el-form-item label="Name" prop="fullname"><el-input v-model="signUpData.fullname" clearable placeholder="6-12 charaters, only letter and digit"  /></el-form-item>
                
            <el-form-item label="Password" prop="password"><el-input v-model="signUpData.password" clearable placeholder="6-12 charaters, only letter and digit, at least 1 upper letter" type="password"  /></el-form-item>
            
            <button type="button" class="submit" @click="submitSignup">Sign Up</button>

            <p class="signup-link">
                Already have an account?
                <span class="link-span" @click="handleTurnLogin">Log in</span>
            </p>

            <p style="color: red;" class="tips">{{ errorMsg }}</p>
        </el-form>

        <div v-if="signUpState == 'success'">
            <div class="success-animation">
                <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg>
            </div>
            <p  class="tips"><span class="link-span" @click="handleTurnLogin">Log in</span> with {{ signUpData.email }}</p>
            <!-- <button type="submit" class="submit" @click="handleSignUp">Continue</button> -->
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { FormRules } from 'element-plus';
import { Close } from '@element-plus/icons-vue'
// axios api setting
axios.defaults.baseURL =
  process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";
//   axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
  const base = process.env.NODE_ENV === "development" ? "/bke" : "";

const emit = defineEmits(['openLogin']);
const dialogSignUpVisible = ref(false);
const signUpFormRef = ref();
const signUpData = ref({
        email: '',
        password: '',
        fullname: '',
    });
const signUpDataRules:Ref<FormRules> = ref({
    email: [
        {required: true, message: 'Please enter email address', trigger: 'blur'},
        {type: 'email', message: 'Please input correct email address', trigger: ['change','blur'] },
    ],
    password: [
        { required: true, message: 'Please enter password', trigger: 'blur' },
        { pattern: /^(?=.*[A-Z])[A-Za-z0-9]{6,12}$/, message: 'Please enter a valid password', trigger: ['change','blur'] },
    ],
    fullname: [
        { required: true, message: 'Please enter fullname', trigger: 'blur' },
        { pattern: /^[A-Za-z0-9]{6,12}$/, message: 'Please enter a valid fullname', trigger: ['change','blur'] },
    ],
});
const signUpState = ref('form');
const errorMsg = ref('');

const handleSignUp = async () => {
    try {
        console.log("===SignUp===");
        // console.log(process.env.NODE_ENV);
        // console.log(base);
        axios.defaults.baseURL =
          process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";

        const result = await axios.post(base+'/api/v1/user/signup', signUpData.value, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log(result.status);
        if (result.status == 200) {
            signUpState.value = 'success';
        } else {
            errorMsg.value = result.data.detail[0].msg;
        }
        
    } catch (err: any) {
        console.error(err);
        if (err.response.data.detail[0].msg) {
            errorMsg.value = err.response.data.detail[0].msg;
        } else {
            errorMsg.value = err.response.data.detail;
        }
        // console.log(err.response.data.detail);
        
    }
};

const submitSignup = async () => {
    const formInstance = signUpFormRef.value as any;
    formInstance.validate(async (valid: boolean) => {
        if (valid) {
            handleSignUp();
        } else {
            // Form validation failed, display error messages
        }
    });
};

const handleTurnLogin = () => {
    dialogSignUpVisible.value = false;
    emit('openLogin');
}

const open = () => {
  dialogSignUpVisible.value = true;
}

defineExpose({
    open
})

</script>

<style>
.signin-dialog {
    border-radius: 20px;
    padding: 20px;
}
.signin-dialog .el-dialog__header {
    margin:0;
    padding:0;
}

.form {
  background-color: #fff;
  display: block;
  padding: 1rem;
  max-width: 350px;
}

.form-title {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 0;
  margin: 0;
}
.form-title p {
    font-size: 28px;
    line-height: 1.75rem;
    font-weight: 600;
    text-align: center;
    color: #000;
    margin: 10px 0 0 0;
  }
.form-title .el-icon {
    position: absolute;
    right: 15px;
    top: 15px;
    cursor: pointer;
    width: 20px;
    height: 20px;
    color: #6B7280;
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

.signup-link a {
  text-decoration: underline;
}

.success-animation { margin:50px auto;}

.checkmark {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: block;
    stroke-width: 2;
    stroke: #4bb71b;
    stroke-miterlimit: 10;
    box-shadow: inset 0px 0px 0px #4bb71b;
    animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
    position:relative;
    top: 5px;
    right: 5px;
   margin: 0 auto;
}
.checkmark__circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: 2;
    stroke-miterlimit: 10;
    stroke: #4bb71b;
    fill: #fff;
    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
 
}

.checkmark__check {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
    100% {
        stroke-dashoffset: 0;
    }
}

@keyframes scale {
    0%, 100% {
        transform: none;
    }

    50% {
        transform: scale3d(1.1, 1.1, 1);
    }
}

@keyframes fill {
    100% {
        box-shadow: inset 0px 0px 0px 30px #4bb71b;
    }
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
