// main.js
// This is the entry point of the Vue application.
// It loads the root component (App.vue) and attaches it to the page.

import { createApp } from 'vue';   // Vue's function to create a new application instance
import App from './App.vue';       // The root component that controls the entire UI
import './style.css';              // Global stylesheet applied to all components

// Create the Vue app using App.vue as the starting component
// and mount it onto the <div id="app"> in index.html.
createApp(App).mount('#app');
