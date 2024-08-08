<template>
    <el-dialog 
        append-to-body
        width="500"
        class="userprofile-dialog"
        :show-close="false"
        v-model="dialogUserProfileVisible"
        @keyup.enter="updateUserInfo"
    >
        <template >
            <div class="form-title">
                <p v-if="updateInfoFormState == 'form'">Profile</p>
                <p v-if="updateInfoFormState == 'success'">Updated successfully</p>
            </div>
        </template>

        <el-form class="form" v-if="updateInfoFormState == 'form'" ref="updateUserInfoFormRef" :model="userData" :rules="userDataRules" :label-position="'top'" style="max-width: 600px; margin: 20px;" label-width="auto">
            
            <el-form-item label="Email" prop="email"><el-input v-model="userData.email" disabled placeholder="Enter your email" /></el-form-item>
                
            <el-form-item label="Full name" prop="fullname"><el-input v-model="userData.fullname" clearable placeholder="6-12 charaters, only letter and digit"  /></el-form-item>
            
            <el-form-item label="Current password" prop="current_password"><el-input v-model="userData.current_password" clearable  type="password"  show-password /></el-form-item>
            <el-form-item label="Password" prop="new_password"><el-input v-model="userData.new_password" clearable placeholder="6-12 charaters, only letter and digit, at least 1 upper letter" type="password"  show-password /></el-form-item>
            <el-form-item label="Password Confirm" prop="confirm_new_password"><el-input v-model="userData.confirm_new_password" clearable placeholder="6-12 charaters, only letter and digit, at least 1 upper letter" type="password" show-password /></el-form-item>
            
            <div class="mb-4" c>
                <el-button type="success" :icon="Edit" size="large" @click="updateUserInfo">Update</el-button>
                <el-button type="info" size="large" @click="cancelBtnHandler">Cancel</el-button>
            </div>

            <p style="color: red;" class="tips">{{ errorMsg }}</p>
        </el-form>

        <div v-if="updateInfoFormState == 'success'">
            <div class="success-animation">
                <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg>
            </div>
            <p  class="tips">Updated successfully</p>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
// import axios from 'axios'
import { FormRules } from 'element-plus';
import { Edit } from '@element-plus/icons-vue'
import { userInfoStore } from '@/store/user'
import {apiInstance} from '@/services/api';
// axios api setting
// axios.defaults.baseURL =
//   process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";
// //   axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
//   const base = process.env.NODE_ENV === "development" ? "/bke" : "";

const userStore = userInfoStore();
const dialogUserProfileVisible = ref(false);
const updateUserInfoFormRef = ref();
const userData = ref({
        email: userStore.getUserInfo.email,
        current_password: null,
        new_password: null,
        confirm_new_password: null,
        fullname: userStore.getUserInfo.fullname,
    });



const validatePass2 = (value: any, callback: any) => {
  if (value !== userData.value.new_password) {
    callback(new Error(`Two inputs don't match!`))
  } else {
    callback()
  }
}

const userDataRules:Ref<FormRules> = ref({
    new_password: [
        { required: false, message: 'Please enter password', trigger: 'blur' },
        { pattern: /^(?=.*[A-Z])[A-Za-z0-9]{6,12}$/, message: 'Please enter a valid password', trigger: ['change','blur'] },
    ],
    confirm_new_password: [      
        { validator: validatePass2, trigger: 'blur'}
    ],
    fullname: [
        { required: false, message: 'Please enter fullname', trigger: 'blur' },
        // { pattern: /^[A-Za-z0-9]{6,12}$/, message: 'Please enter a valid fullname', trigger: ['change','blur'] },
    ],
});
const updateInfoFormState = ref('form');
const errorMsg = ref('');

const handleUpdate = async () => {
    try {
        console.log("===usr info UPDATE===");
        // console.log(process.env.NODE_ENV);
        // console.log(base);
        // axios.defaults.baseURL =
        //   process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";
        
        const result = await apiInstance.put('/user/', userData.value, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userStore.userInfo.token}`
            },
        });
        // console.log(result.status);
        if (result.status == 200) {
            setTimeout( ()=>{
                updateInfoFormState.value = 'form'
            }, 1500);
            updateInfoFormState.value = 'success';
            //Update full name in cookies
            let updatedUserInfoInCookie = userStore.getUserInfo;
            updatedUserInfoInCookie.fullname = result.data.fullname;
            userStore.setUserInfo(updatedUserInfoInCookie);
             
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

const cancelBtnHandler = () => {
    dialogUserProfileVisible.value = false;
}

const updateUserInfo = async () => {
    const formInstance = updateUserInfoFormRef.value as any;
    formInstance.validate(async (valid: boolean) => {
        if (valid) {
            handleUpdate();
        } else {
            // Form validation failed, display error messages
        }
    });
};

const open = () => {
  dialogUserProfileVisible.value = true;
}

defineExpose({
    open
})

</script>

<style>


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
