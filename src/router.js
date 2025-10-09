import { createRouter, createWebHistory } from 'vue-router'
import i18n from '@/i18n.js'

// Layout compartido
const Layout = () => import('@/shared/presentation/components/layout.vue')

// Shared
const PageNotFound = () => import('@/shared/presentation/views/page-not-found.vue')

// Dashboard
const DashboardPage = () => import('@/dashboard/presentation/views/dashboard.vue')

// assets-management
{ path: 'sites', name: 'sites', component: SitesListPage, meta: { titleKey: 'sites.list.title' } },
{ path: 'sites/:siteId', name: 'site-detail', component: SiteDetailPage, meta: { titleKey: 'sites.detail.title' } },

// monitoring
{ path: 'equipments', name: 'equipments', component: EquipmentsListPage, meta: { titleKey: 'equipments.list.title' } },
{ path: 'equipments/:equipmentId', name: 'equipment-detail', component: EquipmentDetailPage, meta: { titleKey: 'equipments.detail.title' } },
{ path: 'alerts', name: 'alerts', component: AlertsListPage, meta: { titleKey: 'alerts.list.title' } },

// Service
const ServiceRequestsPage = () => import('@/service-request/presentation/views/service-requests.vue')
const ServiceRequestNewPage = () => import('@/service-request/presentation/views/service-request-new.vue')
const ServiceRequestDetailPage = () => import('@/service-request/presentation/views/service-request-detail.vue')

// Reporting
const ReportsListPage = () => import('@/reporting/presentation/views/reports-list.vue')
const ReportDetailPage = () => import('@/reporting/presentation/views/report-detail.vue')

// IAM
const AdminUsersPage = () => import('@/iam/presentation/views/admin-users.vue')
const AdminSettingsPage = () => import('@/iam/presentation/views/admin-settings.vue')
const LoginPage = () => import('@/iam/presentation/views/login.vue')
const RegisterPage = () => import('@/iam/presentation/views/register.vue')

// Communication
const NotificationsPage = () => import('@/communication/presentation/views/notifications.vue')

const routes = [
    { path: '/auth/login', name: 'auth-login', component: LoginPage, meta: { titleKey: 'auth.login.title' } },
    { path: '/auth/register', name: 'auth-register', component: RegisterPage, meta: { titleKey: 'auth.register.title' } },

    {
        path: '/',
        component: Layout,
        children: [
            { path: '', redirect: '/dashboard' },

            // dashboard
            { path: 'dashboard', name: 'dashboard', component: DashboardPage, meta: { titleKey: 'dashboard.title' } },

            // assets-management
            { path: 'sites', name: 'sites', component: SitesListPage, meta: { titleKey: 'sites.list.title' } },
            { path: 'sites/:siteId', name: 'site-detail', component: SiteDetailPage, meta: { titleKey: 'sites.detail.title' } },
            { path: 'equipments', name: 'equipments', component: EquipmentsListPage, meta: { titleKey: 'equipments.list.title' } },

            // monitoring
            { path: 'equipments/:equipmentId', name: 'equipment-detail', component: EquipmentDetailPage, meta: { titleKey: 'equipments.detail.title' } },
            { path: 'alerts', name: 'alerts', component: AlertsListPage, meta: { titleKey: 'alerts.list.title' } },

            // service-request
            { path: 'services', name: 'services', component: ServiceRequestsPage, meta: { titleKey: 'services.requests.title' } },
            { path: 'services/new', name: 'service-request-new', component: ServiceRequestNewPage, meta: { titleKey: 'services.requests.new' } },
            { path: 'services/:requestId', name: 'service-request-detail', component: ServiceRequestDetailPage, meta: { titleKey: 'services.requests.detail' } },

            // reporting
            { path: 'reports', name: 'reports', component: ReportsListPage, meta: { titleKey: 'reports.list.title' } },
            { path: 'reports/:reportId', name: 'report-detail', component: ReportDetailPage, meta: { titleKey: 'reports.detail.title' } },

            // iam
            { path: 'admin/users', name: 'admin-users', component: AdminUsersPage, meta: { titleKey: 'admin.users.title' } },
            { path: 'admin/settings', name: 'admin-settings', component: AdminSettingsPage, meta: { titleKey: 'admin.settings.title' } },

            // communication
            { path: 'notifications', name: 'notifications', component: NotificationsPage, meta: { titleKey: 'notifications.title' } },
        ],
    },

    { path: '/:pathMatch(.*)*', name: 'not-found', component: PageNotFound, meta: { title: 'Page Not Found' } },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

router.beforeEach((to, _from, next) => {
    const base = 'IceTrack'
    const t = i18n.global?.t ?? ((k) => k)
    const title =
        to.meta?.titleKey ? t(String(to.meta.titleKey)) :
            to.meta?.title    ? String(to.meta.title)       : ''
    document.title = title ? `${base} — ${title}` : base
    next()
})

export default router
