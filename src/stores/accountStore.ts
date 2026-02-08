import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Account, AccountFormData, LabelItem } from '@/types/account'

export const useAccountStore = defineStore('accounts', () => {
  // Состояние
  const accounts = ref<Account[]>(loadFromLocalStorage())
  
  // Геттеры
  const accountsCount = computed(() => accounts.value.length)
  const hasAccounts = computed(() => accounts.value.length > 0)
  
  // Действия
  function addAccount(accountData: AccountFormData) {
    const account: Account = {
      id: generateId(),
      label: parseLabels(accountData.label),
      type: accountData.type,
      login: accountData.login.trim(),
      password: accountData.type === 'Локальная' ? accountData.password : null
    }
    
    accounts.value.push(account)
    saveToLocalStorage()
  }
  
  function updateAccount(id: string, accountData: AccountFormData) {
    const index = accounts.value.findIndex(acc => acc.id === id)
    if (index !== -1) {
      accounts.value[index] = {
        id,
        label: parseLabels(accountData.label),
        type: accountData.type,
        login: accountData.login.trim(),
        password: accountData.type === 'Локальная' ? accountData.password : null
      }
      saveToLocalStorage()
    }
  }
  
  function deleteAccount(id: string) {
    const index = accounts.value.findIndex(acc => acc.id === id)
    if (index !== -1) {
      accounts.value.splice(index, 1)
      saveToLocalStorage()
    }
  }
  
  function parseLabels(labelString: string): LabelItem[] {
    if (!labelString.trim()) return []
    
    return labelString
      .split(';')
      .map(label => label.trim())
      .filter(label => label.length > 0)
      .map(label => ({ text: label }))
  }
  
  function formatLabelsForInput(labels: LabelItem[]): string {
    return labels.map(item => item.text).join('; ')
  }
  
  // Вспомогательные функции
  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }
  
  function saveToLocalStorage() {
    localStorage.setItem('accounts', JSON.stringify(accounts.value))
  }
  
  function loadFromLocalStorage(): Account[] {
    const saved = localStorage.getItem('accounts')
    return saved ? JSON.parse(saved) : []
  }
  
  return {
    accounts,
    accountsCount,
    hasAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    parseLabels,
    formatLabelsForInput
  }
})