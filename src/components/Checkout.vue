<template>
  <aside>
    <h3>Checkout</h3>
    <form @submit.prevent="onSubmit">
      <div class="controls">
        <label>Name:
          <input v-model.trim="name" placeholder="Jane Doe" />
        </label>
        <label>Phone:
          <input v-model.trim="phone" placeholder="07123456789" />
        </label>
      </div>
      <p class="muted">Name: letters/spaces only · Phone: 10–11 digits</p>

      <div class="footer">
        <button type="button" @click="$emit('cancel')">Back</button>
        <button type="submit" :disabled="!isValid">{{ sending ? 'Placing…' : 'Confirm Order' }}</button>
      </div>

      <p v-if="msg" class="muted">{{ msg }}</p>
    </form>
  </aside>
</template>

<script>
export default {
  name: 'Checkout',
  props: {
    total: { type: Number, required: true },
    items: { type: Array, required: true }
  },
  data() {
    return { name: '', phone: '', sending: false, msg: '' }
  },
  computed: {
    isValid() {
      return /^[A-Za-z ]+$/.test(this.name) && /^\d{10,11}$/.test(this.phone) && this.items.length > 0
    }
  },
  methods: {
    async onSubmit() {
      if (!this.isValid) return
      this.sending = true
      this.msg = ''
      // Front-end only simulation for now:
      await new Promise(r => setTimeout(r, 600))
      this.msg = `Order placed for £${this.total}.`
      this.$emit('success')
      this.sending = false

      // When backend is ready, replace with POST /orders using fetch()
      // and refresh lessons from server afterwards.
    }
  }
}
</script>
