export type AccountType = 'LDAP' | 'Локальная'

export interface LabelItem {
  text: string
}

export interface Account {
  id: string
  label: LabelItem[]
  type: AccountType
  login: string
  password: string | null
}

export interface AccountFormData {
  label: string 
  type: AccountType
  login: string
  password: string
}