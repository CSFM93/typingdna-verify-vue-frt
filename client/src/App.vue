
<template>
  <div>
    <q-layout  container style="height: 100vh" class="">
      <q-header elevated v-if="typingPattern.isVerified">
        <q-bar class="bg-white">
          <q-space />
          <RouterLink
            to="/"
            class="text-primary q-ml-md navItem"
            >Home
          </RouterLink>
          <RouterLink
            to="/recognize"
            class="text-primary q-ml-md navItem"
            >Recognize
          </RouterLink>
          <RouterLink
            to="/verify"
            class="text-red q-ml-md navItem"
            @click="logout"
            >Log out
          </RouterLink>
        </q-bar>
      </q-header>
      <q-page-container>
        <RouterView />
      </q-page-container>
    </q-layout>
  </div>
</template>


<script setup>
import { RouterLink, RouterView } from "vue-router";
import { useTypingPatternStore } from "@/stores/typingPattern";

let typingPattern = useTypingPatternStore();

function logout() {
  console.log("logout");
  typingPattern.verify();
}
</script>


<style scoped>
.navItem {
  text-decoration: none;
  font-size: 11pt;
}
</style>