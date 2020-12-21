<template>
    <div id="interface">
        <p v-if="!displayLoader">
          Nous attendons votre mot pour commencer !
        </p>
        <div v-if="displayLoader">
            <b-spinner type="border" style="width: 3rem; height: 3rem;" label="Large Spinner"></b-spinner>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        displayLoader: Boolean,
    }
}
</script>