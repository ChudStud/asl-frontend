<template>
  <div class="wrap">
    <!-- Search + Sort -->
    <header>
      <h1>After School Lessons</h1>
      <div class="controls">
        <input v-model="search" placeholder="Search subject or location…" />
        <select v-model="sortBy">
          <option value="subject">Subject</option>
          <option value="location">Location</option>
          <option value="price">Price</option>
          <option value="spaces">Spaces</option>
        </select>
        <button @click="asc = !asc">{{ asc ? 'Ascending' : 'Descending' }}</button>

        <!-- Toggle Cart / Lessons -->
        <button @click="toggleCart">{{ showCart ? "View Lessons" : "View Cart" }}</button>
      </div>
    </header>

    <!-- Lessons Page -->
    <LessonList
      v-if="!showCart && !goCheckout"
      :lessons="visibleLessons"
      @add="addToCart"
    />

    <!-- Cart Page -->
    <Cart
      v-if="showCart && !goCheckout"
      :items="cart"
      :total="cartTotal"
      @inc="incQty"
      @dec="decQty"
      @remove="removeFromCart"
      @empty="emptyCart"
      @checkout="startCheckout"
    />

    <!-- Checkout Page -->
    <Checkout
      v-if="goCheckout"
      :items="cart"
      :total="cartTotal"
      @cancel="cancelCheckout"
      @success="finishCheckout"
    />
  </div>
</template>

<script>
import LessonList from "./components/LessonList.vue";
import Cart from "./components/Cart.vue";
import Checkout from "./components/Checkout.vue";

export default {
  name: "App",
  components: { LessonList, Cart, Checkout },

  data() {
    return {
      backend: "http://localhost:3000", // ← To be replaced with deployed backend (gpt this was the comment you wrote i didn't change it)

      // UI state
      search: "",
      sortBy: "subject",
      asc: true,
      showCart: false,
      goCheckout: false,

      // Data from backend
      lessons: [],
      cart: [],
    };
  },

  async mounted() {
    await this.loadLessons();
  },

  computed: {
    visibleLessons() {
      const q = this.search.trim().toLowerCase();

      let arr = this.lessons.filter(
        (l) =>
          !q ||
          l.subject.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q)
      );

      arr.sort((a, b) => {
        const A = a[this.sortBy];
        const B = b[this.sortBy];
        const cmp = typeof A === "string" ? A.localeCompare(B) : A - B;
        return this.asc ? cmp : -cmp;
      });

      return arr;
    },

    cartTotal() {
      return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    },
  },

  methods: {
    /* ============================
       FETCH LESSONS FROM BACKEND
       ============================ */
    async loadLessons() {
      try {
        const res = await fetch(`${this.backend}/lessons`);
        const data = await res.json();

        // Add lowercase subject for image filenames
        data.forEach((l) => {
          l.subjectLower = l.subject.toLowerCase();
        });

        this.lessons = data;
      } catch (err) {
        console.error("Failed to load lessons:", err);
      }
    },

    /* ============================
           CART FUNCTIONS
       ============================ */
    addToCart(lessonId) {
      const lesson = this.lessons.find((l) => l._id === lessonId);
      if (!lesson || lesson.spaces <= 0) return;

      lesson.spaces--;

      const existing = this.cart.find((c) => c._id === lessonId);
      if (existing) {
        existing.qty++;
      } else {
        this.cart.push({
          _id: lesson._id,
          subject: lesson.subject,
          price: lesson.price,
          qty: 1,
          spaces: lesson.spaces, // Track updated spaces for PUT later
        });
      }
    },

    removeFromCart(id) {
      const item = this.cart.find((c) => c._id === id);
      const lesson = this.lessons.find((l) => l._id === id);

      if (item && lesson) lesson.spaces += item.qty;

      this.cart = this.cart.filter((c) => c._id !== id);
    },

    incQty(id) {
      const item = this.cart.find((c) => c._id === id);
      const lesson = this.lessons.find((l) => l._id === id);

      if (lesson.spaces > 0) {
        item.qty++;
        lesson.spaces--;
      }
    },

    decQty(id) {
      const item = this.cart.find((c) => c._id === id);
      const lesson = this.lessons.find((l) => l._id === id);

      if (item.qty > 1) {
        item.qty--;
        lesson.spaces++;
      }
    },

    emptyCart() {
      for (const item of this.cart) {
        const lesson = this.lessons.find((l) => l._id === item._id);
        if (lesson) lesson.spaces += item.qty;
      }
      this.cart = [];
    },

    toggleCart() {
      if (this.goCheckout) return;
      this.showCart = !this.showCart;
    },

    /* ============================
           CHECKOUT FLOW
       ============================ */
    startCheckout() {
      if (this.cart.length === 0) return;
      this.goCheckout = true;
      this.showCart = false;
    },

    cancelCheckout() {
      this.goCheckout = false;
      this.showCart = true;
    },

    async finishCheckout(orderDetails) {
      try {
        /* ===============================
            1. POST ORDER TO BACKEND
           =============================== */
        await fetch(`${this.backend}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: orderDetails.name,
            phone: orderDetails.phone,
            items: this.cart,
          }),
        });

        /* ===============================
            2. UPDATE SPACES IN BACKEND
           =============================== */
        for (const item of this.cart) {
          const lesson = this.lessons.find((l) => l._id === item._id);

          await fetch(`${this.backend}/lessons/${item._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              spaces: lesson.spaces,
            }),
          });
        }

        /* ===============================
            3. REFRESH FRONTEND DATA
           =============================== */
        await this.loadLessons();
        this.cart = [];
        this.goCheckout = false;
        this.showCart = false;

        alert("Order submitted successfully!");
      } catch (err) {
        console.error("Checkout failed:", err);
        alert("An error occurred. Please try again.");
      }
    },
  },
};
</script>
