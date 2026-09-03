import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { ForgotPassword } from './components/forgotpassword/forgotpassword';
import { DashLayout } from './dash/dash-layout/dash-layout';
import { Dashboard } from './dash/dashboard/dashboard';
import { Course } from './dash/course/course';
import { Assessment } from './dash/assessment/assessment';
import { User } from './dash/user/user';
import { Analytics } from './dash/analytics/analytics';
import { Add } from './dash/student/add/add';
import { View } from './dash/student/view/view';
import { Manage } from './dash/student/manage/manage';
import { Questions } from './dash/questions/questions';
import { Recommendations } from './dash/recommendations/recommendations';
import { Performanceprediction } from './dash/performanceprediction/performanceprediction';
import { Add as CourseAdd } from './dash/course/add/add';
import { View as CourseView } from './dash/course/view/view';
import { Manage as CourseManage } from './dash/course/manage/manage';
import { Create as AssessmentCreate } from './dash/assessment/create/create';
import { View as AssessmentView } from './dash/assessment/view/view';
import { Manage as AssessmentManage } from './dash/assessment/manage/manage';
import { StudentDashboard } from './studentcomponent/studentdashboard/student-dashboard';
import {Assessment as StudentAssessment} from './studentcomponent/assessment/assessment';
import {Performance as StudentPerformance} from './studentcomponent/performance/performance';
import {Insights as StudentInsights} from './studentcomponent/insights/insights';
import {Notification as StudentNotification} from './studentcomponent/notification/notification';
import {Layout} from './studentcomponent/layout/layout';
import {Resources} from './studentcomponent/resources/resources';
import {Assignment} from './studentcomponent/assignment/assignment';
import {Insights} from './studentcomponent/insights/insights';
import {authGuard} from './components/auth-guard';


export const routes: Routes = [
  { path: '', component: Login },
  { path: 'signup', component: Signup },
  { path: 'forgotpassword', component: ForgotPassword },
  {path:'student-course',component:Layout,
    children:[
      {path:'dashboard',component:StudentDashboard,canActivate:[authGuard]},
      {path:'assessment',component:StudentAssessment,canActivate:[authGuard]},
      {path:'resources',component:Resources,canActivate:[authGuard]},
      {path:'assignment',component:Assignment,canActivate:[authGuard]},
      {path:'performance',component:StudentPerformance,canActivate:[authGuard]},
      {path:'insights',component:Insights,canActivate:[authGuard]},
      {path:'notification',component:StudentNotification,canActivate:[authGuard]},
    //   // {path:Dashboard,component:student-dash},


    ]


  },

  {
    path: 'dash',
    component: DashLayout,
    children: [
      { path: 'dashboard', component: Dashboard,canActivate:[authGuard] },
      { path: 'student/add', component: Add,canActivate:[authGuard] },
      { path: 'student/view', component: View, canActivate:[authGuard]},
      { path: 'student/manage', component: Manage,canActivate:[authGuard] },
      { path: 'course', component: Course,canActivate:[authGuard] },
      { path: 'assessment', component: Assessment,canActivate:[authGuard] },
      { path: 'user', component: User,canActivate:[authGuard] },
      { path: 'analytics', component: Analytics,canActivate:[authGuard] },
      { path: 'course/add', component: CourseAdd,canActivate:[authGuard] },
      { path: 'course/view', component: CourseView,canActivate:[authGuard] },
      { path: 'course/manage', component: CourseManage,canActivate:[authGuard] },
      { path: 'assessment/create', component: AssessmentCreate,canActivate:[authGuard] },
      { path: 'assessment/view', component: AssessmentView },
      { path: 'assessment/manage', component: AssessmentManage },
      { path: 'questions', component: Questions },
      { path: 'recommendations', component: Recommendations },
      { path: 'performance-prediction', component: Performanceprediction },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];