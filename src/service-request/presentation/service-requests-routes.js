const ServiceRequestsPage = () => import('./views/service-requests.vue');
const ServiceRequestListPage = () => import('./views/service-request-list.vue');
const ServiceRequestFormPage = () => import('./views/service-request-new.vue');

const serviceRequestsRoutes = [
    {
        path: 'services',
        component: ServiceRequestsPage,
        children: [
            {
                // Ruta por defecto: /services
                path: '',
                name: 'service-requests-list',
                component: ServiceRequestListPage,
                meta: { titleKey: 'services.requests.title' }
            },
            {
                // Ruta: /services/new
                path: 'new',
                name: 'service-requests-new',
                component: ServiceRequestFormPage,
                meta: { titleKey: 'services.requests.new' }
            },
        ]
    },
];

export default serviceRequestsRoutes;