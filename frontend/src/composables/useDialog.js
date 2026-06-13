import { reactive } from 'vue'

const dialog = reactive({
  visible:      false,
  type:         'alert',   // 'alert' | 'confirm'
  variant:      'error',   // 'error' | 'danger'
  message:      '',
  confirmLabel: 'Supprimer',
  cancelLabel:  'Annuler',
  _resolve:     null,
})

function showAlert(message) {
  return new Promise(resolve => {
    Object.assign(dialog, {
      visible: true, type: 'alert', variant: 'error',
      message, _resolve: resolve,
    })
  })
}

function showConfirm(message, { confirmLabel = 'Supprimer', cancelLabel = 'Annuler' } = {}) {
  return new Promise(resolve => {
    Object.assign(dialog, {
      visible: true, type: 'confirm', variant: 'danger',
      message, confirmLabel, cancelLabel, _resolve: resolve,
    })
  })
}

function _respond(value) {
  dialog.visible = false
  const cb = dialog._resolve
  dialog._resolve = null
  cb?.(value)
}

export function useDialog() {
  return { dialog, showAlert, showConfirm, _respond }
}
