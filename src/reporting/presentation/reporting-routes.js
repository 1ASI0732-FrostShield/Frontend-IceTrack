const reportList = () => import('./views/reports-list.vue');
const reportDetail = () => import('./views/report-detail.vue');
const reportNew = () => import('./views/report-form.vue');

const reportingRoutes = [
    {   path: 'reports',             name: 'reporting-report',      component: reportList, meta: {titleKey: 'reports.list.title'}},
    {   path: 'reports/:id',         name: 'reporting-report-detail',    component: reportDetail, meta: {titleKey: 'reports.list.detail.title'}},
    {   path: 'reports/new',         name: 'reporting-report-new',    component: reportNew, meta: {titleKey: 'reports.form.title'}}
];

export default reportingRoutes;