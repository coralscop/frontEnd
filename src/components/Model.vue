<template>
    <Logo></Logo>
    <div class="model-page">
        <div class="mode">
            <label class="radio">
                <input type="radio" name="mode-radio" v-model="mode" value="auto" checked>
                <span class="mode-item">Automatic</span>
            </label>
            <label class="radio">
                <input type="radio" name="mode-radio" v-model="mode" value="std">
                <span class="mode-item">Spare To Dense</span>
            </label>
        </div>
        <!-- <div class="blank"></div> -->
        <AutoModel v-if="mode == 'auto'" :usrMode="'try'"></AutoModel>
        <StdModel v-if="mode == 'std'"></StdModel>
    </div>
</template>

<script lang="ts" setup>
const mode = ref('auto');

</script>

<style>
.blank {
    width: 100%;
    height: 60px;
}
.model-page {
    display: flex;
    flex-direction: column;
    /* gap: 16px; */
}

.mode {
    display: flex;
    flex-wrap: wrap;
    border-radius: 0.5rem;
    background-color: #EEE;
    box-sizing: border-box;
    box-shadow: 0 0 0px 1px rgba(0, 0, 0, 0.06);
    padding: 0.25rem;
    width: 300px;
    font-size: 14px;
    margin-top: 20px;
}

.mode .radio {
    flex: 1 1 auto;
    text-align: center;
}

.mode .radio input {
    display: none;
}

.mode .radio .mode-item {
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    border: none;
    padding: .5rem 0;
    color: rgba(51, 65, 85, 1);
    transition: all .15s ease-in-out;
}

.mode .radio input:checked+.mode-item {
    background-color: #fff;
    font-weight: 600;
}
</style>