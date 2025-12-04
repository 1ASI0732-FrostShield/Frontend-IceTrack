import { createRouter, createWebHistory } from 'vue-router'
import i18n from '@/i18n.js'
import { useAuthStore } from '@/iam/application/auth.store.js'

import serviceRequestsRoutes from "@/service-request/presentation/service-requests-routes.js";
import reportingRoutes from "@/reporting/presentation/reporting-routes.js";

// Layout compartido
const Layout = () => import('@/shared/presentation/components/layout.vue')

// Shared
const PageNotFound = () => import('@/shared/presentation/views/page-not-found.vue')
// Dashboard
const DashboardPage = () => import('@/dashboard/presentation/views/dashboard.vue')

// Assets Management
const SitesListPage = () => import('@/assets-management/presentation/views/sites-list.vue')
const SiteDetailPage = () => import('@/assets-management/presentation/views/site-detail.vue')

// Monitoring
const EquipmentsListPage = () => import('@/monitoring/presentation/views/equipment-list.vue')
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
    { path: '/auth/login', name: 'auth-login', component: LoginPage, meta: { titleKey: 'auth.login.title', public: true } },
    { path: '/auth/register', name: 'auth-register', component: RegisterPage, meta: { titleKey: 'auth.register.title', public: true } },
    {
        path: '/',
        component: Layout,
        children: [
            { path: '', redirect: '/dashboard' },

            // dashboard
            { path: 'dashboard', name: 'dashboard', component: DashboardPage, meta: { titleKey: 'dashboard.title', roleRequired: 'Owner' } },

            // assets-management
            { path: 'sites', name: 'sites', component: SitesListPage, meta: { titleKey: 'sites.list.title', roleRequired: 'Owner'} },
            { path: 'sites/:siteId', name: 'site-detail', component: SiteDetailPage, meta: { titleKey: 'sites.detail.title', roleRequired: 'Owner' } },

            // monitoring
            { path: 'equipments', name: 'equipments', component: EquipmentsListPage, meta: { titleKey: 'equipments.list.title', roleRequired: 'Owner' } },
            { path: 'equipments/:equipmentId', name: 'equipment-detail', component: EquipmentDetailPage, meta: { titleKey: 'equipments.detail.title', roleRequired: 'Owner' } },
            { path: 'alerts', name: 'alerts', component: AlertsListPage, meta: { titleKey: 'alerts.list.title', roleRequired: 'Owner' } },

            // service-requests (Integración del Bounded Context)
            ...serviceRequestsRoutes,

            // reporting
            ...reportingRoutes,

            // iam
            { path: 'admin/users', name: 'admin-users', component: AdminUsersPage, meta: { titleKey: 'admin.users.title' } },
            { path: 'admin/settings', name: 'admin-settings', component: AdminSettingsPage, meta: { titleKey: 'admin.settings.title' } },

            // communication
            { path: 'notifications', name: 'notifications', component: NotificationsPage, meta: { titleKey: 'notifications.title', roleRequired: 'Owner' } },
        ],
    },

    { path: '/:pathMatch(.*)*', name: 'not-found', component: PageNotFound, meta: { title: 'Page Not Found', public: true } },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const requiresAuth = !to.meta.public;

    // 1. Control de Autenticación
    if (requiresAuth && !authStore.isLoggedIn) {
        return next({ name: 'auth-login' });
    }

    // 2. Control de Redirección (Si está logueado no puede ir a login/register)
    if ((to.name === 'auth-login' || to.name === 'auth-register') && authStore.isLoggedIn) {
        return next({ name: 'dashboard' });
    }

    // 3. Control de Autorización (Frontend)
    const requiredRole = to.meta.requiredRole;
    const currentUserRole = authStore.currentUserRole;

    if (requiredRole && currentUserRole !== requiredRole) {
        console.warn(`Access denied for role: ${currentUserRole}. Required role: ${requiredRole}`);
        return next({ name: 'dashboard' });
    }

    // 4. Lógica de Título
    const base = 'IceTrack';
    const t = i18n.global?.t ?? ((k) => k);
    const title =
        to.meta?.titleKey ? t(String(to.meta.titleKey)) :
            to.meta?.title    ? String(to.meta.title)       : '';
    document.title = title ? `${base} — ${title}` : base;

    next();
});

export default router