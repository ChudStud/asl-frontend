<template>
  <aside>
    <h3>Checkout</h3>

    <!-- Form handles user details needed to place the order -->
    <form @submit.prevent="onSubmit">
      
      <div class="controls">

        <!-- Name input:
             - v-model.trim removes accidental spaces
             - Only letters and spaces allowed (validated in computed property)
        -->
        <label>
          Name:
          <input v-model.trim="name" placeholder="Jane Doe" />
        </label>

        <!-- Phone input:
             - v-model.trim removes leading/trailing spaces
             - Only 10–11 digits allowed (validated below)
        -->
        <label>
          Phone:
          <input v-model.trim="phone" placeholder="07123456789" />
        </label>

      </div>

      <!-- Small helper text explaining input rules -->
      <p class="muted">Name: letters/spaces only · Phone: 10–11 digits</p>

      <div class="footer">
        <!-- Back button:
             - Emits "cancel" to App.vue
             - Disabled while sending to avoid double clicks
        -->
        <button type="button" @click="$emit('cancel')" :disabled="sending">
          Back
        </button>

        <!-- Submit button:
             - Disabled unless inputs are valid
             - Shows loading text when submitting
        -->
        <button type="submit" :disabled="!isValid || sending">
          {{ sending ? "Placing…" : "Confirm Order" }}
        </button>
      </div>

      <!-- Small message area (used if needed) -->
      <p v-if="msg" class="muted">{{ msg }}</p>
    </form>
  </aside>
</template>

<script>
export default {
  name: "Checkout",

  /* 
    props:
    - items → the cart contents passed from App.vue
    - total → final total price passed from App.vue
    These are not modified here; Checkout only reads them.
  */
  props: {
    items: { type: Array, required: true },
    total: { type: Number, required: true }
  },

  data() {
    return {
      name: "",       // User's full name
      phone: "",      // User's phone number
      sending: false, // True while order is being submitted
      msg: ""         // Optional feedback message area
    };
  },

  computed: {
    /*
      isValid:
      - Ensures the form cannot be submitted unless:
          1) Name contains only letters and spaces
          2) Phone is 10–11 digits long
          3) The cart has at least one item
    */
    isValid() {
      return (
        /^[A-Za-z ]+$/.test(this.name) &&
        /^\d{10,11}$/.test(this.phone) &&
        this.items.length > 0
      );
    }
  },

  methods: {
    /*
      onSubmit():
      - Called when the user clicks "Confirm Order"
      - Performs validation
      - Emits the user's details back to App.vue
      - App.vue handles all backend communication (POST/PUT)
    */
    async onSubmit() {
      if (!this.isValid) return;

      this.sending = true;
      this.msg = "";

      // Build orderDetails to pass back to App.vue
      const orderDetails = {
        name: this.name,
        phone: this.phone
      };

      // Emit "success" event so App.vue can complete checkout
      this.$emit("success", orderDetails);

      this.sending = false;
    }
  }
};
</script>

