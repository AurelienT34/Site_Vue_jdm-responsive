<template>
    <div id="interface">
        <p v-if="!displayLoader">
          Nous attendons votre mot pour commencer !
        </p>
        <div v-if="displayLoader">
            <b-spinner type="border" small></b-spinner>
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