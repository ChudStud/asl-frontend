<template>
  <aside>
    <h3>Checkout</h3>

    <form @submit.prevent="onSubmit">
      
      <div class="controls">
        <label>
          Name:
          <input v-model.trim="name" placeholder="Jane Doe" />
        </label>

        <label>
          Phone:
          <input v-model.trim="phone" placeholder="07123456789" />
        </label>
      </div>

      <p class="muted">Name: letters/spaces only · Phone: 10–11 digits</p>

      <div class="footer">
        <button type="button" @click="$emit('cancel')" :disabled="sending">
          Back
        </button>

        <button type="submit" :disabled="!isValid || sending">
          {{ sending ? "Placing…" : "Confirm Order" }}
        </button>
      </div>

      <p v-if="msg" class="muted">{{ msg }}</p>
    </form>
  </aside>
</template>

<script>
export default {
  name: "Checkout",

  props: {
    items: { type: Array, required: true },
    total: { type: Number, required: true }
  },

  data() {
    return {
      name: "",
      phone: "",
      sending: false,
      msg: ""
    };
  },

  computed: {
    // Validation: name letters/spaces + phone 10–11 digits
    isValid() {
      return (
        /^[A-Za-z ]+$/.test(this.name) &&
        /^\d{10,11}$/.test(this.phone) &&
        this.items.length > 0
      );
    }
  },

  methods: {
    async onSubmit() {
      if (!this.isValid) return;

      this.sending = true;
      this.msg = "";

      // Build orderDetails object to send back to App.vue
      const orderDetails = {
        name: this.name,
        phone: this.phone
      };

      // Emit success with order details to App.vue
      // App.vue will handle POST /orders and PUT /lessons
      this.$emit("success", orderDetails);

      this.sending = false;
    }
  }
};
</script>
