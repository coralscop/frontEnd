<template>
    <div class="segment-box">
        <div class="segment-header">
            <div class="edit-type">
                <el-radio-group v-model="editType" class="edit-type-group">
                    <el-radio-button label="Label" value="label" @change="handleChangeEditType" />
                    <el-radio-button label="Remove" value="rmv" @change="handleChangeEditType" />
                    <el-radio-button label="Add" value="add" @change="handleChangeEditType" />
                </el-radio-group>
                <p v-if="editType == 'label'">Click & Select</p>
                <p v-if="editType == 'rmv'">Click & Rmv</p>
                <p v-if="editType == 'add'">Click & Add<span> Click an object to add mask. Shift-click to remove regions.</span></p>
            </div>
            <el-divider direction="vertical" style="height:80px;margin:1px;"/>
            <div class="label-set">
                <!-- <span class="label-set-title">Label Set</span> -->
                <el-row :gutter="0" class="label-set-item">
                    <el-tag v-for="key in Object.keys(labelTag)" :key="key" class="label-item" effect="dark"
                    :color="labelTag[key]" :closable="key != 'coral'" @close="handleCloseTag(key)" type="info"
                    round>{{ key }}</el-tag>
                    
                    <el-input v-if="inputTagVisible" ref="InputTagRef" v-model="inputTagValue"
                        @keyup.enter="handelInputTagConfirm" @blur="handelInputTagConfirm"
                        style="width: 130px; height: 24px;" />
                    <button v-else class="input-tag-btn" @click="showInputTag">+ New Label</button>
                </el-row>
            </div>
            <el-divider direction="vertical" style="height:80px;margin:1px;"/>
            <div class="label-selector">
                <el-select-v2 v-show="editType === 'label'" placeholder="click a mask" v-model="selectedLabel" :options="labelOptions" filterable
                    style="width: 130px;" @change="handleSelectLabel" />
            </div>
            <div class="mask-slider">
                <vue-slider v-show="maskVisible" v-model=canvasOpacity class="opacity-silder" :min=0.0 :max=1.0
                    :interval=0.05 :process-style="{ backgroundColor: '#139FE1' }"
                    :tooltip-style="{ backgroundColor: '#139FE1', borderColor: '#139FE1' }"
                    :tooltip-placement="['bottom']" :contained="true">
                    <template v-slot:dot="{ focus }">
                        <div :class="['custom-dot', { focus }]"></div>
                    </template>
                </vue-slider>
            </div>
            <div class="checkbox-edit">
                <el-switch v-model="maskVisible" width="60" inline-prompt active-text="Mask" class="ml-2" style="--el-switch-on-color: #139FE1; --el-switch-off-color: #9a9999" />
            </div>
            <div class="tool-bar">    
                <!-- <el-button-group class="ml-4">
                    <el-button class="tool-item">Reset</el-button>
                    <el-button class="tool-item">Rmv</el-button>
                    <el-button class="tool-item">Add</el-button>
                    <el-button class="tool-item">Save</el-button>
                </el-button-group>             -->
                <div class="tools">
                    <span class="tool-item" @click="resetAllEdit" >Reset</span>
                    <el-divider direction="vertical" style="height:32px;margin:0;"/>
                    <span :class="'tool-item' + (selectNum == 0 || editType != 'rmv'  ? ' disabled' : '')" @click="removeSelectedMask">Rmv</span>
                    <el-divider direction="vertical" style="height:32px;margin:0;"/>
                    <span :class="'tool-item' + (editType != 'add'  ? ' disabled' : '')" @click="addMask">Add</span>
                    <el-divider direction="vertical" style="height:32px;margin:0;"/>
                    <span class="tool-item" @click="save">Save</span>
                </div>
            </div>
        </div>

        <div class="segment-wrapper">
            <div class="segment-content" v-loading="true" v-if="loading" style="z-index:80; height: 615px; width: 1024px;"></div>
            <img id="segment-image" class="segment-content" :src="imageUrl" :width="resize.w" :height="resize.h"
                @mousemove="handleMouseMove" @mousedown="handleMouseDown" @contextmenu="handleContextMenu"
                alt="fail loading" crossorigin="anonymous" lazy />
            <canvas id="segment-canvas" class="segment-content" :style="{ opacity: canvasOpacity }" :width="resize.w"
                :height="resize.h" v-show="maskVisible"></canvas>
            <div id="point-box" :style="{ width: resize.w, height: resize.h }"></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import VueSlider from 'vue-slider-component'
import { ElInput } from 'element-plus'
import { rleArrToBinaryMask, rleFromString } from '@/helper/maskUtils'
import { isPointInPolygon } from '@/helper/pointIn'
import { apiInstance } from '@/services/api'

interface ImageInfo {
    w: number;
    h: number;
    scale: number;
    ratio: number;
}
interface annoInfo {
    id: number;
    bbox: number[];
    scaleBbox: number[];
    binaryMask: number[][];
    hover: boolean;
    select: boolean;
    label: string;
    remove: boolean;
    add: boolean;
}

const props = defineProps({
    imgName: { type: String },
    jsonData: { type: String },
    imageUrl: { type: String },
    opacity: { type: Number, default: 0.3 },
    score: { type: Number, default: 0.62 },
});

const emit = defineEmits(['editResult']);
const loading = ref(false);
const editType = ref('label');
// watch(editType, (newValue) => {
//     console.log('selected value:', newValue);
// });
const inputTagVisible = ref(false);
const InputTagRef = ref<InstanceType<typeof ElInput>>();
const inputTagValue = ref('');
// var labelList :LabelInfo[] = [];
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
var addMaskColor = '#FEEFE5';
const selectColor = '#FFFFFF';

const labelTag: Ref<Object> = ref({ 'coral': colors[0] });
const labelOptions = ref(Object.entries(labelTag.value).map(([key,]) => ({ label: key, value: key })));
const selectedLabel = ref('');
var currentSelectId: number[] = [];

const windowSize: ImageInfo = { h: 615, w: 1024, ratio: 1024.0 / 615.0, scale: 1.0 };
var naturalSize: ImageInfo = { h: 615, w: 1024, ratio: 1024.0 / 615.0, scale: 1.0 };
var resize: ImageInfo = { h: 615, w: 1024, ratio: 1024.0 / 615.0, scale: 1.0 };


var annoList: annoInfo[] = [];
var canvasOpacity = ref(props.opacity);
var maskVisible = ref(true);

const selectNum = ref(0);
// const clicks = [];
// const clickHistory = [];

var resultMask;
var resultJson;

var interactiveImg: string = '';
var points: number[][] = [];
var pointLabels: number[] = [];
var returnAnno;
var candidateAnno: any[] = [];
var undoList: any[] = [];
const isUndoAdd = ref(false);
const isRedoAdd = ref(false);

var hasBbox = true;

const scale = async () => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = <string>props.imageUrl;
        image.onload = () => {
            let w = image.width;
            let h = image.height;
            let scale = 1.0;
            // console.log(w,h);
            const ratio = (w * 1.0) / (h * 1.0);
            naturalSize.w = w;
            naturalSize.h = h;
            naturalSize.ratio = ratio;

            if (windowSize.ratio < ratio) {
                w = windowSize.w;
                h = Math.round(windowSize.w / ratio);
            } else {
                w = Math.round(windowSize.h * ratio);
                h = windowSize.h;
            }
            scale = (w * 1.0) / (image.width * 1.0);
            var res: ImageInfo = { w: w, h: h, ratio: ratio, scale: scale };
            resolve(res);
        };
        image.onerror = (error) => {
            reject(error);
        }
    })
}

const initEdit = async () => {
    try {
        // get the scale factor of the image to segment-content
        var res: ImageInfo = <ImageInfo>await scale();
        // console.log(res);
        resize = res;

        // resize the image
        const img = document.getElementById('segment-image') as HTMLImageElement;
        img.style.width = resize.w + "px";
        img.style.height = resize.h + "px";
        // resize the canvas
        const canvas = <HTMLCanvasElement>document.getElementById('segment-canvas');
        canvas.width = resize.w;
        canvas.height = resize.h;

    } catch (error) {
        console.error("Error scaling the image");
    }

    interactiveImg = <string>props.imgName;
    // console.log(props);
    // get the bbox list
    var json = JSON.parse(<string>props.jsonData);
    annoList = json.annotations.map(item => {
        hasBbox = item.hasOwnProperty('bbox');
        var list = hasBbox ? item.bbox : [];
        var newItem: annoInfo = {
            id: item.id,
            bbox: item.bbox,
            scaleBbox: hasBbox ? list.map(point => point * resize.scale) : [],
            binaryMask: rleArrToBinaryMask(rleFromString(item['segmentation']['counts']), item['segmentation']['size']),
            // binaryMask: rleArrToBinaryMask(item['uncompressed_segmentation']['counts'],item['uncompressed_segmentation']['size']),
            hover: false,
            select: false,
            label: item.label || 'coral',
            remove: false,
            add: false,
        };
        return newItem;
    });
    // console.log(bboxlist);

    // get the label list
    var exitLabel = annoList.reduce((acc, arr) => {
        var label = arr.label;
        acc[label] = label;
        return acc;
    }, {});
    labelTag.value = Object.assign({}, labelTag.value, exitLabel);
    Object.keys(labelTag.value).forEach((key, index) => {
        labelTag.value[key] = colors[index % colors.length];
    });
    // console.log(labelTag.value);
    labelOptions.value = Object.entries(labelTag.value).map(([key,]) => ({ label: key, value: key }));
    // nextTick(() => {
    //     drawLabelBbox();
    // });

    nextTick(() => {
        // drawSelectMask(annoList[0].binaryMask, labelTag.value[annoList[0].label], resize.scale);
        drawAllMask(resize.scale);
    });
}

const drawSelectBbox = (bbox: number[], color: string) => {
    const canvas = <HTMLCanvasElement>document.getElementById('segment-canvas');
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (ctx) {
        // ctx.clearRect(0, 0, resize.w, resize.h);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(bbox[0], bbox[1], bbox[2], bbox[3]);
        ctx.stroke();
    }
}

const drawSelectMask = (mask: number[][], color: string, scale: number) => {
    const canvas = <HTMLCanvasElement>document.getElementById('segment-canvas');
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (ctx) {
        // console.log(labelTag.value[anno.label]);

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
                    // console.log(x, y, Math.round(x*scale), Math.round(y*scale));
                    offscreenCtx.fillStyle = color;
                    offscreenCtx.fillRect(x, y, 1, 1);
                }
            }
        }

        // Draw the offscreen canvas onto the main canvas
        ctx.globalAlpha = 0.6;
        ctx.drawImage(offscreenCanvas, 0, 0, canvasWidth * scale, canvasHeight * scale);

        // Reset globalAlpha
        ctx.globalAlpha = 1;
        // ctx.globalAlpha = 0.6;
        // ctx.fillStyle = color;
        // for (let y = 0; y < naturalSize.h; y++) {
        //     for (let x = 0; x < naturalSize.w; x++) {
        //         if (mask[y][x] === 1) {
        //             ctx.fillRect(x*scale,y*scale,1,1);
        //         }
        //     }
        // }

    }
}

const drawAllMask = (scale: number) => {
    const canvas = <HTMLCanvasElement>document.getElementById('segment-canvas');
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (ctx) {
        // ctx.clearRect(0, 0, resize.w, resize.h);
        annoList.forEach(anno => {
            // var anno = annoList[0];
            if (!anno.remove) {
                let mask = anno.binaryMask;
                // var count = mask.reduce((acc, row) => {
                //     return (
                //     acc +
                //     row.reduce((rowAcc, element) => {
                //         return rowAcc + (element == 1 ? 1 : 0);
                //     }, 0)
                //     );
                // }, 0);
                // console.log(count);
                ctx.fillStyle = labelTag.value[anno.label];
                const scaleFactor = 2; // Supersampling factor
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
                ctx.drawImage(offscreenCanvas, 0, 0, canvasWidth * scale, canvasHeight * scale);

                // Reset globalAlpha
                ctx.globalAlpha = 1;

                // ctx.globalAlpha = 0.6;
                // for (let y = 0; y < naturalSize.h; y++) {
                //     for (let x = 0; x < naturalSize.w; x++) {
                //         if (mask[y][x] === 1) {
                //             ctx.fillRect(x*scale,y*scale,1,1);
                //         }
                //     }
                // }
            }
        });
    }
}

const clearCanvas = () => {
    const canvas = <HTMLCanvasElement>document.getElementById('segment-canvas');
    canvas.width = resize.w;
    canvas.height = resize.h;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (ctx) {
        ctx.clearRect(0, 0, resize.w, resize.h);
    }
}

const handleMouseMove = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const mouseX = event.clientX - rect.left + 0.5;
    const mouseY = event.clientY - rect.top + 1;
    var xr = Math.round(mouseX / resize.scale);
    var yr = Math.round(mouseY / resize.scale);
    var x = xr < naturalSize.w? xr: xr-1;
    var y = yr < naturalSize.h? yr: yr-1;

    // console.log('image size', naturalSize);
    if (editType.value == 'rmv') {
        // console.log(mouseX, mouseY);
        var isDraw = false;
        annoList.forEach(anno => {
            if (!anno.remove) {
                let mask = anno.binaryMask;
                if (isPointInPolygon(x, y, mask)) {
                    if (!anno.hover && !anno.select && hasBbox) drawSelectBbox(anno.scaleBbox, labelTag.value[anno.label]);
                    anno.hover = true;
                    return;
                } else {
                    if (anno.hover && !anno.select) isDraw = true;
                    anno.hover = false;
                }
            }
        });
        if (isDraw) {
            resetCanvas();
            annoList.forEach(anno => {
                if (anno.select) {
                    if (hasBbox) drawSelectBbox(anno.scaleBbox, selectColor);
                    drawSelectMask(anno.binaryMask, selectColor, resize.scale);
                }
            });
        }

    } else if (editType.value == 'label') {
        // console.log('label move');
        var isDraw = false;
        annoList.forEach(anno => {
            if (!anno.remove) {
                let mask = anno.binaryMask;
                // console.log(mask[naturalSize.h][0]);
                // console.log(x, y, mask[0].length, mask.length);
                if (isPointInPolygon(x, y, mask)) {
                    if (!anno.hover && !currentSelectId.includes(anno.id)) drawSelectBbox(anno.scaleBbox, labelTag.value[anno.label]);
                    anno.hover = true;
                    return;
                } else {
                    if (anno.hover && !currentSelectId.includes(anno.id)) isDraw = true;
                    anno.hover = false;
                }
            }
        });
        if (isDraw) {
            resetCanvas();
            annoList.forEach(anno => {
                if (currentSelectId.includes(anno.id)) {
                    if (hasBbox) drawSelectBbox(anno.scaleBbox, selectColor);
                    drawSelectMask(anno.binaryMask, selectColor, resize.scale);
                }
            });
        }
    }
}

const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
}

const handleMouseDown = (event: MouseEvent) => {
    if (event.button === 2 && editType.value != 'add') {
        return;
    }

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const mouseX = event.clientX - rect.left + 0.5;
    const mouseY = event.clientY - rect.top + 1;
    var xr = Math.round(mouseX / resize.scale);
    var yr = Math.round(mouseY / resize.scale);
    var x = xr < naturalSize.w? xr: xr-1;
    var y = yr < naturalSize.h? yr: yr-1;
    // console.log(mouseX, mouseY);
    if (editType.value == 'rmv') {
        console.log("====rmv mousedown=====");
        var clearFlag = true, unselect = false;
        annoList.forEach(anno => {
            if (!anno.remove) {
                let mask = anno.binaryMask;
                if (isPointInPolygon(x, y, mask)) {
                    clearFlag = false;
                    if (!anno.select) {
                        if (hasBbox) drawSelectBbox(anno.scaleBbox, selectColor);
                        drawSelectMask(mask, selectColor, resize.scale);
                    } else {
                        unselect = true;
                    }
                    anno.select = !anno.select;
                }
            }
        });
        if (clearFlag) {
            resetCanvas();
            annoList.map(anno => anno.select = false);
        }
        if (unselect) {
            resetCanvas();
            annoList.forEach(anno => {
                if (anno.select && !anno.remove) {
                    if (hasBbox) drawSelectBbox(anno.scaleBbox, selectColor);
                    drawSelectMask(anno.binaryMask, selectColor, resize.scale);
                }
            });
        }

        selectNum.value = annoList.filter(anno => anno.select === true).length;

    } else if (editType.value == 'label') {
        console.log('===label mousedown===');
        var clearFlag = true, unselect = false, difselect = false;
        annoList.forEach(anno => {
            if (!anno.remove) {
                let mask = anno.binaryMask;
                if (isPointInPolygon(x, y, mask)) {
                    clearFlag = false;
                    if (selectedLabel.value != '' && selectedLabel.value != anno.label) difselect = true;
                    selectedLabel.value = anno.label;
                    if (currentSelectId.includes(anno.id)) {
                        currentSelectId = currentSelectId.filter(id => id !== anno.id);
                        unselect = true;
                    } else {
                        currentSelectId.push(anno.id);
                        if (hasBbox) drawSelectBbox(anno.scaleBbox, selectColor);
                        drawSelectMask(mask, selectColor, resize.scale);
                    }
                }
            }
        });

        if (clearFlag) {
            selectedLabel.value = '';
            currentSelectId = [];
            resetCanvas();
        }
        if (difselect || currentSelectId.length == 0) selectedLabel.value = '';
        // drawAllMask(resize.scale);
        if (unselect) {
            resetCanvas();
            annoList.forEach(anno => {
                if (!anno.remove && currentSelectId.includes(anno.id)) {
                    if (hasBbox) drawSelectBbox(anno.scaleBbox, selectColor);
                    drawSelectMask(anno.binaryMask, selectColor, resize.scale);
                }
            });
        }
    } else if (editType.value == 'add') {
        if (event.button === 0) {
            console.log("left click");
            generatePoint(mouseX, mouseY, true);
            pointLabels.push(1);
            points.push([x, y]);
        } else if (event.button === 2) {
            console.log("right click");
            generatePoint(mouseX, mouseY, false);
            pointLabels.push(0);
            points.push([x, y]);
        }
        resetCanvas();
        getAdvancedInference();
        isUndoAdd.value = points.length == 0 ? false : true;
        isRedoAdd.value = undoList.length == 0 ? false : true;
    }
}

const getAdvancedInference = async () => {
    let params = {
        "image_name": interactiveImg,
        "points": points,
        "labels": pointLabels
    }
    // console.log(params);
    const result = await apiInstance.post('/try_it_out/interactiveInference', params, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    // console.log(result);
    returnAnno = result.data;
    if (hasBbox && !('bbox' in returnAnno)) {
        returnAnno['bbox'] = [105, 100, 100, 100];
    }
    // console.log(returnAnno);
    let cnts = rleFromString(result.data.segmentation.counts);
    let mask = rleArrToBinaryMask(cnts, result.data.segmentation.size);
    // console.log(mask);
    // const count = mask.reduce((acc, row) => {
    //     return (
    //       acc +
    //       row.reduce((rowAcc, element) => {
    //         return rowAcc + (element !== 0 ? 1 : 0);
    //       }, 0)
    //     );
    //   }, 0);
    // console.log(count);
    // returnAnno["uncompressed_segmentation"] = {
    //     "counts": cnts,
    //     "size": result.data.segmentation.size
    // };

    drawSelectMask(mask, addMaskColor, resize.scale);

}
const resetAllEdit = () => {
    if (editType.value == 'add') {
        resetAdd();
    } else if (editType.value == 'rmv') {
        resetRmv();
    } else if (editType.value == 'label') {
        resetLabel();
    }
}
const resetRmv = () => {
    selectNum.value = 0;
    annoList.forEach(anno => {
        anno.hover = false;
        anno.select = false;
        anno.remove = false;
    })
    resetCanvas();
}

const removeSelectedMask = async () => {
    if (selectNum.value == 0) return;
    // console.log("====before remove=====");
    // console.log(bboxlist);
    annoList.forEach(anno => {
        if (anno.select) {
            anno.remove = true;
            anno.select = false;
            console.log("remove---");
        }
    });
    selectNum.value = annoList.filter(anno => anno.select === true).length;
    resetCanvas();
}

const handelInputTagConfirm = () => {
    if (inputTagValue.value) {
        if (!Object.keys(labelTag.value).includes(inputTagValue.value)) {
            var color = colors[0];
            var availableColor = colors.find(col => !Object.values(labelTag.value).includes(col));
            if (availableColor) {
                color = availableColor;
            } else {
                color = colors[Object.keys(labelTag.value).length % colors.length];
            }
            labelTag.value[inputTagValue.value] = color;

            labelOptions.value = Object.entries(labelTag.value).map(([key,]) => ({ label: key, value: key }));
        }
    }
    inputTagVisible.value = false;
    inputTagValue.value = '';
}

const showInputTag = () => {
    inputTagVisible.value = true;
    nextTick(() => {
        InputTagRef.value!.input!.focus();
    });
}

const handleCloseTag = (tag: string) => {
    delete labelTag.value[tag];
    labelOptions.value = Object.entries(labelTag.value).map(([key,]) => ({ label: key, value: key }));

    clearCanvas();
    if (selectedLabel.value == tag) selectedLabel.value = '';
    annoList = annoList.map(anno => {
        var newItem = anno;
        if (anno.label == tag) newItem.label = 'coral';
        return newItem;
    });
    annoList.forEach(anno => {
        if (!anno.remove && currentSelectId.includes(anno.id)) {
            if (hasBbox) drawSelectBbox(anno.scaleBbox, labelTag.value[anno.label]);
            if (selectedLabel.value != anno.label) selectedLabel.value = '';
        }
    });
    drawAllMask(resize.scale);
}

const handleSelectLabel = () => {
    clearCanvas();
    annoList.forEach(anno => {
        if (!anno.remove && currentSelectId.includes(anno.id)) {
            anno.label = selectedLabel.value;
            if (hasBbox) drawSelectBbox(anno.scaleBbox, labelTag.value[anno.label]);
            // drawSelectMask(anno.binaryMask, anno.label, resize.scale);
        }
    });
    drawAllMask(resize.scale);
}

const resetLabel = () => {
    var json = JSON.parse(<string>props.jsonData);
    var jsonAnnoList = json.annotations;
    annoList = annoList.map(anno => {
        let newAnno = anno;
        if (!anno.remove) {
            var jsonAnno = jsonAnnoList.find(item => item.id == anno.id);
            if (jsonAnno) newAnno.label = jsonAnno.label;
            else newAnno.label = 'coral';
        }
        return newAnno;
    })
    currentSelectId = [];
    resetCanvas();
}

const handleChangeEditType = async () => {
    resetAdd();
    if (editType.value == 'rmv') {
        console.log("====switch to rmv===");
        annoList.forEach(anno => {
            if (!anno.remove && anno.select) {
                if (hasBbox) drawSelectBbox(anno.scaleBbox, selectColor);
                drawSelectMask(anno.binaryMask, selectColor, resize.scale);
            }
        });
    } else if (editType.value == 'label') {
        console.log("====switch to label===");
        annoList.forEach(anno => {
            if (!anno.remove && currentSelectId.includes(anno.id)) {
                if (hasBbox) drawSelectBbox(anno.scaleBbox, selectColor);
                drawSelectMask(anno.binaryMask, selectColor, resize.scale);
            }
        });
        // drawAllMask(resize.scale);
    } else if (editType.value == 'add') {
        console.log("====switch to add===");
        // drawAllMask(resize.scale);
    }
}

const generateResultMask = () => {
    const canvas = <HTMLCanvasElement>document.createElement('canvas');
    canvas.width = naturalSize.w;
    canvas.height = naturalSize.h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // ctx.clearRect(0, 0, resize.w, resize.h);
        annoList.forEach(anno => {
            if (!anno.remove) {
                let mask = anno.binaryMask;
                // console.log(labelTag.value[anno.label]);
                ctx.fillStyle = labelTag.value[anno.label];
                const scaleFactor = 2; // Supersampling factor
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
    }
    return canvas.toDataURL();
}

const save = async () => {
    var json = JSON.parse(<string>props.jsonData);
    var anno = json.annotations;
    candidateAnno.forEach(item => {
        let newAnno = {
            "segmentation": item.segmentation,
            // "uncompressed_segmentation": item.uncompressed_segmentation,
            "area": item.area,
            "bbox": hasBbox ? item.bbox : [],
            "stability_score": item.score,
            "label": item.label,
            "point_coords": item.point_coord,
            "id": item.id,
        };
        anno.push(newAnno);
    });
    anno = anno.map(item => {
        var label: any[] = annoList.filter(anno => anno.id == item.id);
        var newItem = item;
        newItem['label'] = label[0].label;
        if (!hasBbox) delete newItem['bbox'];
        // console.log(label);
        return newItem;
    });
    removeSelectedMask().then(() => {
        anno = anno.filter(item => annoList.some(a => (a.id === item.id && !a.remove)));
        // console.log(anno);
        resultJson = json;
        resultJson.annotations = anno;
        resultMask = generateResultMask();
        var result = { 'editType': 'all', 'editJson': resultJson, 'editMask': resultMask, 'labels': labelTag.value };
        emit('editResult', result);
    }
    );


    pointLabels = [];
    points = [];
    let box = <HTMLDivElement>document.getElementById('point-box');
    box.innerHTML = '';
}

// const saveLabel = () => {
//     console.log("===save label===");
//     var json = JSON.parse(<string>props.jsonData);
//     var anno = json.data.annotations.map(item => {
//         var label:any[] = annoList.filter(anno => anno.id == item.id);
//         var newItem = item;
//         newItem['label'] = label[0].label;
//         // console.log(label);
//         return newItem;
//     });
//     // console.log(anno);
//     resultJson = json;
//     resultJson.data.annotations = anno;
//     resultMask = generateResultMask();
//     var result = {'editType': 'label', 'editJson': resultJson, 'editMask': resultMask};
//     emit('editResult', result);
// }

const generatePoint = (x: number, y: number, clickType: boolean) => {
    let box = document.getElementById('point-box');
    let point = document.createElement('div');
    point.className = 'segment-point' + (clickType ? '' : ' negative');
    point.style.left = x - 5 + 'px';
    point.style.top = y - 5 + 'px';
    point.id = 'point-';
    box?.appendChild(point);
}

const resetCanvas = () => {
    clearCanvas();
    drawAllMask(resize.scale);
}

const resetAdd = () => {
    pointLabels = [];
    points = [];
    let box = <HTMLDivElement>document.getElementById('point-box');
    box.innerHTML = '';
    resetCanvas();
}
// const undoAdd = () => {

// }
// const redoAdd = () => {

// }

const addMask = () => {
    var maxId = annoList.reduce((prev, current) => {
        return prev.id > current.id ? prev : current;
    }).id;
    // console.log(maxId);
    returnAnno["id"] = maxId + 1;
    let cnts = rleFromString(returnAnno.segmentation.counts);
    let mask = rleArrToBinaryMask(cnts, returnAnno.segmentation.size);
    let newAnno: annoInfo = {
        id: returnAnno.id,
        bbox: hasBbox ? returnAnno.bbox : [],
        scaleBbox: hasBbox ? returnAnno.bbox.map(point => point * resize.scale) : [],
        binaryMask: mask,
        hover: false,
        select: false,
        label: returnAnno.label || 'coral',
        remove: false,
        add: true,
    }
    annoList.push(newAnno);

    candidateAnno.push(returnAnno);

    resetAdd();
}

// const saveAdd = () => {
//     console.log("===save add===");
//     var json = JSON.parse(<string>props.jsonData);
//     var anno = json.data.annotations;

//     candidateAnno.forEach(item => {
//         let newAnno = {
//             "segmentation": item.segmentation,
//             "uncompressed_segmentation": item.uncompressed_segmentation,
//             "area": item.area,
//             "bbox": item.bbox,
//             "stability_score": item.score,
//             "label": item.label,
//             "point_coords": item.point_coord,
//             "id": item.id,
//         };
//         anno.push(newAnno);
//     });

//     // console.log(anno);
//     resultJson = json;
//     resultJson.data.annotations = anno;
//     resultMask = generateResultMask();
//     var result = {'editType': 'label', 'editJson': resultJson, 'editMask': resultMask};
//     emit('editResult', result);

//     resetAdd();
// }

onMounted(async () => {
    loading.value = true;
    await initEdit();
    loading.value = false;
})

</script>

<style>
.segment-box {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 1168px;
    height: 700px;
    text-align: center;
}
.segment-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
}
.segment-header .edit-type {
    display: flex;
    flex-direction: column;
    min-width: 210px;
    width: 230px;
    max-width: 230px;
    /* height: 100px; */
}
.segment-header .edit-type .edit-type-group {
    display: flex;
    justify-content: center;
    height: 40px;
    text-align: center;
}
.segment-header .edit-type p {
    font-weight: 500;
    text-align: left;
    margin: 0;
    padding: 0;
}
.segment-header .edit-type p span {
    font-weight: 300;
    text-align: left;
}
.segment-wrapper {
    /* position: absolute;
    left: 55px;
    top: 40px; */
    width: 100%;
    height: 618px;

}

.segment-content {
    position: absolute;
    left: 72px;
    top: 85px;
}

.segment-point {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #409EFF;
}

.segment-point.negative {
    background-color: #F56C6C;
}

#segment-image {
    z-index: 1;
}

#segment-mask {
    mix-blend-mode: multiply;
    z-index: 20;
}

#segment-canvas {
    pointer-events: none;
    transform-origin: left top;
    z-index: 50;
    /* opacity: 0.6; */
}

#point-box {
    position: absolute;
    left: 72px;
    top: 85px;
    z-index: 100;
    pointer-events: none;
}

.tool-bar {
    display: flex;
    justify-content: space-between;
    position: inherit;
    top: 0;
    left: 20px;
    height: 80px;
    /* width: 1024px; */
    gap: 16px;
    text-align: center;

    .tool-tip {
        font-size: 16px;
        font-weight: 700;
        text-align: center;
        padding: 0 10px 0 10px;
        min-width: 110px;
    }
}

.mask-slider {
    min-width: 110px;
}

.opacity-silder {
    min-width: 100px;
    margin-top: 20px;
}

.tools {
    border: 1px solid #F1F1F3;
    border-radius: 8px;
    background-color: white;
    color: #111110;
    display: flex;
    justify-content: space-between;
    margin: 2px;
    height: 32px;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    margin: 10px;
}

.tool-item {
    font-size: 14px;
    font-weight: 600;
    padding: 6px 10px;
    cursor: pointer;
    
    /* border: 1px dotted grey; */
}

.tool-item:hover {
    color: #139FE1;
}

.tool-item.disabled {
    opacity: 0.4;
    pointer-events: none;
}

.label-set {
    /* display: flex; */
    /* flex-direction: column;
    justify-items: start; */
    width: 360px;
    z-index: 80;
    height: 80px;
    overflow-y: auto;
    scrollbar-width: thin;
    /* overflow-x: hidden; */
}

.label-set-title {
    font-size: 16px;
    font-weight: 500;
    /* text-align: left; */
    padding-bottom: 10px;
}

.label-set-item {
    display: flex;
    justify-items: left;
    gap: 8px;
    max-width: 360px;
    padding-top: 2px;
    /* overflow: auto;
    scrollbar-width: thin;
    height: 80px; */
}

.label-item {
    /* background-color: #139FE1; */
    /* color: white; */
    font-size: 16px;
    font-weight: 600;
}

.input-tag-btn {
    background-color: white;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    height: 24px;
    width: 100px;
    min-width: 100px;
    font-size: 14px;
    padding: 0 8px 0 8px;
    color: #606266;
    cursor: pointer;

    input {
        min-width: 100px;
    }
}

.el-input__wrapper {
    min-width: 100px;
}

.input-tag-btn:hover {
    color: #139FE1;
    border-color: #139FE1;
}

.label-selector {
    width: 130px;
    padding-top: 15px;
}

.checkbox-edit {
    padding-top: 15px;
}
</style>