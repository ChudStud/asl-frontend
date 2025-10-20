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
      </div>
    </header>

    <!-- Lessons -->
    <LessonList :lessons="visibleLessons" @add="addToCart" />

    <hr />

    <!-- Cart -->
    <Cart
      :items="cart"
      :total="cartTotal"
      @inc="incQty"
      @dec="decQty"
      @remove="removeFromCart"
      @empty="emptyCart"
      @checkout="goCheckout = true"
    />

    <!-- Checkout -->
    <template v-if="goCheckout">
      <hr />
      <Checkout
        :items="cart"
        :total="cartTotal"
        @cancel="goCheckout = false"
        @success="afterCheckout"
      />
    </template>
  </div>
</template>

<script>
import LessonList from './components/LessonList.vue'
import Cart from './components/Cart.vue'
import Checkout from './components/Checkout.vue'

export default {
  name: 'App',
  components: { LessonList, Cart, Checkout },
  data() {
    return {
      // UI state
      search: '',
      sortBy: 'subject',
      asc: true,
      goCheckout: false,

      // Data (local now; later replace with fetch from backend)
      lessons: [
        { id:1,  subject:'Math',      location:'Hendon',        price:100, spaces:5, image:'https://cdn-icons-png.flaticon.com/512/167/167755.png' },
        { id:2,  subject:'Science',   location:'Colindale',     price: 80, spaces:5, image:'https://cdn-icons-png.flaticon.com/512/2965/2965871.png' },
        { id:3,  subject:'English',   location:'Mill Hill',      price: 70, spaces:5, image:'https://cdn-icons-png.flaticon.com/512/1006/1006540.png' },
        { id:4,  subject:'History',   location:'Finchley',       price: 90, spaces:5, image:'https://cdn-icons-png.flaticon.com/512/1086/1086933.png' },
        { id:5,  subject:'Art',       location:'Brent Cross',    price: 60, spaces:5, image:'https://cdn-icons-png.flaticon.com/512/3062/3062634.png' },
        { id:6,  subject:'Music',     location:'Barnet',         price: 75, spaces:5, image:'https://www.flaticon.com/free-icons/musical-note' },
        { id:7,  subject:'Dance',     location:'Edgware',        price: 85, spaces:5, image:'https://cdn-icons-png.flaticon.com/512/2463/2463510.png' },
        { id:8,  subject:'Drama',     location:'Golders Green',  price: 95, spaces:5, image:'https://cdn-icons-png.flaticon.com/512/2966/2966327.png' },
        { id:9,  subject:'Computing', location:'Kingsbury',      price:120, spaces:5, image:'https://cdn-icons-png.flaticon.com/512/1055/1055687.png' },
        { id:10, subject:'Sports',    location:'Colindale',      price: 50, spaces:5, image:'https://cdn-icons-png.flaticon.com/512/2966/2966329.png' }
      ],

      cart: []
    }
  },
  computed: {
    visibleLessons() {
      const q = this.search.trim().toLowerCase()
      let arr = this.lessons.filter(l =>
        !q ||
        l.subject.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q)
      )
      arr.sort((a,b) => {
        const A = a[this.sortBy], B = b[this.sortBy]
        const cmp = typeof A === 'string' ? A.localeCompare(B) : A - B
        return this.asc ? cmp : -cmp
      })
      return arr
    },
    cartTotal() {
      return this.cart.reduce((s, r) => s + r.price * r.qty, 0)
    }
  },
  methods: {
    // ----- cart
    addToCart(lessonId) {
      const lesson = this.lessons.find(l => l.id === lessonId)
      if (!lesson || lesson.spaces <= 0) return
      lesson.spaces--
      const row = this.cart.find(r => r.id === lessonId)
      row ? row.qty++ : this.cart.push({ id: lesson.id, subject: lesson.subject, price: lesson.price, qty: 1 })
    },
    removeFromCart(id) {
      const row = this.cart.find(r => r.id === id)
      const lesson = this.lessons.find(l => l.id === id)
      if (row && lesson) lesson.spaces += row.qty
      this.cart = this.cart.filter(r => r.id !== id)
    },
    incQty(id) {
      const row = this.cart.find(r => r.id === id)
      const lesson = this.lessons.find(l => l.id === id)
      if (lesson && lesson.spaces > 0) { row.qty++; lesson.spaces-- }
    },
    decQty(id) {
      const row = this.cart.find(r => r.id === id)
      const lesson = this.lessons.find(l => l.id === id)
      if (row.qty > 1) { row.qty--; if (lesson) lesson.spaces++ }
    },
    emptyCart() {
      for (const row of this.cart) {
        const l = this.lessons.find(x => x.id === row.id)
        if (l) l.spaces += row.qty
      }
      this.cart = []
    },
    afterCheckout() {
      // success from Checkout.vue
      this.emptyCart()
      this.goCheckout = false
      //  when backend exists: refetch lessons from server here
    }
  }
}
</script>
