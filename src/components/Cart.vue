<template>
  <aside>
    <h3>Cart</h3>

    <template v-if="items.length">
      <div class="card" v-for="row in items" :key="row._id">
        <div class="grow">
          <strong>{{ row.subject }}</strong> · £{{ row.price }}

          <div class="muted" style="margin-top: 8px;">
            Qty:

            <!-- Modern Slim Quantity Control -->
            <div class="qty-box">
              <button
                class="qty-btn"
                @click="$emit('dec', row._id)"
                :disabled="row.qty === 1"
              >
                -
              </button>

              <span class="qty-num">{{ row.qty }}</span>

              <button
                class="qty-btn"
                @click="$emit('inc', row._id)"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Remove Button -->
        <button class="remove-btn" @click="$emit('remove', row._id)">
          Remove
        </button>
      </div>

      <!-- Footer Section -->
      <div class="footer">
        <span class="total">Total: £{{ total }}</span>

        <div class="footer-buttons">
          <button @click="$emit('checkout')">Go to Checkout</button>
          <button @click="$emit('empty')">Empty</button>
        </div>
      </div>
    </template>

    <!-- Empty Cart -->
    <p v-else class="muted">Your cart is empty.</p>
  </aside>
</template>

<script>
export default {
  name: "Cart",
  props: {
    items: { type: Array, required: true },
    total: { type: Number, required: true },
  },
};
</script>

<style scoped>
/* Minor scoped tweaks for Cart only */

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
