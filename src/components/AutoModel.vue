<template>
    <div class="model-container">
        <div class="model-setting">
            <div class="upload-container" v-if="upload">
                <el-upload ref="uploadImgRef" :file-list="imgFileList" accept="image/*" :http-request="handleUploadImg" :show-file-list="false" :limit="1" drag>
                    <div class="el-upload__text">Drop Image Here<br> -or- <br>Click to Upload</div>
                </el-upload>
            </div>

            <div class="upload-container" v-else>
                <el-progress v-if="!imageUrl" :text-inside="true" :stroke-width="16" :percentage="imgProgress"
                    status="success" />
                <div v-if="imageUrl && usrMode === 'try'" class="img-btn-group">
                    <el-button :icon="Close" style="width: 8px; height:8px; padding: 8px;" @click="handleRemove" />
                </div>
                <el-image v-if="imageUrl" class="upload-image" :src="imageUrl"></el-image>
            </div>

            <div class="btn-tool">
                <button class="run-btn" @click="runModel">Run</button>
                <button class="normal-btn" style="width: 48%;" @click="handleClear">Clear</button>
            </div>


            <div class="model-params" v-if="mode == 'auto'">
                <div class="model-param-head" @click="showModelParams">
                    <span>Model Parameters</span>
                    <el-icon class="model-param-icon" v-show="!isEditParam"><CaretLeft /></el-icon>
                    <el-icon class="model-param-icon" v-show="isEditParam"><CaretBottom /></el-icon>
                </div>

                <ul class="model-params-table" v-show="isEditParam">
                    <li v-for="item in modelParams" class="model-params-item">
                        <div class="param-item-head">
                            <span class="param-title">{{ item.title }}
                                <div class="param-help">
                                    <el-icon><QuestionFilled /></el-icon>
                                    <div class="tooltip">{{ item.tooltip }}</div>
                                </div>
                            </span>
                            <input class="param-input" v-model=item.value />
                        </div>
                        <vue-slider v-model=item.value :min=item.min :max=item.max :interval=item.interval
                            :process-style="{ backgroundColor: '#139FE1' }"
                            :tooltip-style="{ backgroundColor: '#139FE1', borderColor: '#139FE1' }" :contained="true"
                            @error="inputError" @change="changeParams">
                            <template v-slot:dot="{ focus }">
                                <div :class="['custom-dot', { focus }]"></div>
                            </template>
                        </vue-slider>
                    </li>
                </ul>
            </div>
        </div>


        <div class="result-setting">
            <div class="result-container">
                <div class="img-btn-group" v-if="runState == 'success'">
                    <!-- <div class="img-btn-group" v-if="true" > -->
                    <div v-show="showMask"  class="mask-tool">
                        <div class="result-label-set">
                            <span class="label-set-title">Label Set</span>
                            <el-row :gutter="0" class="label-set-item">
                                <el-tag v-for="key in Object.keys(labelTag)" :key="key" class="label-item" effect="dark" :color="labelTag[key]" round>{{ key }}</el-tag>
                            </el-row>
                        </div>
                        
                        <div  class="result-label-set">
                            <span class="label-set-title">Mask Opacity</span>
                            <vue-slider v-model=maskOpacity class="mask-opacity-silder" :min=0.0 :max=1.0 :interval=0.05
                                :process-style="{ backgroundColor: '#139FE1' }"
                                :tooltip-style="{ backgroundColor: '#139FE1', borderColor: '#139FE1' }"
                                :tooltip-placement="['bottom']" :contained="true">
                                <template v-slot:dot="{ focus }">
                                    <div :class="['custom-dot', { focus }]"></div>
                                </template>
                            </vue-slider>
                        </div>
                        
                        <div  class="result-label-set">
                            <span class="label-set-title">Stability score</span>
                            <vue-slider v-model=score class="mask-opacity-silder" :min=0.0 :max=1.0 :interval=0.01
                                :process-style="{ backgroundColor: '#139FE1' }"
                                :tooltip-style="{ backgroundColor: '#139FE1', borderColor: '#139FE1' }"
                                :tooltip-placement="['bottom']" :contained="true" @change="handleDrawByScore">
                                <template v-slot:dot="{ focus }">
                                    <div :class="['custom-dot', { focus }]"></div>
                                </template>
                            </vue-slider>
                        </div>
                    </div>

                    <div class="checkbox-wrapper" style="padding-top: 25px;">
                        <input id="cbx-51" type="checkbox" v-model="showMask" />
                        <label class="toggle" for="cbx-51">
                            <span>
                                <svg viewBox="0 0 10 10" height="10px" width="10px">
                                    <path
                                        d="M5,1 L5,1 C2.790861,1 1,2.790861 1,5 L1,5 C1,7.209139 2.790861,9 5,9 L5,9 C7.209139,9 9,7.209139 9,5 L9,5 C9,2.790861 7.209139,1 5,1 L5,9 L5,1 Z">
                                    </path>
                                </svg>
                            </span>
                        </label>
                    </div>

                </div>

                <el-image class="result-origin" :src="resultImgUrl" v-if="resultImgUrl && runState == 'success'">
                </el-image>

                <el-image class="result-mask" :style="{ opacity: maskOpacity }" :src="resultMaskUrl"
                    v-show="resultMaskUrl && showMask && runState == 'success'">
                </el-image>

                <div class="result-image" v-if="!resultImgUrl && runState == 'ready'">
                    <el-icon>
                        <Picture />
                    </el-icon>
                </div>
                <div class="result-image" v-if="!resultImgUrl && runState == 'loading'">
                    <div class="loader">
                        <svg viewBox="0 0 80 80">
                            <circle id="test" cx="40" cy="40" r="32"></circle>
                        </svg>
                        <span>{{ runTimeMilSec / 1000.0 }}s</span>
                    </div>
                </div>
                <div class="result-image" v-if="!resultImgUrl && runState == 'fail'">
                    <!-- <el-tag type="danger">Error</el-tag> -->
                    <span style="display:flex; color: red; font-size:large; font-weight: 600;">{{ errorMsg }}</span>
                </div>

            </div>

            <div class="btn-tool">
                <div class="download-btn">
                    <el-button :class="[runState == 'success' ? 'result-btn  normal-btn' : 'normal-btn']"
                        :disabled="!resultImgUrl || !resultMaskUrl || runState != 'success'">Download&nbsp;
                        ▼</el-button>
                    <!-- <el-button :class="[runState=='success' ? 'result-btn  normal-btn' : 'normal-btn']" :disabled="false">Download &nbsp; ▼</el-button> -->
                    <div class="download-content" v-if="resultImgUrl && resultMaskUrl && runState == 'success'">
                        <!-- <div class="download-content" v-if="true"> -->
                        <div class="download-item" @click="downloadResult">ResultImage</div>
                        <div class="download-item" @click="downloadMask">MaskImage</div>
                        <div class="download-item" @click="downloadJson">JsonFile</div>
                        <div class="download-item" @click="downloadAll">All</div>
                    </div>
                </div>

                <el-button class="result-btn normal-btn"
                    :disabled="!resultImgUrl || !resultMaskUrl || runState != 'success'"
                    @click="showEdit">Edit</el-button>
                <el-dialog append-to-body width="1200px" top="20px" title="Edit Mask" v-model="dialogEditVisible" :show-close="false" 
                    destroy-on-close :close-on-click-modal=false :close-on-press-escape=false class="edit-dialog">
                    <template #header="{ close }">
                        <div class="form-title">
                            <p>Edit Mask</p>
                            <el-icon  @click="close"><Close /></el-icon>
                        </div>
                    </template>
                    <el-skeleton :rows="10" animated v-if="dialogLoading"/>
                    <SegmentEdit v-else :imgName=bkeImgName :jsonData=resultJsonFile :imageUrl=resultImgUrl
                        :opacity=maskOpacity :score=score @edit-result="handleEditResult">
                    </SegmentEdit>
                </el-dialog>

            </div>

        </div>
    </div>
</template>

<script lang="ts" setup>
import { Picture, CaretLeft, CaretBottom, Close, QuestionFilled } from '@element-plus/icons-vue'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import axios from 'axios'
import JSZip from "jszip"
import { loadImage } from '@/helper/loadImage'
import { rleArrToBinaryMask,rleFromString } from '@/helper/maskUtils'
import { userInfoStore } from '@/store/user'
const userStore = userInfoStore();
// axios api setting
axios.defaults.baseURL =
    process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com";
// axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
const base = process.env.NODE_ENV === "development" ? "/api" : "";
const bkebase = process.env.NODE_ENV === "development" ? "/bke" : "";

const props = defineProps({
    usrMode: {type: String},
    imageName: { type: String },
    imageUrl: { type: String },
});
const usrMode = ref('try');

const dialogLoading = ref(false);
const dialogEditVisible = ref(false);
var imageFile:File;
const showEdit = async () => {
    if (bkeImgName == '') {
        dialogLoading.value = true;
        dialogEditVisible.value = true;
        let formData = new FormData();
        formData.append('image_file', imageFile);
        let uploadBke = await uploadInteractiveImg(formData);
        if (uploadBke) dialogLoading.value = false;
    } else {
        dialogLoading.value = false;
        dialogEditVisible.value = true;
    }
}

const mode = ref('auto');

// upload file
const imageUrl = ref('')
const upload = ref(true)
var uploadImgName = ref('');
// var uploadImgName = ref('9527f17a-15ec-4f79-976d-583cba1ac42d.png');
const imgProgress = ref(0.0);
const imgFileList:any = ref([]);

const isEditParam = ref(false);
const runState = ref('ready');
const errorMsg = ref('');
// const labelTag :Ref<Object> = ref({'coral': '#4E0188'});


const resultImgUrl = ref('');
// modify to purple image
const resultMaskUrl = ref('');
// black and white image
// var maskUrl = '';
const resultJsonUrl = ref('');

const resultImg = ref();
const resultMask = ref();
var resultJsonFile = ref();

const showMask = ref(true);
const maskOpacity = ref(0.6);
const coralColor = [78, 1, 136, 53];

const score = ref(0.62);
var colors = [
    '#4E0188', // Purple
    '#01FE2C', // Light Green
    '#FE012B', // Red
    '#1400FC', // Blue
    '#FF8C00', // Orange
    '#008080', // Dark Green
    '#db00c2', // Rose
    '#FFFF00', // Yellow
    '#8b0000', // Brown
    '#FFC0CB', // Pink
    '#7C9FB0',
    '#00FFFF',
];
const labelTag :Ref<Object> = ref({'coral': colors[0]});

var modelParams = ref([
    {
        title: "Point Per Side",
        value: 32,
        min: 4,
        max: 64,
        range: [4, 8, 16, 32, 64],
        interval: 1,
        tooltip: "It controls the granularity of the generated masks. Larger values yield longer response times."
    },
    {
        title: "Predicted iou",
        value: 0.82,
        min: 0.00,
        max: 1.00,
        range: [0, 1],
        interval: 0.01,
        tooltip: "It indicates the quality of the generated coral masks. The coral masks with predicted iou below this value will be filtered out.Higher is better."
    },
    {
        title: "Stability score",
        value: 0.62,
        min: 0.42,
        max: 0.82,
        range: [0.42, 0.82],
        interval: 0.01,
        tooltip: "The stability of the generated coral masks"
    },
    {
        title: "Min area",
        min: 0,
        max: 100,
        value: 100,
        range: [0, 100],
        interval: 10,
        tooltip: "Coral masks with areas lower than this value will be removed."
    },
]);
let timer: null | NodeJS.Timeout = null;
// millisecond
var runTimer;
const runTimeMilSec = ref(0);
const startRunTime = () => {
    runTimeMilSec.value = 0;
    runTimer = setInterval(() => {
        runTimeMilSec.value = runTimeMilSec.value + 100;
    }, 100);
}
const stopRunTime = () => {
    runTimer = clearInterval(runTimer);
}

const handlePictureCardPreview = (file: File) => {
    console.log('===preview===')
    // console.log(file)
    imageUrl.value = URL.createObjectURL(file)
}

// remove the upload info
const handleRemove = () => {
    console.log('===remove===')
    imageUrl.value = '';
    upload.value = true;
    uploadImgName.value = '';
    imgFileList.value = [];
}

const showModelParams = () => {
    isEditParam.value = !isEditParam.value;
}
const inputError = (type: string, msg: string) => {
    console.log(type, msg);
}
const changeParams = (value: string, index: number) => {
    console.log(value, index);
    // console.log(modelParams);
}
const uploadToSvr = async (formData: FormData) => {
    axios.defaults.baseURL =
        process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com";
    try {
        console.log("===upload===");
        // console.log(process.env.NODE_ENV);
        // console.log(base);
        const result = await axios.post(bkebase + '/api/v1/try_it_out/uploadImage', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress(e) {
                // console.log(e.event);
                imgProgress.value = Number(((e.event.loaded / e.event.total) * 50).toFixed(2));
            },
        });
        uploadImgName.value = result.data.image_name;
        bkeImgName = result.data.image_name;
    } catch (err) {
        console.error(err);
    }
}

const uploadInteractiveImg = async (formData: FormData) => {
    try {
        console.log("===upload interactive===");
        // console.log(process.env.NODE_ENV);
        // console.log(base);
        axios.defaults.baseURL =
            process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";

        const result = await axios.post(bkebase + '/api/v1/try_it_out/uploadImage', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress(e) {
                // console.log(e.event);
                imgProgress.value = Number(((e.event.loaded / e.event.total) * 50 + 50).toFixed(2));
            },
        });
        // console.log(result);
        bkeImgName = result.data.image_name;
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}
var bkeImgName: string = '';
// var imgFile:File;
const handleUploadImg = async (item) => {
    let formData = new FormData();
    formData.append('image_file', item.file);
    // console.log(formData.get('image_file'));
    upload.value = false;
    await uploadToSvr(formData);
    // await uploadInteractiveImg(formData);
    handlePictureCardPreview(item.file);
}

const clearResult = () => {
    resultImgUrl.value = '';
    resultMaskUrl.value = '';
    // black and white image
    // maskUrl = '';
    resultJsonUrl.value = '';

    resultImg.value = '';
    resultMask.value = '';
    resultJsonFile.value = '';

    showMask.value = true;
    maskOpacity.value = 0.6;
}

const runModel = async () => {
    if (uploadImgName.value == '' || (bkeImgName == '' && usrMode.value == 'try')) {
        ElMessageBox.alert('Please upload image.', 'Warning');
    } else {
        clearResult();

        console.log('==='+usrMode.value+' running model===');
        // console.log(uploadImgName.value);

        runTimeMilSec.value = 0;
        runState.value = 'loading';

        var iou, sta, point, minarea;
        modelParams.value.forEach(element => {
            if (element.title == 'Point Per Side') {
                point = element.value;
            }
            if (element.title == 'Predicted iou') {
                iou = element.value;
            }
            if (element.title == 'Stability score') {
                sta = element.value;
            }
            if (element.title == 'Min area') {
                minarea = element.value;
            }
        });
        let params = {
            'image_name': uploadImgName.value,
            'iou_threshold': iou,
            'sta_threshold': sta,
            'point_number': point,
            'min_area': minarea
        };
        try {
            var result;
            startRunTime();
            if (usrMode.value === 'try') {
                axios.defaults.baseURL =
                process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com";

                result = await axios.post(bkebase + '/api/v1/try_it_out/enqueue', params, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            } else if (usrMode.value === 'collection') {
                // https://coralscop-bke.hkustvgd.com/api/v1/inference/enqueue
                axios.defaults.baseURL =
                process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";
                result = await axios.post(bkebase + '/api/v1/inference/enqueue', params, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + userStore.userInfo.token
                    },
                });
            }
            // console.log(result);

            if (result.data.data) {
                uploadImgName.value = result.data.data.image_name;

                clearTimeout(Number(timer));
                while (runState.value == 'loading' && runTimeMilSec.value < 60000) {
                    // console.log(runTimeMilSec);
                    await pollingInquiry();
                }
                stopRunTime();
                if (runState.value == 'loading' && runTimeMilSec.value >= 60000) {
                    runState.value = 'fail';
                    errorMsg.value = "Time out! Please use a smaller size of image and try again!";
                }
                // clearTimeout(Number(timer));

            } else {
                runState.value = 'fail';
                errorMsg.value = "Something happen:"+result.data.message;
            }
            // console.log(result);
        } catch (err) {
            console.error(err);
        }
    }
}
const modifyMaskColor = (imgSrc: string, color: number[]) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    // const purple = [154, 30, 232];
    img.src = imgSrc;
    img.onload = () => {
        canvas.height = img.height;
        canvas.width = img.width;
        img.onload = null;
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
                if (blob) resultMaskUrl.value = URL.createObjectURL(blob);
            })
        }
    }
}
const handleDrawByScore = () => {
    // console.log("===change score===");
    nextTick(() => {
        // console.log(score.value);
        let resultData = JSON.parse(resultJsonFile.value);
        // console.log(resultData);
        generateMask(resultData.annotations, resultData.image.height, resultData.image.width);

    });
}
const generateMask = (annoList:any[], height:number, width:number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error('Canvas context is not supported. ');
    }
    // var labelTag:Object = {'coral': colors[0]};
    annoList.forEach(anno => {
        // console.log(anno);
        if (!Object.keys(labelTag.value).includes(anno.label)) {
            var color = colors[0];
            var availableColor = colors.find(col => !Object.values(labelTag.value).includes(col));
            if (availableColor) {
                    color = availableColor;
            } else {
                color = colors[Object.keys(labelTag.value).length % colors.length];
            }
            labelTag.value[anno.label] = color;
        }
        // console.log(anno.stability_score,score.value);
        if (anno.stability_score >= score.value) {
            let cnts = rleFromString(anno.segmentation.counts);
            let mask = rleArrToBinaryMask(cnts,anno.segmentation.size);
            const scaleFactor = 4; // Supersampling factor
            const canvasWidth = mask[0].length;
            const canvasHeight = mask.length;

            // Create an offscreen canvas with higher resolution
            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = canvasWidth * scaleFactor;
            offscreenCanvas.height = canvasHeight * scaleFactor;
            const offscreenCtx = offscreenCanvas.getContext('2d');
            offscreenCtx?.scale(scaleFactor, scaleFactor);

            // Draw the binary mask on the offscreen canvas
            for (let y = 0; y < canvasHeight; y++) {
                for (let x = 0; x < canvasWidth; x++) {
                    if (mask[y][x] === 1 && offscreenCtx) {
                        offscreenCtx.fillStyle = labelTag.value[anno.label];
                        offscreenCtx.fillRect(x,y, 1, 1);
                    }
                }
            }

            // Draw the offscreen canvas onto the main canvas
            ctx.globalAlpha = 0.6;
            ctx.drawImage(offscreenCanvas, 0, 0, canvasWidth, canvasHeight);

            // Reset globalAlpha
            ctx.globalAlpha = 1;
        }
    });

    canvas.toBlob(blob => {
        if (blob) resultMaskUrl.value = URL.createObjectURL(blob);
    });
}

// const getImageFileFromUrl = async (imgUrl: string, imgName:string) => {
//     const img = await loadImage(imgUrl);
//     const canvas = document.createElement('canvas');
//     canvas.height = img.height;
//     canvas.width = img.width;
//     const ctx = canvas.getContext('2d');
//     ctx?.drawImage(img, 0, 0);
//     canvas.toBlob(blob => {
//         if (blob) imageFile = new File([blob], imgName);
//     });
// }

const getResultInfo = async (imgPath: string, maskPath: string, jsonFilePath: string) => {
    try {
        console.log("===result===");
        var json;
        if (usrMode.value == 'try') {
            axios.defaults.baseURL =
            process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com";

            resultImg.value = await axios.get(bkebase + imgPath, {
                responseType: 'arraybuffer'
            });

            resultMask.value = await axios.get(bkebase + maskPath, {
                responseType: 'arraybuffer'
            });

            json = await axios.get(bkebase + jsonFilePath);

        } else if (usrMode.value === 'collection') {
            axios.defaults.baseURL =
                process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";

                resultMask.value = await axios.get(bkebase + maskPath, {
                    responseType: 'arraybuffer',
                    headers: {
                        Authorization: 'Bearer ' + userStore.userInfo.token,
                        // 'Access-Control-Allow-Origin': '*'
                    }
                });
                json = await axios.get(bkebase + jsonFilePath, {
                    headers: {
                        Authorization: 'Bearer ' + userStore.userInfo.token,
                        // 'Access-Control-Allow-Origin': '*'
                    }
                });

                resultImg.value = await axios.get(bkebase + imgPath, {
                    responseType: 'arraybuffer',
                    // withCredentials: true,
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                    }
                });
        }
        
        let imageType = resultImg.value.headers['content-type'];
        const originBlob = new Blob([resultImg.value.data], { type: imageType});
        resultImgUrl.value = URL.createObjectURL(originBlob);  
        let filename_only = imgPath.split(/(\\|\/)/g).pop()     
        imageFile = new File([originBlob],  filename_only,  { type: imageType});
        
        
        // console.log(imageFile);
        // console.log(originBlob);
        const maskBlob = new Blob([resultMask.value.data], { type: resultMask.value.headers['content-type'] });
        let maskUrl = URL.createObjectURL(maskBlob);
        modifyMaskColor(maskUrl, coralColor);
        // console.log(maskBlob);

        var jsonstring = JSON.stringify(json);
        var jsondata = JSON.parse(jsonstring);
        var anno = jsondata.data.annotations.map(item => {
            var newItem = item;
            newItem['label'] = 'coral';
            // console.log(label);
            return newItem;
        });
        jsondata.data.annotations = anno;
        resultJsonFile.value = JSON.stringify(jsondata.data);
        // console.log(resultJsonFile.value);
        resultJsonUrl.value = 'data:application/json;charset=utf-8,' + encodeURIComponent(resultJsonFile.value);
    } catch (err) {
        console.error(err);
    }
}

const inquiry = async () => {
    try {
        console.log("=== "+usrMode.value+" inquiry ===");
        var result;
        if (usrMode.value === 'try') {
            axios.defaults.baseURL =
            process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com";

            result = await axios.get(bkebase + '/api/v1/try_it_out/result', {
                params: {
                    'image_name': uploadImgName.value,
                },
            });
        } else if (usrMode.value === 'collection') {
            // https://coralscop-bke.hkustvgd.com/api/v1/inference/result
            axios.defaults.baseURL =
                process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";
            result = await axios.get(bkebase + '/api/v1/inference/result', {
                params: {
                    'image_name': uploadImgName.value,
                },
                headers: {
                    Authorization: 'Bearer ' + userStore.userInfo.token
                },
            });
        }
        // console.log(result);
        if (result.data.isDone == 1) {
            if (result.data.errors && result.data.errors.length) {
                runState.value = 'fail';
                errorMsg.value = "Something went wrong! Please use smaller iou and try again!";
            } else {
                runState.value = 'success';
                var resImgPath = result.data.data.image_path.replace(/\.\//, '');
                var resMaskPath = result.data.data.output_paths.mask_image.replace(/\.\//, '');
                var resJsonPath = result.data.data.output_paths.json.replace(/\.\//, '');
                getResultInfo(resImgPath, resMaskPath, resJsonPath);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

const pollingInquiry = () => {
    return new Promise(resolve => {
        timer = setTimeout(async () => {
            const result = await inquiry();
            resolve(result);
        }, 500);
    });
}



const generateResultImg = async (imgSrc: string, maskSrc: string, maskOpa: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error('Canvas context is not supported. ');
    }

    const img = await loadImage(imgSrc);
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);

    const mask = await loadImage(maskSrc);
    ctx.globalAlpha = maskOpa;
    ctx.drawImage(mask, 0, 0);

    return canvas.toDataURL();
}

const handleClear = () => {
    // imgInput.value = ;
    if (usrMode.value == 'try') {
        imageUrl.value = '';
        upload.value = true;
        uploadImgName.value = '';
        // uploadImgName.value = '8c78a50c-0cd1-4982-90da-d4d2a6800f27.jpg';
        bkeImgName = '';

        isEditParam.value = false;
    }
    runState.value = 'ready';

    resultImgUrl.value = '';
    resultMaskUrl.value = '';
    // black and white image
    // maskUrl = '';
    resultJsonUrl.value = '';

    resultImg.value = '';
    resultMask.value = '';
    resultJsonFile.value = '';

    showMask.value = true;
    maskOpacity.value = 0.6;
}

const downloadFile = (src: string, filename: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


const downloadResult = async () => {
    console.log("===Download Result Image===");
    var mergeUrl = await generateResultImg(resultImgUrl.value, resultMaskUrl.value, maskOpacity.value);
    downloadFile(mergeUrl, 'coralscop-result.png');

}
const downloadMask = async () => {
    console.log("===Download Mask Image===");
    downloadFile(resultMaskUrl.value, 'coralscop-mask.png');
}
const downloadJson = async () => {
    console.log("===Download Json File===");
    downloadFile(resultJsonUrl.value, 'coralscop-json.json');
}
const downloadAll = async () => {
    console.log("===Download All===");
    const zip = new JSZip();

    var mergeUrl = await generateResultImg(resultImgUrl.value, resultMaskUrl.value, maskOpacity.value);
    // console.log(mergeUrl);
    zip.file('coralscop-result.png', mergeUrl.split(';base64,')[1], { base64: true });
    zip.file('coralscop-mask.png', resultMaskUrl.value.split(';base64,')[1], { base64: true });
    zip.file('coralscop-json.json', resultJsonFile.value, { binary: true });
    zip.generateAsync({ type: 'blob' }).then(content => {
        // console.log(content);
        downloadFile(URL.createObjectURL(content), 'coralscop-result.zip');
    });

}

const handleEditResult = async (result) => {
    // console.log(result);
    // console.log(resultJsonFile.value);
    resultJsonFile.value = JSON.stringify(result.editJson);
    // console.log(resultJsonFile.value);
    resultJsonUrl.value = 'data:application/json;charset=utf-8,' + encodeURIComponent(resultJsonFile.value);
    resultMaskUrl.value = result.editMask;
    // maskUrl = result.editMask;
    labelTag.value = result.labels;

    // console.log(maskurl);
}

const initAutoModel = async () => {
    usrMode.value = <string>props.usrMode;
    if (usrMode.value == 'collection') {
        upload.value = false;
        imageUrl.value = <string>props.imageUrl;
        uploadImgName.value = <string>props.imageName;
    }
    // let testurl = 'https://coralscop-test.hkustvgd.com/usr_imgs/f2815d25-5097-438d-830a-4b459bdb68d6.jpeg';
    // let testres = await axios.get(testurl);
    // console.log(testres);

    // fetch("https://coralscop-bke.hkustvgd.com/usr_imgs/b4ed6aee-ab1c-4bab-ad60-04441fe52e7f.jpg", {
    //     method: "GET",  
    //     headers: {
    //         'Access-Control-Allow-Origin': '*',
    //     }})
    //     .then(res => console.log(res))
    //     .catch(function(error) {
    //     error.message
    // })

    // let bkeurl = 'https://coralscop-bke.hkustvgd.com/usr_imgs/b4ed6aee-ab1c-4bab-ad60-04441fe52e7f.jpg';
    // let bkeres = await axios.get(bkeurl, {responseType:'arraybuffer'});
    // console.log(bkeres);
    // fetch(bkeurl, {
    //     method: "GET",
    //     // mode: 'no-cors',
    //     headers: {
    //         Authorization: 'Bearer ' + userStore.userInfo.token,
    //         // 'Access-Control-Allow-Origin': '*'
    //     }
    // })
    // .then(res => {
    //     console.log(res);
    // })
    // .catch(function(error) {
    //     error.message
    // });
}

onMounted(() => {
    initAutoModel();
})

</script>

<style>
.model-container {
    display: flex;
    justify-content: space-between;
    gap: 40px;
    align-items: stretch;
    width: 85vw;
    height: auto;
    /* margin: 30px; */
    /* margin-left: 100px; */
    padding: 0 0 0 0;
    background-color: #FAFAFA;
    /* background-color: #c8ccd4; */
}

.model-setting {
    display: flex;
    flex-direction: column;
    flex: 1 1 0%;
    flex-wrap: wrap;
    flex-grow: 1;
    gap: 16px;

}

.upload-container {
    position: relative;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: min(160px, 100%);
    height: 75vh;
    border-radius: 4px;
    border: 2px #FAFAFA solid;
    background-color: white;
    overflow: hidden;
    padding: 0;
    margin: 0;
    cursor: pointer;
}

.upload-container .el-upload-dragger {
    width: 41vw;
    min-width: min(160px, 100%);
    /* max-width: 68vw; */
    height: 75vh;
    margin: 0;
    align-items: center;
    display: flex;
    justify-content: center;
}

.upload-image {
    /* object-fit: contain; */
    position: absolute;
    padding: 20px;
    height: auto;
    max-height: 68vh;
    width: auto;
    max-width: 39vw;
}

.upload-text {
    color: #6B7280;
    text-align: center;
    position: relative;
    /* top: 50%; */
}

.hidden {
    display: none;
}

.img-btn-group {
    position: absolute;
    display: inline-flex;
    top: 2%;
    right: 2%;
    justify-content: flex-end;
    gap: 3px;
    z-index: 110;
}

.mask-opacity-silder {
    min-width: 100px;
    max-width: 200px;
    margin-top: 5px;
}

.delete-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1px;
    z-index: 1px;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    border: 1px solid #E6E7EB;
    border-radius: 0.125rem;
    background: #FFFFFF;
    padding: 2px;
    margin: 3px;
    color: #6B7280;
    height: 20px;
    width: 20px;
}

.delete-btn :hover {
    box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
    border-color: #E6E7EB;
}

.run-btn {
    /* width: 100%; */
    width: 48%;
    align-items: center;
    /* background: linear-gradient(to bottom right, #f3f4f6 , #e5e7eb ); */
    background: linear-gradient(to bottom right, #139FE1, #70B4D5);
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: #70B4D5 0 1px 3px 0;
    box-sizing: border-box;
    color: white;
    cursor: pointer;
    display: inline-flex;
    font-family: system-ui, -apple-system, system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 16px;
    font-weight: 600;
    justify-content: center;
    line-height: 1.25;
    min-height: 3rem;
    padding: calc(.875rem - 1px) calc(1.5rem - 1px);
    transition: all 250ms;
    touch-action: manipulation;
    vertical-align: baseline;
}

.run-btn:hover,
.run-btn:focus {
    border-color: rgb(229, 231, 235);
    box-shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;
    /* color: rgba(0, 0, 0, 0.65); */
}

.run-btn:hover {
    transform: scale(1.01);
    background-color: linear-gradient(to bottom right, #139FE1, #70B4D5);
}

.run-btn:focus,
.run-btn:focus-visible {
    border-color: rgba(229, 231, 235, 0.15);
    outline: 0;
}

.run-btn:active {
    background-color: #F0F0F1;
    border-color: rgba(229, 231, 235, 0.15);
    box-shadow: rgba(229, 231, 235 0.06) 0 2px 4px;
    color: rgba(0, 0, 0, 0.65);
    transform: translateY(0);
}

.normal-btn {
    padding: calc(.875rem - 1px) calc(1.5rem - 1px);
    font-weight: 600;
    font-size: 16px;
    /* min-height: 48px; */
    background: rgb(255, 255, 255);
    color: #139FE1;
    border-radius: 8px;
    border: 1px solid #139FE1;
    transition-duration: 1s;
    transition-property: border-top, border-left, border-bottom, border-right, box-shadow;
}

.normal-btn:focus,
.normal-btn:hover {
    /* transform: translateY(-1px); */
    border: 1px solid #139FE1;
    box-shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;
    outline: none;
}

.model-params {
    display: grid;
    width: 100%;
    padding: 0;
    margin: 5px 0 20px 0;
    background-color: white;
    border-radius: 8px;
    border: 0.5px solid #E0E1E4;
    border: 1px solid #139FE1;
    box-shadow: rgb(0 0 0 / 5%) 0 0 8px;
}

.model-params:hover,
.model-params:focus {
    border: 1px solid #139FE1;
}

.model-param-head {
    cursor: pointer;
    letter-spacing: 1.5px;
    display: flex;
    justify-content: space-between;
    padding: 12px;
    text-align: center;
    align-items: center;

    span {
        font-weight: 800;
        font-size: 14px;
        /* font-family: SourceHanSansCN-Regular, SourceHanSansCN-Medium, SourceHanSansCN-Bold,'Source Sans Pro', 'ui-sans-serif', 'system-ui', sans-serif; */
        color: #139FE1;
        text-indent: 8px;
        letter-spacing: 0cap;
    }

    .model-param-icon {
        /* padding: 2px; */
        text-align: center;
        color: #6B7280;
        /* transform: rotate(90deg); */
        /* transition: .15s; */
    }
}

.model-params-table {
    list-style: none;
    padding: 5px;
    margin-left: 8px;
    margin-right: 8px;
}

.model-params-item {
    display: block;
    border-radius: 2px;
    border: 0.5px solid #E0E1E4;
    background-color: white;
    overflow: visible;
    min-width: min(160px, 100%);
    padding: 2px;
    padding-left: 10px;
    padding-bottom: 4px;
    gap: 2px;
    justify-items: start;

    .param-item-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 5px;

        .param-title {
            color: #374151;
            font-size: 14px;
            display: inline-flex;
            padding: 0;
            margin: 0;
            text-align: left;
            align-items: center;
            gap: 3px;

            .param-help {
                margin: 0;
                margin-top: 5px;
                text-align: center;
                align-items: center;
                position: relative;
            }

            .tooltip {
                position: absolute;
                bottom: 10px;
                left: 50%;
                transform: translateX(-10%);
                color: #fff;
                padding: 6px 10px;
                border-radius: 15px;
                opacity: 0;
                visibility: hidden;
                font-size: 12px;
                transition: all 0.3s ease;
                width: 25vw;
                z-index: 10;
            }

            .param-help:hover .tooltip {
                opacity: 1;
                visibility: visible;
                bottom: 20px;
                /* background-color: #7020FF; */
                background-image: linear-gradient(to right, #139FE1, #35a2fd);
                height: fit-content;
            }
        }

        .param-input {
            grid-column: 4/4;
            font-size: 12px;
            padding: 4px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            margin: 2px;
            border-radius: 4px;
            background-color: #FFFFFF;

            max-width: 30px;
            outline: none;
            color: #333;
        }

        .param-input:hover {
            background-color: #f2f2f2;
        }

        .param-input:focus {
            outline: none;
            background-color: #fff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    }
}

.custom-dot {
    width: 100%;
    height: 100%;
    border-radius: 0;
    background-color: #139FE1;
    transition: all .3s;
}

.custom-dot:hover {
    transform: rotateZ(45deg);
}

.custom-dot.focus {
    border-radius: 50%;
}

.result-setting {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    flex: 1 1 0%;
    flex-wrap: wrap;
    flex-grow: 1;
    gap: 16px;
}

.result-container {
    position: relative;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: min(160px, 100%);
    height: 75vh;
    border-radius: 4px;
    border: 2px #FFFFFF solid;
    background-color: white;
    overflow: hidden;
    padding: 0;
    margin: 0;
    cursor: pointer;

    .result-image {
        text-align: center;
        position: relative;

        i {
            color: #6B7280;
        }
    }

    .result-origin {
        text-align: center;
        position: absolute;
        /* top: 5%; */
        z-index: 10;
        /* object-fit: contain; */
        height: auto;
        max-height: 68vh;
        width: auto;
        max-width: 39vw;
        padding: 20px;
    }

    .result-mask {
        text-align: center;
        position: absolute;
        /* top: 5%; */
        /* opacity: 60%; */
        z-index: 30;
        /* mix-blend-mode: multiply; */
        /* object-fit: contain; */
        height: auto;
        max-height: 68vh;
        width: auto;
        max-width: 39vw;
        padding: 20px;
    }

    .el-image {
        display: flex;
        overflow: hidden;
    }
}

.checkbox-wrapper input[type="checkbox"] {
    visibility: hidden;
    display: none;
}

.checkbox-wrapper .toggle {
    position: relative;
    display: block;
    width: 42px;
    height: 24px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transform: translate3d(0, 0, 0);
}

.checkbox-wrapper .toggle:before {
    content: "";
    position: relative;
    top: 1px;
    left: 1px;
    width: 40px;
    height: 22px;
    display: block;
    background: #c8ccd4;
    border-radius: 12px;
    transition: background 0.2s ease;
}

.checkbox-wrapper .toggle span {
    position: absolute;
    top: 0;
    left: 0;
    width: 24px;
    height: 24px;
    display: block;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(154, 153, 153, 0.75);
    transition: all 0.2s ease;
}

.checkbox-wrapper .toggle span svg {
    margin: 7px;
    fill: none;
}

.checkbox-wrapper .toggle span svg path {
    stroke: #c8ccd4;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 24;
    stroke-dashoffset: 0;
    transition: all 0.5s linear;
}

.checkbox-wrapper input[type="checkbox"]:checked+.toggle:before {
    background: #139FE1;
}

.checkbox-wrapper input[type="checkbox"]:checked+.toggle span {
    transform: translateX(18px);
}

.checkbox-wrapper input[type="checkbox"]:checked+.toggle span path {
    stroke: #000000;
    stroke-dasharray: 25;
    stroke-dashoffset: 25;
}

.loader {
    --path: #2f3545;
    --dot: #5628ee;
    --duration: 3s;
    width: 44px;
    height: 44px;
    position: relative;
}

.loader:before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    position: absolute;
    display: block;
    background: var(--dot);
    top: 37px;
    left: 19px;
    transform: translate(-18px, -18px);
    animation: dotRect var(--duration) cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
}

.loader svg {
    display: block;
    width: 100%;
    height: 100%;
}

.loader svg circle {
    fill: none;
    stroke: var(--path);
    stroke-width: 10px;
    stroke-linejoin: round;
    stroke-linecap: round;
}

.loader svg circle {
    stroke-dasharray: 150 50 150 50;
    stroke-dashoffset: 75;
    animation: pathCircle var(--duration) cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
}

@keyframes dotRect {
    25% {
        transform: translate(0, 0);
    }

    50% {
        transform: translate(18px, -18px);
    }

    75% {
        transform: translate(0, -36px);
    }

    100% {
        transform: translate(-18px, -18px);
    }
}

@keyframes pathCircle {
    25% {
        stroke-dashoffset: 125;
    }

    50% {
        stroke-dashoffset: 175;
    }

    75% {
        stroke-dashoffset: 225;
    }

    100% {
        stroke-dashoffset: 275;
    }
}

.loader {
    display: inline-block;
    margin: 0 16px;
}

.btn-tool {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 10px;
    height: 40px;
    /* width: 40vw; */
}

.result-btn {
    font-size: .875rem;
    /* min-height: 48px; */
    cursor: pointer;
}

.result-btn:hover {
    background-color: #FFFFFF;
    color: #139FE1;
}

.result-btn:focus {
    border-color: rgba(0, 0, 0, 0.15);
    outline: 0;
}

.result-btn:focus-visible {
    -webkit-box-shadow: none;
    box-shadow: none;
    border-color: rgba(0, 0, 0, 0.15);
    outline: 0;
}

.download-content {
    display: none;
    font-size: 13px;
    position: absolute;
    z-index: 1;
    min-width: 145px;
    background-color: #FFFFFF;
    border: 1px solid #139FE1;
    /* border: 1px solid rgb(209,213,219); */
    border-radius: 0px 8px 8px 8px;
    box-shadow: 0px 8px 8px 0px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    margin-bottom: 10px;
}

.download-item {
    /* color: #5628ee; */
    color: #139FE1;
    padding: 8px 20px;
    text-decoration: none;
    display: block;
    transition: 0.1s;
    text-align: left;
    /* padding-left: 5px; */
}

.download-item:hover {
    /* background-color: #35a2fd; */
    background-image: linear-gradient(to right, #139FE1, #35a2fd);
    color: #FFFFFF;
    font-weight: bold;
    cursor: pointer;
}

.download-item:focus {
    background-color: #212121;
    color: #139FE1;
}

.download-btn {
    position: relative;
    display: block;
}

.download-btn:hover .download-content {
    display: block;
}

.download-btn:hover .result-btn {
    border-radius: 8px 8px 0px 0px;
    border-top: 1px solid #139FE1;
    border-left: 1px solid #139FE1;
    border-bottom: 0;
}
.edit-dialog {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /* margin: 40px 0 0 0; */
    margin-bottom: 20px;
    max-height: calc(100% - 15px);
    background-color: #FAFAFA;
    .el-dialog {
        max-height: calc(100% - 80px);
    }
    .el-dialog__body {
        overflow: auto;
        width: 100%;
        text-align: center;
    }
}

</style>
