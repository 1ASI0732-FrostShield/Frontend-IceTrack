// src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import i18n from '@/i18n.js'

// Layout compartido
const Layout = () => import('@/shared/presentation/components/layout.vue')

// Shared
const PageNotFound = () => import('@/shared/presentation/views/page-not-found.vue')

// Dashboard
const DashboardPage = () => import('@/contexts/dashboard/presentation/pages/dashboard.page.vue')

// Assets Management
const SitesListPage = () => import('@/contexts/assets-management/presentation/pages/sites-list.page.vue')
const SiteDetailPage = () => import('@/contexts/assets-management/presentation/pages/site-detail.page.vue')
const EquipmentsListPage = () => import('@/contexts/assets-management/presentation/pages/equipments-list.page.vue')

// Monitoring
const EquipmentDetailPage = () => import('@/contexts/monitoring/presentation/pages/equipment-detail.page.vue')
const AlertsListPage = () => import('@/contexts/monitoring/presentation/pages/alerts-list.page.vue')

// Service
const ServiceRequestsPage = () => import('@/contexts/service/presentation/pages/service-requests.page.vue')
const ServiceRequestNewPage = () => import('@/contexts/service/presentation/pages/service-request-new.page.vue')
const ServiceRequestDetailPage = () => import('@/contexts/service/presentation/pages/service-request-detail.page.vue')

// Reporting
const ReportsListPage = () => import('@/contexts/reporting/presentation/pages/reports-list.page.vue')
const ReportDetailPage = () => import('@/contexts/reporting/presentation/pages/report-detail.page.vue')

// IAM
const AdminUsersPage = () => import('@/contexts/iam/presentation/pages/admin-users.page.vue')
const AdminSettingsPage = () => import('@/contexts/iam/presentation/pages/admin-settings.page.vue')
const LoginPage = () => import('@/contexts/iam/presentation/pages/login.page.vue')
const RegisterPage = () => import('@/contexts/iam/presentation/pages/register.page.vue')

// Communication
const NotificationsPage = () => import('@/contexts/communication/presentation/pages/notifications.page.vue')

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

            // service
            { path: 'services', name: 'services', component: ServiceRequestsPage, meta: { titleKey: 'services.requests.title' } },
            { path: 'services/new', name: 'service-new', component: ServiceRequestNewPage, meta: { titleKey: 'services.requests.new' } },
            { path: 'services/:requestId', name: 'service-detail', component: ServiceRequestDetailPage, meta: { titleKey: 'services.requests.detail' } },

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
