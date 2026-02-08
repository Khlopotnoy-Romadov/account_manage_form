<template>
  <tr class="account-row" :class="{ 'has-error': hasErrors }">
    <!-- Метка -->
    <td class="px-2 py-3">
      <v-text-field
        v-model="localFormData.label"
        placeholder="Введите через ;"
        density="compact"
        variant="outlined"
        :maxlength="50"
        hide-details
        class="label-field"
        @blur="handleBlur"
      />
      <div v-if="errors.label" class="error-text text-caption mt-1">
        {{ errors.label }}
      </div>
    </td>
    
    <!-- Тип записи -->
    <td class="px-2 py-3">
      <v-select
        v-model="localFormData.type"
        :items="accountTypes"
        density="compact"
        variant="outlined"
        hide-details
        @update:model-value="handleTypeChange"
        :error="!!errors.type"
      />
      <div v-if="errors.type" class="error-text text-caption mt-1">
        {{ errors.type }}
      </div>
    </td>
    
    <!-- Логин -->
    <td class="px-2 py-3">
      <v-text-field
        v-model="localFormData.login"
        placeholder="Обязательное поле"
        density="compact"
        variant="outlined"
        :maxlength="100"
        hide-details
        :error="!!errors.login"
        required
        @blur="validateAndSave"
      />
      <div v-if="errors.login" class="error-text text-caption mt-1">
        {{ errors.login }}
      </div>
    </td>
    
    <!-- Пароль -->
    <td class="px-2 py-3">
      <v-text-field
        v-if="showPasswordField"
        v-model="localFormData.password"
        placeholder="Обязательное поле"
        type="password"
        density="compact"
        variant="outlined"
        :maxlength="100"
        hide-details
        :error="!!errors.password"
        required
        @blur="validateAndSave"
      />
      <div v-else class="text-caption text-grey">
        Не требуется
      </div>
      <div v-if="errors.password" class="error-text text-caption mt-1">
        {{ errors.password }}
      </div>
    </td>
    
    <td class="">
      <v-btn
        icon
        size="small"
        variant="text"
        color="error"
        @click="$emit('delete')"
        title="Удалить запись"
      >
        Удалить
      </v-btn>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import type { AccountType, AccountFormData } from '@/types/account'

interface Props {
  formData: AccountFormData
  isNew?: boolean
}

interface Emits {
  (e: 'update', data: AccountFormData): void
  (e: 'delete'): void
  (e: 'save', isValid: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  isNew: false
})

const emit = defineEmits<Emits>()

const localFormData = reactive<AccountFormData>({
  label: props.formData.label,
  type: props.formData.type,
  login: props.formData.login,
  password: props.formData.password
})

const errors = reactive({
  label: '',
  type: '',
  login: '',
  password: ''
})

const accountTypes = [
  { title: 'LDAP', value: 'LDAP' },
  { title: 'Локальная', value: 'Локальная' }
]

const showPasswordField = computed(() => localFormData.type === 'Локальная')
const hasErrors = computed(() => 
  Object.values(errors).some(error => error !== '')
)

const validateForm = (): boolean => {
  let isValid = true
  
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')
  
  if (!localFormData.login.trim()) {
    errors.login = 'Обязательное поле'
    isValid = false
  } else if (localFormData.login.length > 100) {
    errors.login = 'Максимум 100 символов'
    isValid = false
  }
  
  if (localFormData.type === 'Локальная') {
    if (!localFormData.password) {
      errors.password = 'Обязательное поле'
      isValid = false
    } else if (localFormData.password.length > 100) {
      errors.password = 'Максимум 100 символов'
      isValid = false
    }
  }
  
  if (localFormData.label.length > 50) {
    errors.label = 'Максимум 50 символов'
    isValid = false
  }
  
  return isValid
}

const validateAndSave = () => {
  const isValid = validateForm()
  emit('update', { ...localFormData })
  emit('save', isValid)
}

const handleBlur = () => {
  validateAndSave()
}

const handleTypeChange = () => {
  if (localFormData.type === 'LDAP') {
    localFormData.password = ''
  }
  validateAndSave()
}

watch(() => props.formData, (newVal) => {
  localFormData.label = newVal.label
  localFormData.type = newVal.type
  localFormData.login = newVal.login
  localFormData.password = newVal.password
}, { deep: true })
</script>

<style scoped>
.account-row {
  border-bottom: 1px solid #e0e0e0;
}

.account-row:last-child {
  border-bottom: none;
}

.account-row.has-error {
  background-color: #fff8f8;
}

.label-field {
  min-width: 200px;
}

.error-text {
  color: #d32f2f;
  font-size: 0.75rem;
}

.text-grey {
  color: rgba(0, 0, 0, 0.6);
}
</style>