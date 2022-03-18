
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RecognizeView from '../views/RecognizeView.vue'
import VerifyView from '../views/VerifyView.vue'
import { useTypingPatternStore } from "@/stores/typingPattern";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/recognize',
      name: 'Recognize',
      component: RecognizeView
    },
    {
      path: '/verify',
      name: 'Verify',
      component: VerifyView
    }
  ]
})

router.beforeEach(async (to, from) => {
  const typingPattern = useTypingPatternStore()
  console.log('verify state: ', typingPattern.isVerified)

  if (!typingPattern.isVerified && to.name !== 'Verify') {
    return { name: 'Verify' }
  }
})

export default router