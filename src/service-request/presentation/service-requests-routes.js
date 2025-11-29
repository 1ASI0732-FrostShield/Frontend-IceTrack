const ServiceRequestsPage = () => import('./views/service-requests.vue');
const ServiceRequestListPage = () => import('./views/service-request-list.vue');
const ServiceRequestFormPage = () => import('./views/service-request-new.vue');
const ServiceRequestDetailPage = () => import('./views/service-request-detail.vue');

const serviceRequestsRoutes = [
    {
        path: 'services',
        component: ServiceRequestsPage,
        children: [
            {
                path: '',
                name: 'service-requests-list',
                component: ServiceRequestListPage,
                meta: { titleKey: 'services.requests.title', roleRequired: 'owner' }
            },
            {
                path: 'new',
                name: 'service-requests-new',
                component: ServiceRequestFormPage,
                meta: { titleKey: 'services.requests.new', roleRequired: 'owner' }
            },
            {
                path: ':requestId',
                name: 'service-request-detail',
                component: ServiceRequestDetailPage,
                meta: { titleKey: 'services.requests.detail' } // Accessible by both roles
            }
        ]
    },
];

export default serviceRequestsRoutes;