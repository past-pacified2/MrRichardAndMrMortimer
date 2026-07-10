import { createRouter, createWebHistory } from 'vue-router';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    {
      path: '/character/:id',
      name: 'character',
      component: () => import('@/views/CharacterView.vue'),
    },
    { path: '/character', redirect: '/' },
    {
      path: '/500',
      name: 'fatal-error',
      component: () => import('@/views/FatalErrorView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/FourhOhFourView.vue'),
    },
  ],
});
