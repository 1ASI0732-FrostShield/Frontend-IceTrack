const equipmentDetail = () => import('./views/equipment-detail.vue');

const monitoringRoutes = [
    {   path: 'equipment/new',          name: 'monitoring-equipment-new',   component: equipmentDetail(), meta: { title: 'New Equipment' } },
    {   path: 'equipment/:id/edit',     name: 'monitoring-equipment-edit',  component: equipmentDetail(), meta: { title: 'Edit Equipment' } },
];

export default monitoringRoutes;
