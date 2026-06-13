import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import { config } from './config.js'

import HomePage        from './views/HomePage.vue'
import CataloguePage   from './views/CataloguePage.vue'
import DetailPage      from './views/DetailPage.vue'
import NewsDetailPage  from './views/NewsDetailPage.vue'
import TeamPage        from './views/TeamPage.vue'
import ProfilePage     from './views/ProfilePage.vue'
import PlayerPage      from './views/PlayerPage.vue'
import ReleasesPage    from './views/ReleasesPage.vue'
import ActualitesPage  from './views/ActualitesPage.vue'
import LoginPage          from './views/LoginPage.vue'
import RegisterPage       from './views/RegisterPage.vue'
import AuthCallbackPage   from './views/AuthCallbackPage.vue'
import RecruitPage     from './views/RecruitPage.vue'
import ChatPage        from './views/ChatPage.vue'
import AdminLayout     from './views/admin/AdminLayout.vue'
import AdminDashboard  from './views/admin/AdminDashboard.vue'
import AdminSeries     from './views/admin/AdminSeries.vue'
import AdminTeam       from './views/admin/AdminTeam.vue'
import AdminRecruit    from './views/admin/AdminRecruit.vue'
import AdminNews       from './views/admin/AdminNews.vue'
import AdminNewsForm   from './views/admin/AdminNewsForm.vue'
import AdminComments   from './views/admin/AdminComments.vue'
import AdminUsers      from './views/admin/AdminUsers.vue'
import AdminStats      from './views/admin/AdminStats.vue'
import AdminRoles      from './views/admin/AdminRoles.vue'
import AdminInProgress    from './views/admin/AdminInProgress.vue'
import AdminAchievements from './views/admin/AdminAchievements.vue'
import AdminAnalytics    from './views/admin/AdminAnalytics.vue'
import AdminBeta         from './views/admin/AdminBeta.vue'
import AdminAlerts       from './views/admin/AdminAlerts.vue'
import AdminAudit        from './views/admin/AdminAudit.vue'
import { useSettings } from './composables/useSettings.js'
import { http } from './services/http.js'
import { socket } from './services/socket.js'

// ── Présence temps réel ────────────────────────────────────────────
function buildLocationData(route) {
  const { path, params } = route
  if (path === '/')               return { type: 'home',     path, label: 'Accueil' }
  if (path === '/catalogue')      return { type: 'catalogue', path, label: 'Catalogue' }
  if (path === '/sorties')        return { type: 'releases',  path, label: 'Dernières sorties' }
  if (path === '/actualites')    return { type: 'news',      path, label: 'Actualités' }
  if (path === '/equipe')         return { type: 'team',     path, label: 'Équipe' }
  if (path === '/profil')         return { type: 'profile',  path, label: 'Profil' }
  if (path.startsWith('/admin'))  return { type: 'admin',    path, label: 'Administration' }
  if (path.startsWith('/watch/')) return { type: 'episode',  path, label: `${params.id} — Ép. ${params.ep}`, serieId: params.id, epNum: params.ep }
  if (path.startsWith('/serie/')) return { type: 'serie',    path, label: params.id, serieId: params.id }
  if (path.startsWith('/actualite/')) return { type: 'news', path, label: 'Actualité' }
  return { type: 'other', path, label: 'Navigation' }
}

// ── Tracking analytics ─────────────────────────────────────────────
function getOrCreateSessionId() {
  let id = sessionStorage.getItem('fansub_sid')
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem('fansub_sid', id) }
  return id
}
function classifyPath(path) {
  if (path === '/')                    return { pageType: 'home' }
  if (path.startsWith('/serie/'))      return { pageType: 'serie',     pageId: path.split('/')[2] }
  if (path.startsWith('/actualite/'))  return { pageType: 'news',      pageId: path.split('/')[2] }
  if (path.startsWith('/watch/'))      return { pageType: 'player',    pageId: path.split('/')[2] }
  if (path === '/catalogue')           return { pageType: 'catalogue' }
  if (path === '/equipe')              return { pageType: 'equipe' }
  if (path === '/recrutement')         return { pageType: 'recrutement' }
  return { pageType: 'other' }
}
let lastTracked = ''
function trackPageView(path) {
  if (path.startsWith('/admin')) return   // ne pas tracker les pages admin
  if (path === lastTracked) return        // éviter les doublons sur même URL
  lastTracked = path
  const { pageType, pageId } = classifyPath(path)
  http.post('/analytics/pageview', {
    path,
    pageType,
    pageId:    pageId ?? null,
    referrer:  document.referrer || null,
    sessionId: getOrCreateSessionId(),
  }).catch(() => {})
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',                   component: HomePage,      meta: { title: null              } },
    { path: '/catalogue',          component: CataloguePage, meta: { title: 'Catalogue'       } },
    { path: '/sorties',            component: ReleasesPage,  meta: { title: 'Dernières sorties' } },
    { path: '/serie/:id',          component: DetailPage,    meta: { title: null              } },
    { path: '/actualite/:id',      component: NewsDetailPage, meta: { title: null             } },
    { path: '/actualites',         component: ActualitesPage, meta: { title: 'Actualités'      } },
    { path: '/chat',               component: ChatPage,      meta: { title: 'Chat'            } },
    { path: '/equipe',             component: TeamPage,      meta: { title: 'Équipe'          } },
    { path: '/recrutement',        component: RecruitPage,   meta: { title: 'Recrutement'     } },
    { path: '/profil',             component: ProfilePage,   meta: { title: 'Profil'          } },
    { path: '/connexion',          component: LoginPage,        meta: { title: 'Connexion'   } },
    { path: '/inscription',        component: RegisterPage,     meta: { title: 'Inscription' } },
    { path: '/auth/callback',      component: AuthCallbackPage, meta: { title: null          } },
    { path: '/watch/:id/:season/:ep', component: PlayerPage, meta: { title: null             } },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAdmin: true, title: 'Administration' },
      children: [
        { path: '',              component: AdminDashboard, meta: { title: 'Dashboard — Admin'       } },
        { path: 'series',        component: AdminSeries,    meta: { title: 'Séries — Admin'          } },
        { path: 'equipe',        component: AdminTeam,      meta: { title: 'Équipe — Admin'          } },
        { path: 'recrutement',   component: AdminRecruit,   meta: { title: 'Recrutement — Admin'     } },
        { path: 'news',              component: AdminNews,     meta: { title: 'Actualités — Admin'         } },
        { path: 'news/nouveau',      component: AdminNewsForm, meta: { title: 'Nouvel article — Admin'      } },
        { path: 'news/modifier/:id', component: AdminNewsForm, meta: { title: 'Modifier article — Admin'    } },
        { path: 'commentaires',  component: AdminComments,  meta: { title: 'Commentaires — Admin'    } },
        { path: 'utilisateurs',  component: AdminUsers,     meta: { title: 'Utilisateurs — Admin'    } },
        { path: 'statistiques',  component: AdminStats,     meta: { title: 'Statistiques — Admin'    } },
        { path: 'grades',        component: AdminRoles,     meta: { title: 'Grades — Admin'          } },
        { path: 'avancement',    component: AdminInProgress,   meta: { title: 'Avancement — Admin'   } },
        { path: 'succes',        component: AdminAchievements, meta: { title: 'Succès — Admin'        } },
        { path: 'analytics',     component: AdminAnalytics,    meta: { title: 'Analytics — Admin'     } },
        { path: 'beta',          component: AdminBeta,         meta: { title: 'Bêta — Admin'          } },
        { path: 'alertes',       component: AdminAlerts,       meta: { title: 'Alertes — Admin'       } },
        { path: 'audit',         component: AdminAudit,        meta: { title: "Logs d'audit — Admin"  } },
      ],
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin) {
    const settings = useSettings()
    if (!settings.isAdmin && !settings.permissions?.length) return '/'
  }
})

router.afterEach((to) => {
  const pageTitle = to.meta?.title
  document.title = pageTitle ? `${pageTitle} — ${config.siteName}` : config.siteName
  trackPageView(to.path)
  socket.emit('user:location', buildLocationData(to))
})

createApp(App).use(router).mount('#app')
