<template>
    <div class="model-container">
        <div class="model-setting">
            <div class="upload-container-std">
                <span class="upload-title">Step1: Upload Image</span>
                <div class="upload-box" v-if="isUploadImg">
                    <el-upload ref="uploadImgRef" :file-list="imgFileList" accept="image/*"
                        :http-request="handleUploadImg" :show-file-list="false" :limit="1" drag>
                        <div class="el-upload__text">
                            Drop Image Here<br> -or- <br>Click to Upload
                        </div>
                        <template #tip>
                            <div class="el-upload__tip" style="color:red;">
                                JPG, JPEG, PNG
                            </div>
                        </template>
                    </el-upload>
                </div>
                <div class="upload-box" v-else>
                    <el-progress v-if="!imageUrl" :text-inside="true" :stroke-width="16" :percentage="imgProgress"
                        style="position: relative; top: 25%;" />
                    <div class="img-btn-group" v-if="imageUrl">
                        <!-- <el-icon @click="handleImgRemove"><Delete /></el-icon> -->
                        <el-button :icon="Close" style="width: 8px; height:8px; padding: 8px;"
                            @click="handleImgRemove" />
                    </div>
                    <img v-if="imageUrl" id="uploadImage" class="upload-image-std" :src="imageUrl" />
                </div>

                <span class="upload-title">Step2: Upload CSV</span>
                <div class="upload-box">
                    <el-upload ref="uploadCsvRef" :file-list="csvFileList" accept=".csv" :http-request="handleUploadCsv"
                        :on-change="handleCsvChange" :on-exceed="handleCsvExceed" :show-file-list="false" :limit="1"
                        drag :auto-upload="false">
                        <div class="el-upload__text">
                            Drop CSV Here<br> -or- <br>Click to Select
                        </div>
                        <template #tip>
                            <div class="el-upload__tip" style="color:red;">
                                limit 1 file, new file will cover the old file
                            </div>
                        </template>
                    </el-upload>
                    <div v-show="selectCsvFileName != ''" class="select-file">
                        <p>{{ selectCsvFileName }}</p>
                        <el-progress style="margin: 16px 0 16px 0; text-align: center;" :text-inside="true"
                            :stroke-width="16" :percentage="csvProgress"></el-progress>
                        <el-button style="margin: 16px 0 16px 0;" color="#139FE1" size="small" round
                            @click="submitUpload">Upload</el-button>
                        <el-button style="margin: 16px 0 16px 0;" :icon="Delete" size="small" circle
                            @click="handleCsvRemove" />
                    </div>
                </div>
            </div>


            <div class="btn-tool">
                <button class="run-btn" @click="runModel">Run</button>
                <button class="normal-btn" style="width: 48%;" @click="handleClear">Clear</button>
            </div>

        </div>


        <div class="result-setting">
            <div class="result-container">
                <div class="img-btn-group" v-if="runState == 'success'">
                    <div v-show="showMask" class="mask-tool">
                        <div class="result-label-set">
                            <span class="label-set-title">Label Set</span>
                            <el-row :gutter="0" class="label-set-item">
                                <el-tag v-for="key in Object.keys(labelTag)" :key="key" class="label-item" effect="dark"
                                    :color="labelTag[key]" round>{{ key }}</el-tag>
                            </el-row>
                        </div>
                        <div class="result-label-set">
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

                        <div class="result-label-set">
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
                        <input id="cbx-51" type="checkbox" v-model="showMask">
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
                    v-if="resultMaskUrl && showMask && runState == 'success'">
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
                    <span style="display:flex; color: red; font-size:large; font-weight: 600;">{{ errorMsg }}</span>
                </div>

            </div>

            <div class="btn-tool">
                <div class="download-btn">
                    <el-button :class="[runState == 'success' ? 'result-btn  normal-btn' : 'normal-btn']"
                        :disabled="!resultImgUrl || !resultMaskUrl || runState != 'success'">Download&nbsp;▼</el-button>
                    <div class="download-content" v-if="resultImgUrl && resultMaskUrl && runState == 'success'">
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
                    destroy-on-close draggable :close-on-click-modal=false :close-on-press-escape=false class="edit-dialog">
                    <template #header="{ close }">
                        <div class="form-title">
                            <p>Edit Mask</p>
                            <el-icon  @click="close"><Close /></el-icon>
                        </div>
                    </template>
                    <SegmentEdit :imgName=bkeImgName :jsonData=resultJsonFile :imageUrl=resultImgUrl
                        :opacity=maskOpacity :score=score @edit-result="handleEditResult">
                    </SegmentEdit>
                </el-dialog>

            </div>

        </div>
    </div>
</template>

<script lang="ts" setup>
import { Picture, Delete, Close } from '@element-plus/icons-vue'
import type { UploadFile, UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import { genFileId } from 'element-plus'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import axios from 'axios'
import JSZip from "jszip"
import { loadImage } from '@/helper/loadImage'
import { rleArrToBinaryMask, rleFromString } from '@/helper/maskUtils'

// axios api setting
axios.defaults.baseURL =
    process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com/";
// const base = process.env.NODE_ENV === "development" ? "/api" : "";
// axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
const bkebase = process.env.NODE_ENV === "development" ? "/bke" : "";

// upload file-image
// const imgInput = ref<HTMLInputElement>();
var bkeImgName: string = '';
const isUploadImg = ref(true);
const imageUrl = ref('');
const imgProgress = ref(0.0);
const imgFileList: any = ref([]);
const uploadImgRef = ref<UploadInstance>();
// const uploadImage = ref(null);

// upload file-csv
// const csvInput = ref<HTMLInputElement>();
var csvFileName: string = '';
var csvFilePath: string = '';
const isUploadCsv = ref(true);
const csvProgress = ref(0.0);
const csvFileList: any = ref([]);
const uploadCsvRef = ref<UploadInstance>()
const selectCsvFileName = ref('');

// running model
const runState = ref('ready');
const errorMsg = ref('');
// result
var resultData: any;
const resultImgUrl = ref('');
const resultMaskUrl = ref('');
var resultJsonFile: any;

const showMask = ref(true);
const maskOpacity = ref(0.6);
const score = ref(0.62);

const dialogEditVisible = ref(false);
const showEdit = () => {
    dialogEditVisible.value = true;
}
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
const labelTag: Ref<Object> = ref({ 'coral': colors[0] });

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

const handlePictureCardPreview = async (file: File) => {
    console.log('===preview===');
    // console.log(file)
    imageUrl.value = URL.createObjectURL(file);
}

// remove the upload info
const handleImgRemove = () => {
    console.log('===remove img===')
    imageUrl.value = '';
    isUploadImg.value = true;
    imgFileList.value = [];
    bkeImgName = '';
    imgProgress.value = 0.0;
    csvProgress.value = 0.0;
}
const handleUploadImg = async (item) => {
    // handlePictureCardPreview(item.file);
    await uploadInteractiveImg(item.file);
}
const uploadInteractiveImg = async (file: File) => {
    try {
        console.log("===upload interactive===");
        imageUrl.value = '';
        isUploadImg.value = false;
        bkeImgName = '';
        let formData = new FormData();
        formData.append('image_file', file);
        const result = await axios.post(bkebase + '/api/v1/try_it_out/uploadImage', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress(e) {
                // console.log(e.event);
                imgProgress.value = Number(((e.event.loaded / e.event.total) * 100).toFixed(2));
            },
        });
        // console.log(result);
        bkeImgName = result.data.image_name;
        handlePictureCardPreview(file);
    } catch (err) {
        console.error(err);
    }
}

const uploadCsv = async (file: File) => {
    try {
        console.log("===upload csv===");
        isUploadCsv.value = false;
        csvFileName = '';
        let formData = new FormData();
        formData.append('csv_file', file);
        // formData.append('image_name', bkeImgName);
        const result = await axios.post(bkebase + '/api/v1/try_it_out/uploadCSV', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress(e) {
                // console.log(e.event);
                csvProgress.value = Number(((e.event.loaded / e.event.total) * 100).toFixed(2));
            }
        });
        // console.log(result);
        csvFileName = result.data.csv_file_name;
        csvFilePath = result.data.csv_file_path;
    } catch (err) {
        console.error(err);
    }
}

const handleUploadCsv = async (item) => {
    await uploadCsv(item.file);
}
const submitUpload = () => {
    if (bkeImgName != '' && !isUploadImg.value) {
        uploadCsvRef.value!.submit();
    } else {
        ElMessageBox.alert('Please upload image first.', 'Warning');
    }
}
const handleCsvChange = (file: UploadFile) => {
    // console.log('===csv change===');
    // console.log(file);
    selectCsvFileName.value = file.name;
    if (file.status == 'ready') {
        // console.log(file.name);
        csvProgress.value = 0.0;
        csvFileName = '';
    }
}
const handleCsvExceed: UploadProps['onExceed'] = (files) => {
    handleCsvRemove();
    const file = files[0] as UploadRawFile;
    file.uid = genFileId();
    uploadCsvRef.value!.handleStart(file);
}
const handleCsvRemove = () => {
    uploadCsvRef.value!.clearFiles();
    if (csvFileList.value.length > 0) {
        csvFileList.value = [];
    }
    selectCsvFileName.value = '';
    csvProgress.value = 0.0;
    csvFileName = '';
}
const clearResult = () => {
    runState.value = 'ready';

    resultData = '';
    resultJsonFile = '';
    resultImgUrl.value = '';
    resultMaskUrl.value = '';

    showMask.value = true;
    maskOpacity.value = 0.6;
}

const runModel = async () => {
    // bkeImgName = '4b2891c1-3480-463b-aad5-5f50943c26eb.jpg';
    // csvFileName = '4b2891c1-3480-463b-aad5-5f50943c26eb.csv';
    if (bkeImgName == '') {
        ElMessageBox.alert('Please upload image.', 'Warning');
    } else if (csvFileName == '') {
        ElMessageBox.alert('Please upload csv file.', 'Warning');
    } else {
        clearResult();

        console.log('===running model===');

        runTimeMilSec.value = 0;
        runState.value = 'loading';
        clearTimeout(Number(timer));
        startRunTime();
        try {
            let params = {
                'csv_file_path': csvFilePath,
                'image_name': bkeImgName
            };
            // https://coralscop-bke.hkustvgd.com/api/v1/advanced_inference/sparseToDenseInference
            const result = await axios.post(bkebase + '/api/v1/try_it_out/sparseToDenseInference', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            stopRunTime();
            // console.log(result);
            if (result.status = 200) {
                resultData = result.data;
                await handleStdResult();
                runState.value = 'success';
            } else {
                runState.value = 'fail';
                errorMsg.value = "Something went wrong!";
            }
        } catch (err: any) {
            console.error(err);
            runState.value = 'fail';
            errorMsg.value = "Something went wrong!" + err;
        }
    }
}

const handleDrawByScore = () => {
    // console.log("===change score===");
    nextTick(() => {
        console.log(resultData);
        generateMask(resultData.annotations, resultData.image.height, resultData.image.width);

    });
}

const generateMask = (annoList: any[], height: number, width: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error('Canvas context is not supported. ');
    }
    // var labelTag:Object = {'coral': colors[0]};
    annoList.forEach(anno => {
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
        // console.log(anno.score,score.value);
        if (anno.stability_score >= score.value) {
            let cnts = rleFromString(anno.segmentation.counts);
            let mask = rleArrToBinaryMask(cnts, anno.segmentation.size);
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
                        offscreenCtx.fillRect(x, y, 1, 1);
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
    resultMaskUrl.value = canvas.toDataURL();
    // canvas.toBlob(blob => {
    //     if (blob) resultMaskUrl.value = URL.createObjectURL(blob);
    // });
}

const handleStdResult = async () => {
    // get the image file
    try {
        var filename = resultData.image.file_name.slice(1);
        var resultImg = await axios.get(bkebase + filename, {
            responseType: 'arraybuffer'
        });
        const originBlob = new Blob([resultImg.data], { type: resultImg.headers['content-type'] });
        resultImgUrl.value = URL.createObjectURL(originBlob);
    } catch (error) {
        console.error(error);
    }
    // generate the json file
    var annoList = resultData.annotations;
    annoList = annoList.map((anno, index) => {
        var newItem = anno;
        newItem['id'] = index;
        newItem['stability_score'] = anno.score;
        newItem['uncompressed_segmentation'] = {
            "counts": rleFromString(anno.segmentation.counts),
            "size": anno.segmentation.size
        }
        return newItem;
    });
    resultJsonFile = JSON.stringify(resultData);

    // generate the mask from annotations
    generateMask(annoList, resultData.image.height, resultData.image.width);

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
    imageUrl.value = '';
    isUploadImg.value = true;
    imgFileList.value = [];
    bkeImgName = '';
    imgProgress.value = 0.0;

    csvFileName = '';
    isUploadCsv.value = true;
    csvFileList.value = [];
    csvProgress.value = 0.0;
    selectCsvFileName.value = '';

    clearResult();
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
    var jsonUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(resultJsonFile);
    downloadFile(jsonUrl, 'coralscop-json.json');
}
const downloadAll = async () => {
    console.log("===Download All===");
    const zip = new JSZip();

    var mergeUrl = await generateResultImg(resultImgUrl.value, resultMaskUrl.value, maskOpacity.value);
    // console.log(mergeUrl);
    zip.file('coralscop-result.png', mergeUrl.split(';base64,')[1], { base64: true });
    zip.file('coralscop-mask.png', resultMaskUrl.value.split(';base64,')[1], { base64: true });
    zip.file('coralscop-json.json', resultJsonFile, { binary: true });
    zip.generateAsync({ type: 'blob' }).then(content => {
        // console.log(content);
        downloadFile(URL.createObjectURL(content), 'coralscop-result.zip');
    });
}

const handleEditResult = async (result) => {
    resultJsonFile = JSON.stringify(result.editJson);
    resultMaskUrl.value = result.editMask;
    labelTag.value = result.labels;
    resultData = result.editJson;
}

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
    border: 2px #EBEBEF dashed;
    background-color: white;
    overflow: hidden;
    padding: 0;
    margin: 0;
    cursor: pointer;
}

.upload-image-std {
    object-fit: contain;
    position: absolute;
    padding: 10px;
    height: auto;
    max-height: 32vh;
    width: auto;
    max-width: 39vw;
}

.upload-text {
    color: #6B7280;
    text-align: center;
    position: relative;
    /* top: 50%; */
}

.upload-container-std {
    display: flex;
    flex-direction: column;
    min-width: min(160px, 100%);
    height: 75vh;
    border: 2px #FAFAFA solid;
}

.upload-title {
    text-align: left;
    padding: 5px;
}

.upload-box {
    position: relative;
    display: flex;
    /* justify-content: center; */
    flex-direction: column;
    align-items: center;
    text-align: center;
    border-radius: 4px;
    border: 2px #FAFAFA solid;
    background-color: white;
    overflow: hidden;
    padding: 0;
    margin: 0;
    cursor: pointer;
    min-width: min(160px, 100%);
    height: 50vh;
}

.upload-box .el-upload-dragger {
    width: 41vw;
    min-width: min(160px, 100%);
    /* max-width: 68vw; */
    height: auto;
    margin: 0;
}

.upload-box .el-upload__text {
    padding: 20px;
}

.select-file {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
    text-align: center;
    width: 40vw;
    /* max-width: 68vh; */
    height: 6vh;
    max-height: 10vh;

    /* padding: 0 8px 0 8px; */
    p {
        color: #6B7280;
        max-width: 10vw;
        padding-left: 8px;
        font-size: 14px;
    }
}

.el-progress--line {
    margin-bottom: 15px;
    max-width: 600px;
    min-width: min(120px, 100%);
    width: 20vh;
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
    min-width: 150px;
    margin-top: 5px;
}

.mask-tool {
    display: flex;
    flex-direction: row;
}

.result-label-set {
    display: flex;
    flex-direction: column;
    justify-items: start;
    max-width: min(15vw, 200px);
    padding: 5px;
    z-index: 80;
    border: 1px dashed gray;
    height: 80px;
    overflow-y: auto;
    scrollbar-width: thin;
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
    min-height: 48px;
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

        /* width: 50vw;
        height: 50vh; */
        /* top: 50%; */
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
</style>
