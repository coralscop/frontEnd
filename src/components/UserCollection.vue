<template>
    <Logo></Logo>
    <div class="collection-page">
        <div class="user-info">
            <div class="usr-cover" :style="{ 'background-image': 'url(' + usrBgUrl + ')' }"></div>
            <div class="usr-banner">
                <div class="usr-avatar">
                    <el-avatar style="position: relative; top: -30px; margin-left: 120px;" :icon="UserFilled"
                        :size="80" />
                </div>
                <span>{{ userStore.userInfo.fullname }}</span>
            </div>
        </div>
        <div class="collection-menu">
            <el-menu :default-active="activeIndex" mode="horizontal">
                <el-menu-item index="1">All Images</el-menu-item>
            </el-menu>
        </div>
        <div class="collection-content">
            <div class="collection-statistic">
                <svg t="1719857738915" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="11490" width="24" height="24">
                    <path
                        d="M512 949.138286c238.72 0 437.138286-197.997714 437.138286-437.138286 0-238.72-198.857143-437.138286-437.577143-437.138286C272.438857 74.861714 74.88 273.28 74.88 512c0 239.140571 197.997714 437.138286 437.138286 437.138286z m-116.150857-217.289143c-18.432 0-32.146286-15.853714-28.288-33.846857l18.011428-89.142857h-40.283428c-14.994286 0-25.709714-11.154286-25.709714-26.148572 0-17.554286 12.854857-30.427429 29.988571-30.427428h48l19.291429-91.282286H377.417143c-14.994286 0-26.148571-11.154286-26.148572-26.569143 0-17.152 13.293714-30.427429 30.006858-30.427429h47.579428l19.712-92.16c2.998857-17.133714 14.153143-25.709714 32.146286-25.709714 18.852571 0 31.707429 15.872 27.849143 33.865143l-17.133715 84.004571h83.565715l19.291428-92.16c3.419429-17.133714 14.994286-25.709714 32.566857-25.709714 18.432 0 31.725714 15.433143 28.288 33.865143l-17.152 84.004571h39.862858c14.573714 0 25.289143 11.154286 25.289142 26.569143 0 17.554286-12.434286 30.427429-29.988571 30.427429h-47.158857l-19.712 91.282286h39.424c14.994286 0 25.728 11.154286 25.728 26.148571 0 17.554286-12.854857 30.427429-30.006857 30.427429h-46.72l-20.571429 96.859428c-3.419429 17.133714-14.994286 26.148571-33.426286 26.148572-17.993143 0-30.848-15.872-27.428571-33.865143l18.432-88.722286h-83.565714l-20.571429 96.438857c-2.998857 17.133714-14.153143 26.148571-31.725714 26.148572z m60.434286-174.427429h90.422857l21.010285-100.699428H477.257143z"
                        p-id="11491" fill="#129fe1"></path>
                </svg>
                <p>{{ totalImageNum.toLocaleString() }}</p>
                <p>images</p>

            </div>
            <div class="collection-tool">
                <span @click="selectVisible = true" v-if="!selectVisible">
                    <el-icon><CircleCheck /></el-icon>
                    <p>Select</p>
                </span>
                <p v-show="selectVisible"><el-checkbox v-model="selectAll" label="" size="large" @change="handleSelectAll(selectAll)" />Select All</p>

                <div v-show="selectVisible">
                    <el-button class="batch-process-btn collection-btn" @click="handleBatchProcess">Run</el-button>
                    <el-button class="normal-btn collection-btn" @click="handleConfig">Config</el-button>
                    <el-button class="normal-btn collection-btn" @click="handleDownload">Download</el-button>
                    <el-button class="normal-btn collection-btn" @click="handleCancelSelect">Cancel</el-button>
                </div>

            </div>

            <el-row :gutter="0" class="collection-row">
                <el-col class="collection-col" :xs="10" :sm="7" :md="5" :lg="5" @click="uploadFormVisible = true">
                    <el-card class="upload-card" shadow="hover"
                        :body-style="{ padding: '10px', boxSizing: 'border-box', width: '100%' }">
                        <div class="upload-icon">
                            <svg t="1719659365378" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="5045" width="100" height="100">
                                <path
                                    d="M512 402.285714l146.285714 182.857143h-109.714285v256h-73.142858v-256h-109.714285l146.285714-182.857143z m0-256a256.036571 256.036571 0 0 1 254.171429 225.389715 237.750857 237.750857 0 0 1-44.507429 469.321142L713.142857 841.142857H658.285714v-73.142857h53.577143l7.241143-0.109714a164.571429 164.571429 0 0 0 38.436571-322.962286l-7.570285-1.938286-50.322286-11.446857-6.070857-51.2a182.893714 182.893714 0 0 0-361.947429-8.301714l-1.170285 8.265143-6.070858 51.2-50.285714 11.446857a164.571429 164.571429 0 0 0 29.037714 324.864L310.857143 768H365.714286v73.142857H310.857143a237.714286 237.714286 0 0 1-53.028572-469.504A256 256 0 0 1 512 146.285714z"
                                    fill="#515151" p-id="5046"></path>
                            </svg>
                        </div>
                        <div class="upload-text"><span>Click to upload image</span></div>
                    </el-card>
                </el-col>
                <el-col class="collection-col" :xs="10" :sm="7" :md="6" :lg="5" v-for="(item, index) in imageList"
                    :key="index">

                    <el-checkbox v-model="item.bpCheck" label="" size="large" v-show="selectVisible"
                        class="batch-process-checkbox" />
                    <el-card shadow="hover" :body-style="{ padding: '10px', boxSizing: 'border-box', width: '100%' }">
                        <svg v-show="item.isDone" style="position: absolute; top:0; right: 0; z-index: 15;" width="50" height="50" xmlns="http://www.w3.org/2000/svg" t="1721791036512" class="icon" version="1.1" p-id="47307"><g><title>Layer 1</title><g><g><title>Layer 1</title><g stroke="null"><g stroke="null"><title stroke="null">Layer 1</title><g stroke="null"><path p-id="47308" fill="#409eff" d="m-0.10472,-0.12324l23.02389,0l27.18556,27.22487l0,23.02162l-50.20945,-50.24649l0,-0.00001l0,0.00001z" stroke="null"/></g><text xml:space="preserve" text-anchor="start" font-family="Noto Sans JP" font-size="24" id="svg_8" y="44.82062" x="28.67433" stroke-width="0" fill="#ffffff" transform="matrix(0.352269 0.355564 -0.354549 0.353278 22.1903 -16.543)" stroke="null">DONE</text></g></g></g></g></g></svg>
                        <el-image :src="'https://coralscop-bke.hkustvgd.com/usr_imgs/' + item.image_name"
                            lazy></el-image>
                        <div class="collection-item-info">
                            <p class="collection-item-site">Site: {{ item.loc }} - {{formatNumber(item.geo.coordinates[0], 2) }},{{ formatNumber(item.geo.coordinates[1], 2)}}</p>
                            <ul class="collection-item-tool">
                                <li class="collection-item-btn" @click="handleImageInfo(item)"><span v-if="item.isDone">Rerun</span><span v-else>Run</span></li>
                                <li class="collection-item-btn"  @click="handleResultInfo(item)">Result</li>
                            </ul>
                        </div>
                    </el-card>
                </el-col>

            </el-row>
        </div>
        <el-dialog append-to-body width="650px" top="5vh" title="Upload Image" v-model="uploadFormVisible"
            destroy-on-close draggable :close-on-click-modal=false :close-on-press-escape=false
            @close="handleUploadClose" :show-close="false">
            <template #header="{ close }">
                <div class="form-title">
                    <p>Upload Image</p>
                    <el-icon @click="close">
                        <Close />
                    </el-icon>
                </div>
            </template>
            <el-form v-if="uploadImageStatus == 'ready'" ref="newImageFormRef" :model="newImageData"
                :rules="newImageRules" :label-position="'left'" style="max-width: 600px; margin: 20px;"
                label-width="auto" status-icon>
                <el-form-item label="Latitude" prop="latitude">
                    <el-input v-model="newImageData.latitude" @blur="handleUpdateSite" />
                </el-form-item>
                <el-form-item label="Longitude" prop="longitude">
                    <el-input v-model="newImageData.longitude" @blur="handleUpdateSite" />
                </el-form-item>
                <el-form-item label="Site" prop="site">
                    <span>{{ newImageData.site }}</span>
                    <!-- <el-input v-model="newImageData.site" /> -->
                </el-form-item>
                <el-form-item label="Images" prop="imageFile">
                    <el-upload :http-request="handleUploadUsrImg" multiple accept="image/" class="upload-demo"
                        v-model:file-list="preUploadImgList" list-type="picture-card" :show-file-list="true">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        <template #file="{ file }">
                            <div>
                                <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                                <el-progress type="circle" :percentage="getFileProgress(file)"
                                    v-show="getFileStatus(file)" />
                                <span class="el-upload-list__item-actions">
                                    <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                                        <el-icon><zoom-in /></el-icon>
                                    </span>
                                    <span v-if="!disabled" class="el-upload-list__item-delete"
                                        @click="handleRemove(file)">
                                        <el-icon>
                                            <Delete />
                                        </el-icon>
                                    </span>
                                </span>
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>
                <div class="middle-form-item">
                    <el-button type="primary" @click="submitForm">Upload</el-button>
                </div>
                <p style="color: red;" class="tips">{{ errorMsg }}</p>
            </el-form>
            <el-result v-if="uploadImageStatus == 'success'" icon="success" title="Success Upload"
                sub-title="Please check in collection page"></el-result>
        </el-dialog>
        <el-dialog width="80%" top="60px" v-model="uploadPreviewDialogVisible" :show-close="false">
            <template #header="{ close }">
                <div class="form-title">
                    <p>Image Preview</p>
                    <el-icon @click="close">
                        <Close />
                    </el-icon>
                </div>
            </template>
            <el-image :src="dialogImageUrl" alt="Preview Image" lazy></el-image>
        </el-dialog>
        <el-dialog append-to-body destroy-on-close v-model="imageInfoDialogVisible" width="100%"
            class="image-info-dialog" :show-close="false">
            <template #header="{ close }">
                <div class="form-title">
                    <el-icon @click="close">
                        <Close />
                    </el-icon>
                </div>
            </template>
            <div class="image-info-content">
                <AutoModel :usrMode="'collection'" :imageUrl="currentImageInfoUrl" :imageName="currentImageName">
                </AutoModel>
            </div>
        </el-dialog>
        <el-dialog append-to-body destroy-on-close v-model="imageResultDialogVisible" width="100%" :lock-scroll="true"
            class="image-info-dialog" :show-close="false">
            <template #header="{ close }">
                <div class="form-title">
                    <el-icon @click="close">
                        <Close />
                    </el-icon>
                </div>
            </template>
            <div class="image-info-content">
                <ImageResult :imageUrl="currentImageInfoUrl" :maskUrl="currentMaskUrl" :jsonData="currentJson"></ImageResult>
                <!-- <AutoModel :usrMode="'collection'" :imageUrl="currentImageInfoUrl" :imageName="currentImageName"></AutoModel> -->
            </div>
        </el-dialog>
    </div>
    <el-backtop :right="30" :bottom="50" />
</template>

<script lang="ts" setup>
import usrBgUrl from '@/assets/P8093252.png'

import type { UploadFile, UploadRequestHandler } from 'element-plus'
import { UserFilled, Delete, Plus, ZoomIn,Close,CircleCheck } from '@element-plus/icons-vue'
import { loadImage } from '@/helper/loadImage'

// axios setting
import axios from 'axios'
// axios api setting
axios.defaults.baseURL =
    process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";
// const base = process.env.NODE_ENV === "development" ? "/api" : "";
// axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
const bkebase = process.env.NODE_ENV === "development" ? "/bke" : "";

import { userInfoStore } from '@/store/user'
const userStore = userInfoStore();

const activeIndex = ref('1');
const imageList = ref();
const totalImageNum = ref(0);

// uploaded image info
const imageInfoDialogVisible = ref(false);
var currentImageInfoUrl = '';
var currentImageName = '';
var currentMaskUrl = '';
var currentJson = '';

// upload new user image
const preUploadImgList = ref([]);
const uploadFormVisible = ref(false);
const newImageFormRef = ref();
const uploadImageStatus = ref('ready');
const errorMsg = ref('');
const uploadProgressList = ref(<any>[]);
// image preview dialog
const dialogImageUrl = ref('')
const uploadPreviewDialogVisible = ref(false)
const disabled = ref(false)

const selectVisible = ref(false)
const selectAll = ref(false)

const imageResultDialogVisible = ref(false)

const newImageData = ref({
    imageFile: <File[]>[],
    latitude: 22.23,
    longitude: 114.32,
    site: 'Hong Kong',
})
const newImageRules = ref({
    imageFile: [{
        required: true,
        message: 'Please select an image file',
        trigger: 'change',
    }],
    longitude: [
        { required: true, message: 'Please enter the longitude', trigger: 'change' },
        { pattern: /^-?((1?[0-7]?[0-9](\.\d+)?)|180(\.0+)?)$/, message: 'Please enter a valid longitude', trigger: 'change' },
    ],
    latitude: [
        { required: true, message: 'Please enter the latitude', trigger: 'change' },
        { pattern: /^-?((([0-8]?[0-9](\.\d+)?)|90(\.0+)?))$/, message: 'Please enter a valid latitude', trigger: 'change' },
    ],
})

const getAllUsrImages = async () => {
    try {
        // https://coralscop-bke.hkustvgd.com/api/v1/user/images
        axios.defaults.baseURL =
            process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";

        var res = await axios.get(bkebase + '/api/v1/user/images', {
            headers: {
                Authorization: 'Bearer ' + userStore.userInfo.token
            }
        });
        // console.log(res);
        if (res.status == 200) {
            imageList.value = res.data;
            // console.log(imageList.value);
            imageList.value = await Promise.all(imageList.value.map(async (item) => {
                var newItem = item;
                var sitename = await getSiteName(item['geo']['coordinates'][1],item['geo']['coordinates'][0])
                newItem['loc'] = sitename;
                newItem['bpCheck'] = false;
                var isDone = await checkResult(item['image_name']);
                if (isDone) {
                    newItem['isDone'] = true;
                    newItem['output_paths'] = isDone;
                } else {
                    newItem['isDone'] = false;
                }
                return newItem;
            }));
            totalImageNum.value = imageList.value.length;
            // console.log(imageList.value);
        }
    } catch (error) {
        console.error(error);
    }
}

const getFileProgress = (file) => {
    let progress = uploadProgressList.value.filter(item => item.file.uid == file.raw.uid);
    // console.log(progress);
    if (progress.length) {
        return progress[0]['progress'];
    } else {
        return 0;
    }

}

const getFileStatus = (file) => {
    let progress = uploadProgressList.value.filter(item => item.file == file.raw);
    if (progress.length) {
        return progress[0]['status'] == 'loading' || progress[0]['status'] == 'success';
    } else {
        return false;
    }
}

const uploadUsrImage = async (formData: FormData) => {
    try {
        console.log("===upload usr image===");
        // console.log(formData.get('coord_lat'));
        // https://coralscop-bke.hkustvgd.com/api/v1/inference/upload
        axios.defaults.baseURL =
            process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";
        const result = await axios.post(bkebase + '/api/v1/inference/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: 'Bearer ' + userStore.userInfo.token
            },
            onUploadProgress(e) {
                // console.log(e.event);
                let progress = uploadProgressList.value.filter(item => item.file == formData.get('image_file'));
                if (progress.length) {
                    progress[0]['progress'] = Number(((e.event.loaded / e.event.total) * 100).toFixed(2));
                    progress[0]['status'] = 'loading';
                }
            }
        });
        // console.log(result);
        if (result.status == 200) {
            let progress = uploadProgressList.value.filter(item => item.file == formData.get('image_file'));
                if (progress.length) {
                    progress[0]['status'] = 'success';
                }
        }
    } catch (err: any) {
        console.error(err);
        if (err.response.data) {
            errorMsg.value = err.response.data.detail[0].msg;
        } else {
            errorMsg.value = err;
        }
    }
}

const handlePictureCardPreview = (file: UploadFile) => {
    dialogImageUrl.value = file.url!
    uploadPreviewDialogVisible.value = true
}

const handleUploadUsrImg = (item): UploadRequestHandler | undefined => {
    // console.log(item.file);
    // console.log(uploadImgList.value);
    if (newImageData.value.imageFile == null) {
        newImageData.value.imageFile = [];
    }
    newImageData.value.imageFile.push(item.file);
    
    uploadProgressList.value.push({'file':item.file,'progress':0.0, 'status':'ready'});
    // console.log(preUploadImgList.value);
    // console.log(newImageData.value);
    return undefined;
}

const uploadAllImages = async () => {
    for (const item of newImageData.value.imageFile) {
        let formData = new FormData();
        let lat: string = newImageData.value.latitude.toString();
        let long: string = newImageData.value.longitude.toString();
        formData.append('coord_lat', lat);
        formData.append('coord_long', long);
        formData.append('image_file', item);
        await uploadUsrImage(formData);
    }
    return true;
}

const submitForm = async () => {
    const formInstance = newImageFormRef.value as any;
    formInstance.validate(async (valid: boolean) => {
        if (valid) {
            disabled.value = true;
            // Form is valid, proceed with submitting the form
            let res = await uploadAllImages();
            if (res) uploadImageStatus.value = 'success';
        } else {
            // Form validation failed, display error messages
        }
    });
};
const handleRemove = (file) => {
    dialogImageUrl.value = '';
    uploadPreviewDialogVisible.value = false;
    // console.log(newImageData.value.imageFile);
    // console.log(file);
    newImageData.value.imageFile = newImageData.value.imageFile.filter(item => item != file.raw);
    // console.log(newImageData.value.imageFile);
    // console.log(preUploadImgList.value);
    preUploadImgList.value = preUploadImgList.value.filter(item => item != file);
    // console.log(preUploadImgList.value);
    uploadProgressList.value = uploadProgressList.value.filter(item => item != file.raw);
}

const handleUploadClose = () => {
    preUploadImgList.value = [];
    newImageData.value = {
        imageFile: <File[]>[],
        latitude: 22.23,
        longitude: 114.32,
        site: 'Hong Kong',
    };
    uploadImageStatus.value = 'ready';
    uploadProgressList.value = [];
    getAllUsrImages();
    disabled.value = false;
}

const formatNumber = (numberString, precision) => {
  const floatValue = parseFloat(numberString);
  const formattedNumber = floatValue.toFixed(precision);
  return formattedNumber;
};

const handleImageInfo = (image) => {
    imageInfoDialogVisible.value = true;
    currentImageName = image.image_name;
    currentImageInfoUrl = 'https://coralscop-bke.hkustvgd.com/usr_imgs/' + image.image_name;
}

const checkResult = async (imageName) => {
    axios.defaults.baseURL =
        process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";
    var result = await axios.get(bkebase + '/api/v1/inference/result', {
        params: {
            'image_name': imageName,
        },
        headers: {
            Authorization: 'Bearer ' + userStore.userInfo.token
        },
    });
    // console.log(result);
    if (result.status == 200) {
        if (result.data.isDone == 1) {
            return result.data.data.output_paths;
        } else {
            return false;
        }
    }
}
const modifyMaskColor = async (imgSrc: string, color: number[]) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await loadImage(imgSrc);
    
    canvas.height = img.height;
    canvas.width = img.width;
    if (ctx) {
        // ctx.globalAlpha = 0.6;
        ctx.drawImage(img, 0, 0);
        // maskUrl = canvas.toDataURL();
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        for (let idx = 0; idx < data.length; idx += 4) {
            if (data[idx] > 250) {
                data[idx] = color[0];
                data[idx + 1] = color[1];
                data[idx + 2] = color[2];
                data[idx + 3] = 255*0.6;
            } else {
                data[idx] = 0;
                data[idx + 1] = 0;
                data[idx + 2] = 0;
                data[idx + 3] = 0;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        // resultMaskUrl.value = canvas.toDataURL();
        canvas.toBlob(blob => {
            if (blob) currentMaskUrl = URL.createObjectURL(blob);
        });
    }
}
const coralColor = [78, 1, 136, 53];

const handleResultInfo = async (image) => {
    console.log("==== result info ====");
    currentImageInfoUrl = 'https://coralscop-bke.hkustvgd.com/usr_imgs/' + image.image_name;

    axios.defaults.baseURL =
    process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";

    var resMaskPath = image.output_paths.mask_image.replace(/\.\//, '');
    var resJsonPath = image.output_paths.json.replace(/\.\//, '');

    var resultMask = await axios.get(bkebase + resMaskPath, {
        responseType: 'arraybuffer',
        headers: {
            Authorization: 'Bearer ' + userStore.userInfo.token,
            // 'Access-Control-Allow-Origin': '*'
        }
    });
    const maskBlob = new Blob([resultMask.data], { type: resultMask.headers['content-type'] });
    let maskUrl = URL.createObjectURL(maskBlob);
    modifyMaskColor(maskUrl,coralColor);

    var json = await axios.get(bkebase + resJsonPath, {
        headers: {
            Authorization: 'Bearer ' + userStore.userInfo.token,
            // 'Access-Control-Allow-Origin': '*'
        }
    });
    currentJson = JSON.stringify(json);

    imageResultDialogVisible.value = true;
}

const handleUpdateSite = async () => {
    newImageData.value.site = await getSiteName(newImageData.value.latitude,newImageData.value.longitude);
}

const getSiteName = async (latitude,longitude) => {
    var res = await axios.get('https://api.bigdatacloud.net/data/reverse-geocode-client', {
        params: {
            latitude: latitude,
            longitude: longitude,
            localityLanguage: 'en',
        }
    });
    // console.log(res.data.locality);
    return res.data.locality;
}

const handleSelectAll = (select: boolean) => {
    imageList.value.map(img => img['bpCheck'] = select);
}

const handleCancelSelect = () => {
    imageList.value.map(img => img['bpCheck'] = false);
    selectVisible.value = false;
}

const handleConfig = () => {

}

const handleDownload = () => {

}

const handleBatchProcess = () => {

}

onMounted(() => {
    getAllUsrImages();
})


</script>

<style>
.collection-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: center;
    justify-content: center;
}

.usr-cover {
    width: 100%;
    height: 140px;
}

.usr-banner {
    position: relative;
    /* top: -20px; */
    display: flex;
    flex-direction: row;
    gap: 20px;
    /* margin: 0 40px 0 40px ; */
    background-color: white;

    span {
        font-size: 28px;
        font-weight: 600;
        ;
    }
}

.collection-menu .el-menu {
    padding-left: 72px;
}
.collection-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: center;
    justify-content: center;
    margin: 20px 0 60px 0;
}
.collection-content .collection-statistic {
    display: flex;
    flex-direction: row;
    position: relative;
    padding-left: 72px;
    text-align: center;
    justify-items: flex-start;
    margin: 10px;
    gap: 8px;
}
.collection-content .collection-statistic svg {
    padding-top: 5px;
}
.collection-content .collection-statistic p {
    color: #6B7280;
    font-size: 16px;
    margin: 0;
    padding-top: 5px;
}
.collection-content .collection-tool {
    display: flex;
    flex-direction: row;
    padding-left: 80px;
    padding-right: 90px;
    margin: 10px;
    justify-content: space-between;
}
.collection-content .collection-tool span {
    display: flex;
}
.collection-content .collection-tool svg {
    padding-top: 10px;
    /* padding-right: 10px; */
}
.collection-content .collection-tool p {
    cursor: pointer;
    margin: 0;
    padding-left: 5px;
}
.collection-btn {
    width: 80px;
    align-items: center;
    font-family: system-ui, -apple-system, system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 16px;
    font-weight: 600;
    justify-content: center;
    line-height: 1;
    min-height: 1rem;
    padding: calc(.5rem - 1px) calc(2rem - 1px);
    transition: all 250ms;
}
.collection-btn:hover {
    background-color: white;
}
.collection-content .collection-tool .batch-process-btn {
    /* background: linear-gradient(to bottom right, #f3f4f6 , #e5e7eb ); */
    background: linear-gradient(to bottom right, #139FE1, #70B4D5);
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: #70B4D5 0 1px 3px 0;
    box-sizing: border-box;
    color: white;
    cursor: pointer;
    display: inline-flex;
    touch-action: manipulation;
    vertical-align: baseline;
}
.collection-content .collection-tool .batch-process-btn:hover,
.collection-content .collection-tool .batch-process-btn:focus {
    border-color: rgb(229, 231, 235);
    box-shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;
    /* color: rgba(0, 0, 0, 0.65); */
}

.collection-content .collection-tool .batch-process-btn:hover {
    transform: scale(1.01);
    background-color: linear-gradient(to bottom right, #139FE1, #70B4D5);
}

.collection-content .collection-tool .batch-process-btn:focus,
.collection-content .collection-tool .batch-process-btn:focus-visible {
    border-color: rgba(229, 231, 235, 0.15);
    outline: 0;
}

.collection-content .collection-tool .batch-process-btn:active {
    background-color: #F0F0F1;
    border-color: rgba(229, 231, 235, 0.15);
    box-shadow: rgba(229, 231, 235 0.06) 0 2px 4px;
    color: rgba(0, 0, 0, 0.65);
    transform: translateY(0);
}
.collection-content .collection-row {
    width: 100%;
    padding-left: 72px;
    /* margin-right: 72px; */
    gap: 36px;
}

.collection-content .collection-row .collection-col {
    display: flex;
    text-align: center;
    position: relative;
    /* justify-items: center; */
    cursor: pointer;
}

.collection-content .collection-row .collection-col img {
    height: 100%;
    width: 100%;
    object-fit: cover;
}

.collection-content .collection-row .collection-col .batch-process-checkbox {
    position: absolute;
    left: 15px;
    top: 5px;
    z-index: 10;
}

.collection-content .collection-row .collection-col .collection-item-info {
    position: absolute;
    z-index: 3;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    transform: scale(0);
    transition: 0.5s;
    height: 100%;
    width: 100%;
    color: white;
    border-radius: 4px;
    background: -webkit-gradient(linear, left top, left bottom, color-stop(52%, rgba(0,0,0,0)), color-stop(53.94%, rgba(0,0,0,0.00345888)), color-stop(55.89%, rgba(0,0,0,0.014204)), color-stop(57.83%, rgba(0,0,0,0.0326639)), color-stop(59.78%, rgba(0,0,0,0.0589645)), color-stop(61.72%, rgba(0,0,0,0.0927099)), color-stop(73.67%, rgba(0,0,0,0.132754)), color-stop(75.61%, rgba(0,0,0,0.177076)), color-stop(77.56%, rgba(0,0,0,0.222924)), color-stop(79.5%, rgba(0,0,0,0.267246)), color-stop(81.44%, rgba(0,0,0,0.30729)), color-stop(83.39%, rgba(0,0,0,0.341035)), color-stop(85.33%, rgba(0,0,0,0.367336)), color-stop(87.28%, rgba(0,0,0,0.385796)), color-stop(89.22%, rgba(0,0,0,0.396541)), color-stop(91.17%, rgba(0,0,0,0.4)));
}
.collection-content .collection-row .collection-col:hover .collection-item-info {
    transform: scale(1);
    /* bottom: 25px; */
}
.collection-item-info .collection-item-site {
    position: relative;
    color: #fff;
    font-weight: 500;
    line-height: 1em;
    font-size: 0.8em;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    /* text-align: center; */
    /* align-self: flex-end; */
    padding: 5px 0 5px 15px;
    margin: 0;
}
.collection-item-info .collection-item-tool {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 6px;
    margin-top: 5px;
    padding:0;
    padding-left: 15px;
    /* top: 70%; */
}
.collection-item-info .collection-item-tool li {
    list-style: none;
}
.collection-item-info .collection-item-tool .collection-item-btn {
    padding: 2px 5px;
    font-weight: 400;
    font-size: 12px;
    /* min-height: 48px; */
    background: rgb(255, 255, 255);
    color: #139FE1;
    border-radius: 8px;
    border: 1px solid #139FE1;
    transition-duration: 1s;
    transition-property: border-top, border-left, border-bottom, border-right, box-shadow;

}
.upload-card {
    width: 100%;
    cursor: pointer;
}
.el-dialog .el-upload-list--picture-card .el-progress .el-progress__text {
    color: white;
    font-weight: 600;
}

.upload-card .upload-icon {
    margin: 10px;
}

.middle-form-item {
    display: flex;
    justify-content: center;
}
.image-info-dialog {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 40px 0 0 0;
    max-height: calc(100% - 40px);
    background-color: #FAFAFA;
    .el-dialog {
        margin: 0!important;
        max-height: calc(100% - 80px);
    }
    .el-dialog__body {
        overflow: auto;
        width: 100%;
        text-align: center;
    }
}
.image-info-dialog .image-info-content {
    display: flex;
    /* flex-direction: column; */
    justify-content: center;
}
</style>