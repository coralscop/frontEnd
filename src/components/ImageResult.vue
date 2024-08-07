<template>
    <div class="result-setting">
        <div class="result-container">
            <div class="img-btn-group">
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
                    <el-switch v-model="showMask" width="60" inline-prompt active-text="Mask" class="ml-2"
                        style="--el-switch-on-color: #139FE1; --el-switch-off-color: #9a9999" />
                </div>

            </div>

            <el-image class="result-origin" :src="resultImgUrl" v-show="resultImgUrl">
            </el-image>

            <el-image class="result-mask" :style="{ opacity: maskOpacity }" :src="resultMaskUrl"
                v-show="resultMaskUrl && showMask">
            </el-image>

            <div class="result-image" v-if="!resultImgUrl">
                <el-icon><Picture /></el-icon>
            </div>
        </div>

        <div class="btn-tool">
            <div class="download-btn">
                <el-button class="result-btn  normal-btn" :disabled="!resultImgUrl || !resultMaskUrl">Download&nbsp;▼</el-button>
                <div class="download-content" v-if="resultImgUrl && resultMaskUrl">
                    <div class="download-item" @click="downloadResult">ResultImage</div>
                    <div class="download-item" @click="downloadMask">MaskImage</div>
                    <div class="download-item" @click="downloadJson">JsonFile</div>
                    <div class="download-item" @click="downloadAll">All</div>
                </div>
            </div>

            <el-button class="result-btn normal-btn" :disabled="!resultImgUrl || !resultMaskUrl" @click="showEdit">Edit</el-button>
            <el-dialog append-to-body width="1200px" top="20px" title="Edit Mask" v-model="dialogEditVisible"
                :show-close="false" destroy-on-close :close-on-click-modal=false :close-on-press-escape=false
                class="edit-dialog">
                <template #header="{ close }">
                    <div class="form-title">
                        <p>Edit</p>
                        <el-icon @click="close">
                            <Close />
                        </el-icon>
                    </div>
                </template>
                <el-skeleton :rows="10" animated v-if="dialogLoading" />
                <SegmentEdit v-else :imgName=interactiveImg :jsonData=jsonData :imageUrl=resultImgUrl :opacity=maskOpacity :score=score @edit-result="handleEditResult">
                </SegmentEdit>
                
            </el-dialog>

        </div>

    </div>
</template>

<script lang="ts" setup>
import { Picture, Close } from '@element-plus/icons-vue'
import VueSlider from 'vue-slider-component'
import { loadImage } from '@/helper/loadImage'
import { downloadFile } from '@/helper/downloadFile'
import JSZip from "jszip"
import { rleArrToBinaryMask,rleFromString } from '@/helper/maskUtils'

const props = defineProps({
    imageUrl: { type: String },
    maskUrl: { type: String },
    jsonData: { type: String },
    interactiveImg: { type: String },
    imageFile: {type: File}
});
const showMask = ref(true);
const maskOpacity = ref(0.6);
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
const labelTag: Ref<Object> = ref({ 'coral': colors[0] });

const resultImgUrl = ref('');
// modify to purple image
const resultMaskUrl = ref('');
// black and white image
// var maskUrl = '';
const resultJson = ref('');
const resultJsonUrl = ref('');

const dialogLoading = ref(false);
const dialogEditVisible = ref(false);
const interactiveImg = ref('');

const initImageResult = () => {
    console.log("==== result : initial ====");

    resultImgUrl.value = <string>props.imageUrl;
    resultMaskUrl.value = <string>props.maskUrl;
    // console.log(props.jsonData);
    var json = JSON.parse(<string>props.jsonData);
    var annoList = json.annotations.map(item => {
        var newItem = item;
        newItem['label'] = item.label || 'coral';
        return newItem;
    });
    json.annotations = annoList;
    resultJson.value = JSON.stringify(json);
    resultJsonUrl.value = 'data:application/json;charset=utf-8,' + encodeURIComponent(resultJson.value);

    interactiveImg.value = <string>props.interactiveImg || '';
}
const handleDrawByScore = () => {
    // console.log("===change score===");
    nextTick(() => {
        // console.log(score.value);
        let resultData = JSON.parse(resultJson.value);
        // console.log(resultData);
        resultMaskUrl.value = generateMask(resultData.annotations, resultData.image.height, resultData.image.width);

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

    // canvas.toBlob(blob => {
    //     if (blob)  = URL.createObjectURL(blob);
    // });
    return canvas.toDataURL();
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
    // console.log(resultJsonFile.value);
    downloadFile(resultJsonUrl.value, 'coralscop-json.json');
}
const downloadAll = async () => {
    console.log("===Download All===");
    const zip = new JSZip();

    var mergeUrl = await generateResultImg(resultImgUrl.value, resultMaskUrl.value, maskOpacity.value);
    // console.log(mergeUrl);
    zip.file('coralscop-result.png', mergeUrl.split(';base64,')[1], { base64: true });
    zip.file('coralscop-mask.png', resultMaskUrl.value.split(';base64,')[1], { base64: true });
    zip.file('coralscop-json.json', resultJson.value, { binary: true });
    zip.generateAsync({ type: 'blob' }).then(content => {
        // console.log(content);
        downloadFile(URL.createObjectURL(content), 'coralscop-result.zip');
    });

}

const handleEditResult = async (result) => {
    resultJson.value = JSON.stringify(result.editJson);
    resultJsonUrl.value = 'data:application/json;charset=utf-8,' + encodeURIComponent(resultJson.value);
    
    resultMaskUrl.value = result.editMask;
    
    labelTag.value = result.labels;
}

const showEdit = async () => {
    dialogLoading.value = false;
    dialogEditVisible.value = true;
}

onMounted(() => {
    initImageResult();
})
</script>

<style></style>