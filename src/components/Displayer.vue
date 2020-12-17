<template>
    <div>
        <b-card :title="elements">
      <b-card-text>
        <p>{{text}}</p>
        <b-overlay :show.sync="show" no-wrap></b-overlay>
      </b-card-text>
      </b-card>
    </div>
</template>

<script>
export default {
    name: "Displayer",

    props:{
        show: Boolean,
        elements: String,
        text: Array
    },
}
</script>