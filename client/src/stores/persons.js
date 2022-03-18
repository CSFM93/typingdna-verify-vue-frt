
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const usePersonsStore = defineStore({
  id: 'persons',
  state: () => ({
    persons: useStorage('persons', [])
  }),
  actions: {
    addPerson(person) {
      this.persons.push(person)
    },
    editPerson(person) {
      for (let i = 0; i < this.persons.length; i++) {
        if (this.persons[i].id === person.id) {
          this.persons[i] = Object.assign({}, person)
          break
        }
      }
    },
    removePerson(id) {
      let index = 0
      for (let i = 0; i < this.persons.length; i++) {
        if (this.persons[i].id === id) {
          index = i
          break
        }
      }
      this.persons.splice(index, 1)
    },
  }
})
