<template>
  <div class="account-form-container">
    <div class="form-header">
      <h2 class="text-h6 font-weight-medium">Учетные записи</h2>
      <v-btn
        color="primary"
        variant="tonal"
        @click="addNewAccount"
        prepend-icon="mdi-plus"
        size="small"
      >
        Добавить учетную запись
      </v-btn>
    </div>
    
    <v-alert
      type="info"
      variant="tonal"
      density="compact"
      class="my-3"
    >
      <div class="text-caption">
        <strong>Подсказка для поля "Метка":</strong> Вводите текстовые метки через точку с запятой (;). 
        Например: "рабочий;основной;админ". Максимум 50 символов.
      </div>
    </v-alert>
    
    <div v-if="hasAccounts" class="existing-accounts my-4">
      <h3 class="text-subtitle-1 font-weight-medium mb-2">Сохраненные учетные записи:</h3>
      <v-table density="compact" class="account-table">
        <thead>
          <tr>
            <th class="text-left" style="width: 25%">Метка</th>
            <th class="text-left" style="width: 20%">Тип записи</th>
            <th class="text-left" style="width: 25%">Логин</th>
            <th class="text-left" style="width: 20%">Пароль</th>
            <th class="text-left" style="width: 10%"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(account, index) in accounts" :key="account.id">
            <td class="px-2 py-2">
              <div v-if="account.label.length > 0" class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="(label, idx) in account.label"
                  :key="idx"
                  size="x-small"
                  variant="outlined"
                  color="primary"
                >
                  {{ label.text }}
                </v-chip>
              </div>
              <span v-else class="text-grey text-caption">—</span>
            </td>
            <td class="px-2 py-2">
              <v-chip
                :color="account.type === 'LDAP' ? 'blue' : 'green'"
                size="small"
                variant="tonal"
              >
                {{ account.type }}
              </v-chip>
            </td>
            <td class="px-2 py-2">{{ account.login }}</td>
            <td class="px-2 py-2">
              <span v-if="account.password">••••••••</span>
              <span v-else class="text-grey">—</span>
            </td>
            <td class="">
              <v-btn
                icon
                size="x-small"
                variant="text"
                color="error"
                @click="editExistingAccount(account.id)"
                title="Редактировать"
              >
                <v-icon size="small">mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                size="x-small"
                variant="text"
                color="error"
                @click="deleteExistingAccount(account.id)"
                title="Удалить"
              >
                Удалить
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
    
    <div v-if="accountForms.length > 0" class="edit-forms my-4">
      <h3 class="text-subtitle-1 font-weight-medium mb-2">
        {{ isEditing ? 'Редактирование' : 'Новые записи' }}:
      </h3>
      <v-table density="compact" class="edit-table">
        <thead>
          <tr>
            <th class="text-left" style="width: 25%">Метка</th>
            <th class="text-left" style="width: 20%">Тип записи</th>
            <th class="text-left" style="width: 25%">Логин</th>
            <th class="text-left" style="width: 20%">Пароль</th>
            <th class="text-left" style="width: 10%"></th>
          </tr>
        </thead>
        <tbody>
          <AccountItem
            v-for="(accountData, index) in accountForms"
            :key="accountData.id || `new-${index}`"
            :form-data="accountData"
            :is-new="!accountData.id"
            @update="handleUpdate(index, $event)"
            @delete="handleDelete(index)"
            @save="handleSave(index, $event)"
          />
        </tbody>
      </v-table>
    </div>
    
    <v-alert
      v-if="!hasAccounts && accountForms.length === 0"
      type="info"
      variant="tonal"
      density="compact"
      class="mt-4"
    >
      Нет учетных записей. Нажмите "Добавить учетную запись" чтобы создать первую.
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAccountStore } from '@/stores/accountStore'
import AccountItem from './AccountItem.vue'
import type { Account, AccountFormData } from '@/types/account'

const accountStore = useAccountStore()

interface AccountFormWithId extends AccountFormData {
  id?: string
}

const accountForms = ref<AccountFormWithId[]>([])

const accounts = computed(() => accountStore.accounts)
const hasAccounts = computed(() => accountStore.hasAccounts)
const isEditing = computed(() => accountForms.value.some(form => form.id))

// Методы
const addNewAccount = () => {
  accountForms.value.push({
    label: '',
    type: 'Локальная',
    login: '',
    password: ''
  })
}

const editExistingAccount = (accountId: string) => {
  const account = accountStore.accounts.find(acc => acc.id === accountId)
  if (!account) return
  
  if (accountForms.value.some(form => form.id === accountId)) {
    return
  }
  
  accountForms.value.push({
    id: account.id,
    label: accountStore.formatLabelsForInput(account.label),
    type: account.type,
    login: account.login,
    password: account.password || ''
  })
}

const deleteExistingAccount = (accountId: string) => {
  if (confirm('Вы уверены, что хотите удалить эту учетную запись?')) {
    accountStore.deleteAccount(accountId)
  }
}

const handleUpdate = (index: number, data: AccountFormData) => {
  accountForms.value[index] = {
    ...accountForms.value[index],
    ...data
  }
}

const handleDelete = (index: number) => {
  const accountForm = accountForms.value[index]
  
  if (accountForm.id) {
    accountStore.deleteAccount(accountForm.id)
  }
  
  accountForms.value.splice(index, 1)
}

const handleSave = (index: number, isValid: boolean) => {
  if (!isValid) return
  
  const accountForm = accountForms.value[index]
  
  if (accountForm.id) {
    accountStore.updateAccount(accountForm.id, accountForm)
    setTimeout(() => {
      accountForms.value.splice(index, 1)
    }, 300)
  } else {
    accountStore.addAccount(accountForm)
    accountForms.value[index] = {
      label: '',
      type: 'Локальная',
      login: '',
      password: ''
    }
  }
}

onMounted(() => {
  console.log('Загружено записей:', accountStore.accounts.length)
})
</script>

<style scoped>
.account-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.account-table,
.edit-table {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.account-table thead,
.edit-table thead {
  background-color: #f5f5f5;
}

.account-table th,
.edit-table th {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  padding: 8px 16px;
}

.account-table td,
.edit-table td {
  padding: 8px 16px;
}

.text-grey {
  color: rgba(0, 0, 0, 0.6);
}

.gap-1 {
  gap: 4px;
}

.existing-accounts,
.edit-forms {
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>