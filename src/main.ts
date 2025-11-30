import { createApp } from "vue";
import "./main.scss";
import App from "./App.vue";
import "virtual:uno.css";
import "@unocss/reset/normalize.css";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// temporary fix for autoimports
import PText from "./components/PerlicaUI/PText.vue";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.component("PText", PText);

app.use(pinia).mount("#app");
