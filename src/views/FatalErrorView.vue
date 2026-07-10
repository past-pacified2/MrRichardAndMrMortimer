<script setup lang="ts">
const message = (window.history.state?.message as string | undefined) ?? 'An unknown error occurred';
</script>

<template>
  <h1>Fatal Error</h1>
  <p>{{ message }}</p>

  <div><a href="/">Go back to the home page</a></div>
</template>

<style scoped></style>
