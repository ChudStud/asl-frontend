<template>
  <aside>
    <h3>Cart</h3>

    <!-- 
      If there are items in the cart, display them.
      Otherwise show the "Your cart is empty" message.
    -->
    <template v-if="items.length">

      <!-- 
        Loop through each item in the cart.
        Each "row" represents one lesson the user has added.
        Uses MongoDB _id as the unique key.
      -->
      <div class="card" v-for="row in items" :key="row._id">

        <div class="grow">
          <!-- Lesson subject + price -->
          <strong>{{ row.subject }}</strong> · £{{ row.price }}

          <div class="muted" style="margin-top: 8px;">
            Qty:

            <!-- 
              Quantity selector:
              - Displays current quantity
              - Allows increasing/decreasing qty
              - Emits events to App.vue (which updates cart & lesson spaces)
            -->
            <div class="qty-box">

              <!-- Decrease quantity (disabled when qty = 1) -->
              <button
                class="qty-btn"
                @click="$emit('dec', row._id)"
                :disabled="row.qty === 1"
              >
                -
              </button>

              <!-- Current quantity -->
              <span class="qty-num">{{ row.qty }}</span>

              <!-- Increase quantity -->
              <button
                class="qty-btn"
                @click="$emit('inc', row._id)"
              >
                +
              </button>

            </div>
          </div>
        </div>

        <!-- 
          Remove button:
          Emits "remove" event with row._id.
          App.vue handles restoring spaces and deleting the item.
        -->
        <button class="remove-btn" @click="$emit('remove', row._id)">
          Remove
        </button>
      </div>

      <!-- 
        Cart footer:
        - Shows total price
        - Checkout button
        - Empty cart button
      -->
      <div class="footer">
        <span class="total">Total: £{{ total }}</span>

        <div class="footer-buttons">
          <button @click="$emit('checkout')">Go to Checkout</button>
          <button @click="$emit('empty')">Empty</button>
        </div>
      </div>
    </template>

    <!-- Shown if no items are in the cart -->
    <p v-else class="muted">Your cart is empty.</p>
  </aside>
</template>

<script>
export default {
  name: "Cart",

  /*
    props:
    - items: array of all cart items (controlled by App.vue)
    - total: computed total price passed from App.vue
    This component does NOT modify data itself.
    It simply emits actions like "inc", "dec", "remove", "checkout".
  */
  props: {
    items: { type: Array, required: true },
    total: { type: Number, required: true },
  },
};
</script>

<style scoped>
/* Styles below only affect this component */

.remove-btn {
  background: #9fb2ff;
  padding: 10px 20px;
  border-radius: 12px;
  color: white;
  border: none;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s ease;
}

.remove-btn:hover {
  background: #869aff;
}

.footer {
  margin-top: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-buttons {
  display: flex;
  gap: 12px;
}

.total {
  font-weight: 600;
  font-size: 1.2rem;
}
</style>
