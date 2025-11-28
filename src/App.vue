<template>
  <div class="wrap">

    <!-- HEADER SECTION:
         - Contains the title, search bar, sorting options,
           and button to switch between lessons and the cart. -->
    <header>
      <h1>After School Lessons</h1>
      <div class="controls">

        <!-- Search input: filters lessons by subject/location -->
        <input v-model="search" placeholder="Search subject or location…" />

        <!-- Sorting dropdown: updates the sort field -->
        <select v-model="sortBy">
          <option value="subject">Subject</option>
          <option value="location">Location</option>
          <option value="price">Price</option>
          <option value="spaces">Spaces</option>
        </select>

        <!-- Sort order toggle -->
        <button @click="asc = !asc">{{ asc ? 'Ascending' : 'Descending' }}</button>

        <!-- Switch between Lessons and Cart page -->
        <button @click="toggleCart">{{ showCart ? "View Lessons" : "View Cart" }}</button>
      </div>
    </header>

    <!-- LESSONS PAGE:
         Shown when cart page and checkout page are both not active -->
    <LessonList
      v-if="!showCart && !goCheckout"
      :lessons="visibleLessons"
      @add="addToCart"
    />

    <!-- CART PAGE:
         Shown when user switches to the cart (but not to checkout yet) -->
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

    <!-- CHECKOUT PAGE:
         Shown once user proceeds from the cart -->
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
      backend: "https://asl-backend-tuqj.onrender.com", // Backend URL based from deployment on Render.com

      // UI state variables
      search: "",          // Search bar input
      sortBy: "subject",   // Current sort method
      asc: true,           // Sort order (ascending/descending)
      showCart: false,     // Controls whether Cart or Lessons page is shown
      goCheckout: false,   // Controls visibility of Checkout page

      // Data loaded from backend / user selections
      lessons: [],         // All lessons from backend
      cart: [],            // User's selected items
    };
  },

  // Fetch lessons as soon as the app loads
  async mounted() {
    await this.loadLessons();
  },

  computed: {
    // Returns lessons after applying search + sorting
    visibleLessons() {
      const q = this.search.trim().toLowerCase();

      // Filter lessons
      let arr = this.lessons.filter(
        (l) =>
          !q ||
          l.subject.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q)
      );

      // Sort lessons
      arr.sort((a, b) => {
        const A = a[this.sortBy];
        const B = b[this.sortBy];
        const cmp = typeof A === "string" ? A.localeCompare(B) : A - B;
        return this.asc ? cmp : -cmp;
      });

      return arr;
    },

    // Calculates total price of items in cart
    cartTotal() {
      return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    },
  },

  methods: {
    /* Load all lessons from backend */
    async loadLessons() {
      try {
        const res = await fetch(`${this.backend}/lessons`);
        const data = await res.json();

        // Add lowercase subject so LessonList knows which image to load
        data.forEach((l) => {
          l.subjectLower = l.subject.toLowerCase();
        });

        this.lessons = data;
      } catch (err) {
        console.error("Failed to load lessons:", err);
      }
    },

    /* Add a lesson to the cart and update spaces in UI */
    addToCart(lessonId) {
      const lesson = this.lessons.find((l) => l._id === lessonId);
      if (!lesson || lesson.spaces <= 0) return;

      lesson.spaces--; // Reduce available spaces

      const existing = this.cart.find((c) => c._id === lessonId);
      if (existing) {
        existing.qty++;
      } else {
        this.cart.push({
          _id: lesson._id,
          subject: lesson.subject,
          price: lesson.price,
          qty: 1,
          spaces: lesson.spaces,
        });
      }
    },

    /* Remove entire item from cart and restore its spaces */
    removeFromCart(id) {
      const item = this.cart.find((c) => c._id === id);
      const lesson = this.lessons.find((l) => l._id === id);

      if (item && lesson) lesson.spaces += item.qty;

      this.cart = this.cart.filter((c) => c._id !== id);
    },

    /* Increase quantity of a cart item (if spaces remain) */
    incQty(id) {
      const item = this.cart.find((c) => c._id === id);
      const lesson = this.lessons.find((l) => l._id === id);

      if (lesson.spaces > 0) {
        item.qty++;
        lesson.spaces--;
      }
    },

    /* Decrease quantity (not below 1) */
    decQty(id) {
      const item = this.cart.find((c) => c._id === id);
      const lesson = this.lessons.find((l) => l._id === id);

      if (item.qty > 1) {
        item.qty--;
        lesson.spaces++;
      }
    },

    /* Completely empty the cart */
    emptyCart() {
      for (const item of this.cart) {
        const lesson = this.lessons.find((l) => l._id === item._id);
        if (lesson) lesson.spaces += item.qty;
      }
      this.cart = [];
    },

    /* Switch between lessons and cart */
    toggleCart() {
      if (this.goCheckout) return;
      this.showCart = !this.showCart;
    },

    /* Start checkout process */
    startCheckout() {
      if (this.cart.length === 0) return;
      this.goCheckout = true;
      this.showCart = false;
    },

    /* Cancel checkout and return to cart */
    cancelCheckout() {
      this.goCheckout = false;
      this.showCart = true;
    },

    /* Finalize order: send to backend, update spaces, reset UI */
    async finishCheckout(orderDetails) {
      try {
        // Step 1: send order to backend
        await fetch(`${this.backend}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: orderDetails.name,
            phone: orderDetails.phone,
            items: this.cart,
          }),
        });

        // Step 2: update lesson spaces in backend
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

        // Step 3: refresh lessons and reset cart/UI state
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
