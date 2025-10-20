<template>
  <div class="grid">
    <div class="card" v-for="l in lessons" :key="l.id">
      <img :src="l.image" alt="" />
      <div class="grow">
        <div><strong>{{ l.subject }}</strong> · {{ l.location }}</div>
        <div class="muted">£{{ l.price }} · Spaces: <span class="badge">{{ l.spaces }}</span></div>
      </div>
      <button :disabled="l.spaces === 0" @click="$emit('add', l.id)">Add to cart</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LessonList',
  props: {
    lessons: { type: Array, required: true }
  }
}
</script>
