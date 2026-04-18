import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import PropertyPage from '../views/PropertyPage.vue';
import AuthPage from '../views/AuthPage.vue';
import ProfilePage from '../views/ProfilePage.vue';
import { getCurrentUser } from '../data/user';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/property/:id',
    name: 'PropertyDetail',
    component: PropertyPage,
    props: true
  },
  {
    path: '/login',
    name: 'Login',
    component: AuthPage,
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: AuthPage,
    meta: { title: '注册' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth) {
    const user = getCurrentUser()
    if (!user) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  if (to.meta.title) {
    document.title = `${to.meta.title} - 民宿之家`
  } else {
    document.title = '民宿之家 - 发现全球独特的住宿体验'
  }
  
  next()
})

export default router;
