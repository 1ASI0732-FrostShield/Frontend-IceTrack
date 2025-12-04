const siteDetail = () => import('./views/site-detail.vue');
const siteList = () => import('./views/site-list.vue');

const assetsManagementRoutes = [
    {   path: 'sites',             name: 'assets-management-sites',      component: siteList(), meta: {title: 'Sites'}},
    {   path: 'sites/new',         name: 'assets-management-sites-new',    component: siteDetail(), meta: {title: 'New Site'}},
    {   path: 'sites/:id/edit',    name: 'assets-management-sites-edit',   component: siteDetail(), meta: {title: 'Edit Site'}},
];

export default assetsManagementRoutes;