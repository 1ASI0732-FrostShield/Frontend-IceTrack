const equipmentList = () => import('./views/equipment-list.vue');
const equipmentDetail = () => import('./views/equipment-detail.vue');


const equipmentRoutes = [
    {   path: 'equipment',             name: 'monitoring-equipment',        component: equipmentList(),   meta: {title: 'Equipment'}},
    {   path: 'equipment/new',         name: 'monitoring-equipment-new',    component: equipmentDetail(), meta: {title: 'New Equipment'}},
    {   path: 'equipment/:id/edit',    name: 'monitoring-equipment-edit',   component: equipmentDetail(), meta: {title: 'Edit Equipment'}},
];

export default equipmentRoutes;