<template>
  <div class="grid">
    <!-- 
      This loops through all lessons passed from App.vue.
      Each lesson is displayed as one "card" with its:
        - image
        - subject and location
        - price and available spaces
        - button to add to cart
    -->
    <div class="card" v-for="l in lessons" :key="l._id">
      
      <!-- 
        Lesson image:
        - Loaded from the backend's /images folder.
        - subjectLower is created in App.vue so filenames match the subject,
          e.g. "math" → math.png.
      -->
      <img :src="`${backend}/images/${l.subjectLower}.png`" alt="Lesson icon" />

      <div class="grow">
        <!-- Lesson name + location -->
        <div>
          <strong>{{ l.subject }}</strong> · {{ l.location }}
        </div>

        <!-- Price + spaces available -->
        <div class="muted">
          £{{ l.price }} · Spaces:
          <span class="badge">{{ l.spaces }}</span>
        </div>
      </div>

      <!-- 
        "Add to cart" button:
        - Disabled if no spaces left.
        - Emits an "add" event to App.vue with the lesson ID.
      -->
      <button :disabled="l.spaces === 0" @click="$emit('add', l._id)">
        Add to cart
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "LessonList",

  /* 
    props:
    - "lessons" is passed down from App.vue.
    - This component doesn't modify lesson data; it only displays it.
  */
  props: {
    lessons: { type: Array, required: true },
  },

  computed: {
    /* 
      backend():
      - Accesses the backend URL stored in the App.vue root instance.
      - Allows this component to build correct image URLs.
    */
    backend() {
      return this.$root.backend;
    }
  }
};
</script>

<style>
/* Keeps consistent button width for cleaner card layout */
.card button {
  min-width: 100px;
}
</style>
