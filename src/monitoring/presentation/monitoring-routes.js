const equipmentList = () => import('./views/equipment-list.vue');
const equipmentDetail = () => import('./views/equipment-detail.vue');

const alertList = () => import('./views/alerts-list.vue');

const monitoringRoutes = [

    { path: 'equipment',          name: 'monitoring-equipment',       component: equipmentList(),   meta: { title: 'Equipment' } },
    { path: 'equipment/new',      name: 'monitoring-equipment-new',   component: equipmentDetail(), meta: { title: 'New Equipment' } },
    { path: 'equipment/:id/edit', name: 'monitoring-equipment-edit',  component: equipmentDetail(), meta: { title: 'Edit Equipment' } },
    { path: 'alerts',             name: 'monitoring-alerts',          component: alertList(),       meta: { title: 'Alerts' } },
];

export default monitoringRoutes;
