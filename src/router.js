import { createRouter, createWebHistory } from 'vue-router'
import i18n from '@/i18n.js'

import serviceRequestsRoutes from "@/service-request/presentation/service-requests-routes.js";

// Layout compartido
const Layout = () => import('@/shared/presentation/components/layout.vue')

// Shared
const PageNotFound = () => import('@/shared/presentation/views/page-not-found.vue')

// Dashboard
const DashboardPage = () => import('@/dashboard/presentation/views/dashboard.vue')

// Assets Management
const SitesListPage = () => import('@/assets-management/presentation/views/sites-list.vue')
const SiteDetailPage = () => import('@/assets-management/presentation/views/site-detail.vue')
const EquipmentsListPage = () => import('@/assets-management/presentation/views/equipments-list.vue')

// Monitoring
const EquipmentDetailPage = () => import('@/monitoring/presentation/views/equipment-detail.vue')
const AlertsListPage = () => import('@/monitoring/presentation/views/alerts-list.vue')

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

            // service-requests (Integración del Bounded Context)
            ...serviceRequestsRoutes,

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