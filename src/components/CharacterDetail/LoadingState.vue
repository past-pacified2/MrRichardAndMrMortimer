<template>
  <div class="character-detail-loading mx-auto max-w-3xl animate-pulse" aria-busy="true" aria-label="Loading character">
    <div class="grid gap-8 md:grid-cols-[minmax(0,16rem)_1fr] md:items-start">
      <div class="mx-auto aspect-square w-full max-w-64 rounded-2xl bg-white/10" />
      <div class="space-y-4">
        <div class="h-10 w-2/3 rounded bg-white/10" />
        <div class="space-y-3">
          <div v-for="index in 6" :key="index" class="grid grid-cols-[6rem_1fr] gap-2">
            <div class="h-4 rounded bg-white/10" />
            <div class="h-4 rounded bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
