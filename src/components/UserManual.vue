<template>
    <Logo></Logo>
    <div class="page-container">
        <div class="page-menu">
            <div class="cardTagContainer">
                <div class="cardTag" v-for="(nav, index) in navList" :key="index" @click="goAnchor('#tag' + index)">
                    {{ nav.title }}
                </div>
            </div>
        </div>
        <div class="page-content">
            <div class="title">User Manual</div>
            <div class="intro">
                <span>We are continuously improving our platform to provide more user-friendly and efficient service for coral reef analysis. We plan to finish all the functions and APIs by early July.</span>
                <span>Stay tuned and sorry for the inconvenience caused to you! If you found any bugs or had any questions, please don't hesitate to contact us via coralscop@gmail.com.</span>
            </div>
            <div class="step">
                <span class="sub-title">Steps:</span>

                <span class="sub-title" id="tag0">1 Uploading the coral reef images</span>
                <span>The users could upload their own coral reef images to our platform to generate the coral masks automatically.</span>
                <img :src="img1">
                <img :src="img2">

                <span class="sub-title" id="tag1">2	Run the model </span>
                <img :src="img3">
                <span>Due to the consideration of both computational resources and response time, the default model is with <b>ViT-B</b> backbone. We will provide more powerful models (<b>ViT-L</b> and <b>ViT-H</b>) for our registered users. </span>
                <span><b>The registration is all free and the user registration is only for better user management and data organization! Users could set their own image public or private and create their own Labelsets for coral reef analysis from different levels.</b></span>
                <span><b>Result with visualization:</b></span>
                <img :src="img4">
                <span>We detect the coral reefs within the images and all the generated masks are with the label “Coral”.</span>
                <span>Model Parameter Explanation:</span>
                <img :src="img5">
                <ul>
                    <li>
                        <span><b>Point Per Side: </b>The size of grid point prompts for generating the coral masks, which controls the granularity of the generated masks. Larger values yield more coral reef masks but also longer response times.</span>
                    </li>
                    <li>
                        <span><b>Predicted iou: </b>The default is 0.82. It indicates the quality of the generated coral masks. The coral masks with predicted iou below this value will be filtered out. Lower values will yield more coral reef masks. The visibility, occlusion, image resolution, viewpoint, camera distance, and other factors can affect this value. Please adjust this value according to your images. We are now developing the automatic pipeline to determine this value appropriately based on the image contents.</span>
                    </li>
                    <li>
                        <span><b>Stability score: </b>The default is 0.62, from 0.42 to 0.82. The stability of the generated coral masks. It helps to split dissimilar coral reefs into different coral masks.</span>
                    </li>
                    <li>
                        <span><b>Min area: </b>The default is 100. Coral masks with areas lower than this value will be removed. Users could adjust this value according to their requirement.</span>
                    </li>    
                </ul>

                <span class="sub-title" id="tag2">3	Coral Mask Editing </span>
                <img :src="img6">
                <span>Click “Edit” to do post-processing of the generated coral masks</span>
                <img :src="img7">
                <span>Now we support three basic functions: 1) “Label redefinition”; 2) “Remove wrong coral masks”; 3) “Add masks for some missing coral reef areas or non-coral organisms”.</span>
                <span></span>

                <span class="subsub-title">3.1 Label Redefinition </span>
                <ul>
                    <li>
                        <b>Define the user Labelset (for example, Species A, B, C, D, E and etc) based on your requirement:</b>
                        <img :src="img8">
                    </li>
                    <li>
                        <b>Glide your mouse to check all the defined semantics/labelsets (species)</b>
                        <br>
                        <img :src="img9">
                        <br>
                        <img :src="img10">
                        <br>
                        <span>Users could add or remove the labelsets.</span>
                    </li>
                    <li>
                        <b>Relabel the coral masks</b>
                        <br>
                        <b>Mask selection: </b> <span>Users could click the single or multiple coral masks to change the label of the coral masks. The selected coral masks are visualized with BBOX (we will promote this for better user experience very soon).</span>
                        <br>
                        <b>Single mask:</b>
                        <img :src="img11">
                        <br>
                        <b>Multiple masks:</b>
                        <img :src="img12">
                    </li>
                    <li>
                        <b>Change the label of the selected coral masks:</b>
                        <img :src="img13">
        
                        <span>Once clicked, the label and the visualization of the selected masks will be changed.</span>
        
                        <img :src="img14">
        
                    </li>
                    <li>
                        <b>Mask Release: </b><span>Users could click other regions to release all the selected masks.</span>
                    </li>
                    <li>
                        <b>Label redefinition:</b>
        
                        <span>The users could change the labels of the masks according to their expertise and requirement.</span>
                        <img :src="img15">
                    </li>
                    <li>
                        <b>Save the modifications:</b>
                        <img :src="img16">
                    </li>
                </ul>

                <span class="subsub-title">3.2 Removing Mask </span>
                <span>Users could remove some generated wrong masks and unnecessary masks according to their requirement. Click single/multiple masks as follows and then click “Remove”.</span>
                <img :src="img17">
                <span>Then we can remove such masks:</span>
                <img :src="img18">
                <span><b>We will promote the visualization way for better user experience very soon!</b></span>

                <span class="subsub-title">3.3 Adding mask</span>
                <span><b>Users could click the some points to add some new masks for the missed coral reef areas or the areas they are interested.</b></span>
                <span><b> Positive prompt (<span style="color: #409EFF;">Blue points</span>): left mouse button. Please click the regions you are interested.</b></span>
                <img :src="img19">
                <span><b> Negative prompt  (<span style="color: #F56C6C;">Orange points</span>): right mouse button. Please click the regions that you want to reject.</b></span>
                <img :src="img20">
                <span>Currently, due to the reason we are using Canvas layout to collect the user clicks, the coordinates may not be 100% accurate and the generate masks are not that sensitive to the user clicks. We will promote this very soon to generate more accurate regions to reduce the time of user clicks.</span>
                <span><b>“Reset”</b> button is used to remove all the point prompts (all the clicked points).</span>
                <span>Click <b>“AddMask”</b> to add this region</span>
                <img :src="img21">
                <span>The added new mask will be assigned with default “coral” label. Users could then adjust the label in the “Label redefinition” function describe in 3.1. 
                <br>We will revise this to promote the user experience very soon.
                </span>
                <img :src="img22">
                <span><b>Bounding box (BBOX)prompt will be integrated very soon!</b></span>
                <span><b>Click “Save” to save all your modifications</b></span>
                <img :src="img23">

                <span class="sub-title" id="tag3">4	Downloading your results</span>
                <span><b>After saving all your changes, you can download the processed files:</b></span>
                <img :src="img24">
                <span>The files contain: </span>
                <span>
                    <ol>
                        <li>result image with visualization</li>
                        <li>Mask image in the canvas format</li>
                        <li>Json file to record all the original information for visualization.</li>
                        <li>All, download all the file</li>
                    </ol>
                </span>

                <span class="sub-title" id="tag4">5	TODO lists</span>
                <ul>
                    <li>User management: creating workspace for each user and they can create their own jobs. (expected to be added at the end of June, 2024)</li>
                    <li>Batch processing and refinement: support the processing of batch files and the users do the post-processing. (expected to be added at the end of June, 2024)</li>
                    <li>Few-shot user-defined fine-tuning: train the classifier based on the user-defined labelsets. The trained variant could generate masks with labels from the user-defined labelsets automatically. Every user will have their own model in their workspace. (expected to be added at the end of July, 2024)</li>
                    <li>Video processing: perform the coral reef video analysis. (expected to be added at the end of August, 2024)</li>

                </ul>
                
            </div>
        </div>
    </div>


</template>

<script lang="ts" setup>
import img1 from '@/assets/usermanual/Picture 1.png'
import img2 from '@/assets/usermanual/Picture 2.png'
import img3 from '@/assets/usermanual/Picture 3.png'
import img4 from '@/assets/usermanual/Picture 4.png'
import img5 from '@/assets/usermanual/Picture 5.png'
import img6 from '@/assets/usermanual/Picture 6.png'
import img7 from '@/assets/usermanual/Picture 7.png'
import img8 from '@/assets/usermanual/Picture 8.png'
import img9 from '@/assets/usermanual/Picture 9.png'
import img10 from '@/assets/usermanual/Picture 10.png'
import img11 from '@/assets/usermanual/Picture 11.png'
import img12 from '@/assets/usermanual/Picture 12.png'
import img13 from '@/assets/usermanual/Picture 13.png'
import img14 from '@/assets/usermanual/Picture 14.png'
import img15 from '@/assets/usermanual/Picture 15.png'
import img16 from '@/assets/usermanual/Picture 16.png'
import img17 from '@/assets/usermanual/Picture 17.png'
import img18 from '@/assets/usermanual/Picture 18.png'
import img19 from '@/assets/usermanual/Picture 19.png'
import img20 from '@/assets/usermanual/Picture 20.png'
import img21 from '@/assets/usermanual/Picture 21.png'
import img22 from '@/assets/usermanual/Picture 22.png'
import img23 from '@/assets/usermanual/Picture 23.png'
import img24 from '@/assets/usermanual/Picture 24.png'

const navList = [{
    'index': 1,
    'title': '1 Upload'
},{
    'index': 2,
    'title': '2	Run model'
},{
    'index': 3,
    'title': '3	Mask Editing'
},{
    'index': 4,
    'title': '4	Download'
},{
    'index': 5,
    'title': '5	TODO lists'
}];

const goAnchor = (selector) => {
    // console.log(selector)
    document.querySelector(selector).scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}
</script>

<style>
.page-container {
    /* position: relative; */
    display: flex;
    margin: 10px;
    flex-direction: row;
    justify-items: space-between;
    /* width: 80vw; */
    text-align: left;
}
.page-menu {
    display: flex;
    width: 8vw;
    /* max-width: 128px; */
    height: 100vh;
}
.page-content {
    display: flex;
    flex-direction: column;
    width: 80vw;
}
.title {
    font-size: 28px;
    font-weight: 600;
    margin: 20px;
    text-align: center;
}
.intro {
    color: red;
    text-decoration: underline;
    text-align: left;
    display: flex;
    flex-direction: column;
    margin: 5px;

}
.step .sub-title {
    font-size: 20px;
    font-weight: 500;
    text-decoration: underline;
    display: flex;
    margin-bottom: 15px;
    margin-top: 15px;
}
.subsub-title {
    font-size: 20px;
    font-weight: 500;
    display: flex;
    margin-bottom: 10px;
    margin-top: 10px;
}
.step {
    display: flex;
    flex-direction: column;

    span {
        /* display: flex; */
        margin: 5px;
    }
}
.page-container img {
    display: flex;
    margin-top: 10px;
    margin-bottom: 10px;
}
.cardTagContainer {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 130px;
    left: 2px;
    background-color: white;
    border-radius: 10px;
    /* border: 1px solid rgba(0, 0, 0, 0.04); */
    padding: 10px;
    width: 128px;
    max-width: 8vw;
}
.cardTag {
    border: 0.5px solid rgba(0, 0, 0, 0.04);
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;

}
</style>
