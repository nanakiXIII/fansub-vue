import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useSettings } from '@/composables/useSettings.js'
import { useAuth } from '@/composables/useAuth.js'
import { useChat } from '@/composables/useChat.js'

export const navLinks = [
  { to: '/',           label: 'Accueil'    },
  { to: '/catalogue',  label: 'Catalogue'  },
  { to: '/equipe',     label: 'Équipe'     },
  { to: '/classement', label: 'Classement' },
]

// Comportement partagé par toutes les navbars (FLUX, Glass, Gundam, défaut) :
// état des menus, déconnexion, fermeture au clic extérieur, avatar/initiales.
export function useNavbar(defaultAvatar = 'linear-gradient(135deg,#f97316,#fb923c)') {
  const settings       = useSettings()
  const { logout }     = useAuth()
  const { unread: chatUnread } = useChat()
  const router         = useRouter()
  const mobileMenuOpen = ref(false)
  const profileOpen    = ref(false)
  const profileRef     = ref(null)

  const navInitials = computed(() =>
    (settings.username ?? '').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || '?'
  )
  function isImageUrl(val) {
    return typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:'))
  }

  function onOutsideClick(e) {
    if (profileRef.value && !profileRef.value.contains(e.target)) profileOpen.value = false
  }
  function handleLogout() {
    logout()
    profileOpen.value    = false
    mobileMenuOpen.value = false
    router.push('/')
  }

  onMounted(() => document.addEventListener('click', onOutsideClick))
  onBeforeUnmount(() => document.removeEventListener('click', onOutsideClick))

  return {
    settings, chatUnread, mobileMenuOpen, profileOpen, profileRef,
    defaultAvatar, navInitials, isImageUrl, navLinks, handleLogout,
  }
}
