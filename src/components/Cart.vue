<template>
  <aside>
    <h3>Cart</h3>

    <template v-if="items.length">
      <div class="card" v-for="row in items" :key="row._id">
        <div class="grow">
          <strong>{{ row.subject }}</strong> · £{{ row.price }}

          <div class="muted">
            Qty:
            <button 
              @click="$emit('dec', row._id)" 
              :disabled="row.qty === 1"
            >
              -
            </button>

            <span class="badge">{{ row.qty }}</span>

            <button 
              @click="$emit('inc', row._id)"
            >
              +
            </button>
          </div>
        </div>

        <button @click="$emit('remove', row._id)">Remove</button>
      </div>

      <div class="footer">
        <span class="total">Total: £{{ total }}</span>
        <button @click="$emit('checkout')">Go to Checkout</button>
        <button @click="$emit('empty')">Empty</button>
      </div>
    </template>

    <p v-else class="muted">Your cart is empty.</p>
  </aside>
</template>

<script>
export default {
  name: "Cart",
  props: {
    items: { type: Array, required: true },
    total: { type: Number, required: true }
  }
};
</script>
