import { createRouter, createWebHistory } from 'vue-router'
import i18n from '@/i18n.js'
import { useAuthStore } from '@/iam/application/auth.store.js'

import reportingRoutes from "@/reporting/presentation/reporting-routes.js";

// Layout
const Layout = () => import('@/shared/presentation/components/layout.vue')

// General Views
const PageNotFound = () => import('@/shared/presentation/views/page-not-found.vue')
const DashboardPage = () => import('@/dashboard/presentation/views/dashboard.vue')

// IAM
const LoginPage = () => import('@/iam/presentation/views/login.vue')
const RegisterPage = () => import('@/iam/presentation/views/register.vue')

// Asset Management
const SitesListPage = () => import('@/assets-management/presentation/views/sites-list.vue')
const SiteDetailPage = () => import('@/assets-management/presentation/views/site-detail.vue')

// Monitoring
const EquipmentListPage = () => import('@/monitoring/presentation/views/equipment-list.vue')
const EquipmentDetailPage = () => import('@/monitoring/presentation/views/equipment-detail.vue')

// Service Request
const ServiceRequestListPage = () => import('@/service-request/presentation/views/service-request-list.vue');
const ServiceRequestDetailPage = () => import('@/service-request/presentation/views/service-request-detail.vue');
const ServiceRequestFormPage = () => import('@/service-request/presentation/views/service-request-new.vue');
const InterventionDetailPage = () => import('@/service-request/presentation/views/intervention-detail.vue');
const ProviderDashboard = () => import('@/service-request/presentation/views/provider-dashboard.vue');
const ProviderServiceList = () => import('@/service-request/presentation/views/provider-service-list.vue');
const ProviderServicesHub = () => import('@/service-request/presentation/views/provider-services-hub.vue');
const InProgressServices = () => import('@/service-request/presentation/views/in-progress-services.vue');
const ProviderCompletedServices = () => import('@/service-request/presentation/views/provider-completed-services.vue');
const ProviderRejectedCanceledServices = () => import('@/service-request/presentation/views/provider-rejected-canceled-services.vue');

// Technician Management
const TechnicianManagement = () => import('@/technician-management/presentation/views/technician-management.vue');


const routes = [
    { path: '/auth/login', name: 'auth-login', component: LoginPage, meta: { titleKey: 'auth.login.title', public: true } },
    { path: '/auth/register', name: 'auth-register', component: RegisterPage, meta: { titleKey: 'auth.register.title', public: true } },
    {
        path: '/',
        component: Layout,
        children: [
            { path: '', redirect: '/dashboard' },

            // --- Owner Routes ---
            { path: 'dashboard', name: 'dashboard', component: DashboardPage, meta: { titleKey: 'dashboard.title', roleRequired: 'Owner' } },
            { path: 'sites', name: 'sites', component: SitesListPage, meta: { titleKey: 'sites.list.title', roleRequired: 'Owner' } },
            { path: 'sites/:siteId', name: 'site-detail', component: SiteDetailPage, meta: { titleKey: 'sites.detail.title', roleRequired: 'Owner' } },
            { path: 'equipments', name: 'equipments', component: EquipmentListPage, meta: { titleKey: 'equipments.list.title', roleRequired: 'Owner' } },
            { path: 'equipments/:equipmentId', name: 'equipment-detail', component: EquipmentDetailPage, meta: { titleKey: 'equipments.detail.title', roleRequired: 'Owner' } },
            { path: 'services', name: 'service-requests-list', component: ServiceRequestListPage, meta: { titleKey: 'services.requests.title', roleRequired: 'Owner' }},
            { path: 'services/new', name: 'service-requests-new', component: ServiceRequestFormPage, meta: { titleKey: 'services.requests.new', roleRequired: 'Owner' }},
            { path: 'services/:requestId', name: 'service-request-detail', component: ServiceRequestDetailPage, meta: { titleKey: 'services.requests.detail' }},
            { path: 'services/:requestId/interventions/:interventionId', name: 'intervention-detail', component: InterventionDetailPage, meta: { titleKey: 'services.interventions.detail' }},
            ...reportingRoutes,

            // --- Provider Routes ---
            { path: 'provider/dashboard', name: 'provider-dashboard', component: ProviderDashboard, meta: { titleKey: 'provider.dashboard.title', roleRequired: 'Provider' } },
            { path: 'provider/services', name: 'provider-services-list', component: ProviderServiceList, meta: { titleKey: 'provider.services.title', roleRequired: 'Provider' } },
            { path: 'provider/services-hub', name: 'provider-services-hub', component: ProviderServicesHub, meta: { titleKey: 'provider.services.title', roleRequired: 'Provider' } },
            { path: 'provider/services/pending', name: 'provider-pending-services', component: ProviderDashboard, meta: { titleKey: 'provider.dashboard.title', roleRequired: 'Provider' } },
            { path: 'provider/services/in-progress', name: 'provider-in-progress', component: InProgressServices, meta: { titleKey: 'provider.in_progress.title', roleRequired: 'Provider' } },
            { path: 'provider/services/completed', name: 'provider-completed-services', component: ProviderCompletedServices, meta: { titleKey: 'provider.completed.title', roleRequired: 'Provider' } },
            { path: 'provider/services/rejected-canceled', name: 'provider-rejected-canceled-services', component: ProviderRejectedCanceledServices, meta: { titleKey: 'provider.rejected_canceled.title', roleRequired: 'Provider' } },
            { path: 'provider/technicians', name: 'provider-technicians', component: TechnicianManagement, meta: { titleKey: 'provider.technicians.title', roleRequired: 'Provider' } },
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

    if (requiresAuth && !authStore.isLoggedIn) {
        return next({ name: 'auth-login' });
    }

    if ((to.name === 'auth-login' || to.name === 'auth-register') && authStore.isLoggedIn) {
        if (authStore.currentUserRole === 'Provider') return next({ name: 'provider-dashboard' });
        if (authStore.currentUserRole === 'Owner') return next({ name: 'dashboard' });
    }

    const requiredRole = to.meta.roleRequired;
    if (requiredRole && authStore.currentUserRole !== requiredRole) {
        console.warn(`Access denied for role: ${authStore.currentUserRole}. Required role: ${requiredRole}`);
        if (authStore.currentUserRole === 'Provider') return next({ name: 'provider-dashboard' });
        return next({ name: 'dashboard' });
    }

    const base = 'IceTrack';
    const t = i18n.global?.t ?? ((k) => k);
    const title = to.meta?.titleKey ? t(String(to.meta.titleKey)) : (to.meta?.title || '');
    document.title = title ? `${base} — ${title}` : base;

    next();
});

export default router