import { createRouter, createWebHistory } from 'vue-router'
import i18n from '@/i18n.js'
import { useAuthStore } from '@/iam/application/auth.store.js'

import serviceRequestsRoutes from "@/service-request/presentation/service-requests-routes.js";
import reportingRoutes from "@/reporting/presentation/reporting-routes.js";

// Layout compartido
const Layout = () => import('@/shared/presentation/components/layout.vue')

// Shared
const PageNotFound = () => import('@/shared/presentation/views/page-not-found.vue')
const AccessDenied = () => import('@/shared/presentation/views/access-denied.vue') // Nueva vista de error

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
    { path: '/auth/login', name: 'auth-login', component: LoginPage, meta: { titleKey: 'auth.login.title', public: true } }, // marcada como pública
    { path: '/auth/register', name: 'auth-register', component: RegisterPage, meta: { titleKey: 'auth.register.title', public: true } }, // marcada como pública
    { path: '/access-denied', name: 'access-denied', component: AccessDenied, meta: { title: 'Access Denied', public: true } }, // nueva ruta

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

            // monitoring
            { path: 'equipments', name: 'equipments', component: EquipmentsListPage, meta: { titleKey: 'equipments.list.title' } },
            { path: 'equipments/:equipmentId', name: 'equipment-detail', component: EquipmentDetailPage, meta: { titleKey: 'equipments.detail.title' } },
            { path: 'alerts', name: 'alerts', component: AlertsListPage, meta: { titleKey: 'alerts.list.title' } },

            // service-requests (Integración del Bounded Context)
            ...serviceRequestsRoutes,

            // reporting
            ...reportingRoutes,

            // iam
            // NOTA: Añadimos 'roles' requeridos para las rutas administrativas
            { path: 'admin/users', name: 'admin-users', component: AdminUsersPage, meta: { titleKey: 'admin.users.title', roles: ['Administrator'] } },
            { path: 'admin/settings', name: 'admin-settings', component: AdminSettingsPage, meta: { titleKey: 'admin.settings.title', roles: ['Administrator'] } },

            // communication
            { path: 'notifications', name: 'notifications', component: NotificationsPage, meta: { titleKey: 'notifications.title' } },
        ],
    },

    { path: '/:pathMatch(.*)*', name: 'not-found', component: PageNotFound, meta: { title: 'Page Not Found', public: true } },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

router.beforeEach((to, _from, next) => {
    // 1. Manejo del Título (como lo tenías)
    const base = 'IceTrack'
    const t = i18n.global?.t ?? ((k) => k)
    const title =
        to.meta?.titleKey ? t(String(to.meta.titleKey)) :
            to.meta?.title    ? String(to.meta.title)       : ''
    document.title = title ? `${base} — ${title}` : base

    // 2. Manejo de Autenticación y Autorización
    const store = useAuthStore();

    // Si la ruta es pública, permitir acceso sin chequeos
    if (to.meta.public) {
        // Si ya está logeado e intenta ir a login/register, redirigir al dashboard
        if (store.isLoggedIn && (to.name === 'auth-login' || to.name === 'auth-register')) {
            return next({ name: 'dashboard' });
        }
        return next();
    }

    // Rutas protegidas (todas las rutas que no tienen meta.public: true)

    // A. Chequear Autenticación
    if (!store.isLoggedIn) {
        // Redirigir al login si no está autenticado
        return next({ name: 'auth-login' });
    }

    // B. Chequear Autorización (Roles)
    const requiredRoles = to.meta.roles; // Ej: ['Administrator']
    if (requiredRoles) {
        const userRole = store.userRole; // El rol obtenido del JWT/Pinia Store

        if (!requiredRoles.includes(userRole)) {
            // El usuario no tiene el rol requerido -> Acceso Denegado
            return next({ name: 'access-denied' });
        }
    }

    next();
})

export default router