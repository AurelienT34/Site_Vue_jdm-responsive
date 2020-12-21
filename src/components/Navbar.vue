<template>
    <div>
  <b-navbar toggleable="lg" type="dark" variant="info" fixed="top">
    <b-navbar-brand href="#" @click="$emit('resetFromButton')">Dictionnaire JeuxDeMots</b-navbar-brand>
  </b-navbar>
</div>
</template>

<script>
export default {
    name: 'NavBar'
}
</script>