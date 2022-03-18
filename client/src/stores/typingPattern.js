
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useTypingPatternStore = defineStore({
  id: 'typingPattern',
  state: () => ({
    isVerified: useStorage('isVerified', false),
  }),
  actions: {
    verify() {
      this.isVerified = this.isVerified ? false : true
    }
  }
})
