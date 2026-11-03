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
// import { Questions } from './dash/questions/questions';
import { Recommendations } from './dash/recommendations/recommendations';
// import { Performanceprediction } from './dash/performanceprediction/performanceprediction';
import { Add as CourseAdd } from './dash/course/add/add';
import { View as CourseView } from './dash/course/view/view';
import { Manage as CourseManage } from './dash/course/manage/manage';
import { Create as AssessmentCreate } from './dash/assessment/create/create';
import { View as AssessmentView } from './dash/assessment/view/view';
import { Manage as AssessmentManage } from './dash/assessment/manage/manage';
import { StudentDashboard } from './studentcomponent/studentdashboard/student-dashboard';
import {Assessment as StudentAssessment} from './studentcomponent/assessment/assessment';
// import {Performance as StudentPerformance} from './studentcomponent/performance/performance';
import {Insights as StudentInsights} from './studentcomponent/insights/insights';
import {Notification as StudentNotification} from './studentcomponent/notification/notification';
import {Layout} from './studentcomponent/layout/layout';
import {Resources} from './studentcomponent/resources/resources';
import {Assignment} from './studentcomponent/assignment/assignment';
import {Insights} from './studentcomponent/insights/insights';
import {View as DepartmentList} from './dash/department/view/view';
import {Allquestions} from './dash/questions/allquestions/allquestions'
import {Add as AddDept} from './dash/department/add/add';
import {Manage as ManageDept} from './dash/department/manage/manage';
import {Add as AddInstructor} from './dash/instructor/add/add';
import {View as InstructorList} from './dash/instructor/view/view';
import {Manage as ManageDepartment} from './dash/department/manage/manage';
import {Manage as ManageInstructor} from './dash/instructor/manage/manage';
// import {Manage as ManageInstructor} from './dash/instructor/manage/manage'
import {Add as QuestionAdd} from './dash/questions/add/add';
import {Import as QuestionImport} from './dash/questions/import/import';
import {AIGeneration as AIGenerate} from './dash/questions/ai-generation/ai-generation';
import {GeneralPrediction} from './dash/performance-analytics/general-prediction/general-prediction'
import {PerformancePrediction} from './dash/performance-analytics/performance-prediction/performance-prediction'
import {StudentPerformance} from './dash/performance-analytics/student-performance/student-performance'
import { AvailableExam } from './studentcomponent/exam/available-exam/available-exam';
import { ExamAttempt } from './studentcomponent/exam/exam-attempt/exam-attempt';
import { ExamResult } from './studentcomponent/exam/exam-result/exam-result';
import { AttemptHistory } from './studentcomponent/exam/attempt-history/attempt-history';
import { Add as AddResources }  from './dash/resources/add/add';
import { AllResources as AllResources }  from './dash/resources/all-resources/all-resources';
import {authGuard} from './components/auth-guard';
// import {StudentExam, canLeaveExam } from './studentcomponent/exam/student-exam/student-exam';
// import { } from './exam/student-exam/student-exam';  // adjust to your path


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

      // Student exaination block 

   { path: 'student/available-exam', component: AvailableExam, canActivate: [authGuard] },
{ path: 'student/exam-attempt/:id', component: ExamAttempt, canActivate: [authGuard] },
{ path: 'student/exam-result/:id', component: ExamResult, canActivate: [authGuard] },
{ path: 'student/attempt-history', component: AttemptHistory, canActivate: [authGuard] },

      // {path:'exam/:id',component:StudentExam,canActivate:[authGuard],canDeactivate:[canLeaveExam]},
      

      // { path: 'exam/:id', component: StudentExam, : [canLeaveExam] },
      
    //   // {path:Dashboard,component:student-dash},


    ]


  },

  {
    path: 'dash',
    component: DashLayout,
    children: [
      { path: 'dashboard', component: Dashboard,canActivate:[authGuard] },

      // Department Component
      { path: 'department/add', component: AddDept,canActivate:[authGuard] },
      { path: 'department/department-list', component: DepartmentList,canActivate:[authGuard] },
      { path: 'department/manage', component: ManageDepartment,canActivate:[authGuard] },

      // Instructor Component
        { path: 'instructor/add', component: AddInstructor,canActivate:[authGuard] },
      { path: 'instructor/instructor-list', component: InstructorList,canActivate:[authGuard] },
      { path: 'instructor/manage', component: ManageInstructor,canActivate:[authGuard] },
      


      // Student Component
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
       { path: 'question/create', component: QuestionAdd,canActivate:[authGuard] },
       { path: 'question/import', component: QuestionImport,canActivate:[authGuard] },
       { path: 'question/ai-generate', component: AIGenerate,canActivate:[authGuard] },
       { path: 'question/allquestions', component: Allquestions,canActivate:[authGuard] },
       { path: 'student/general-analytics', component: GeneralPrediction,canActivate:[authGuard] },
       { path: 'student/performance', component: StudentPerformance,canActivate:[authGuard] },
       { path: 'student/prediction', component: PerformancePrediction,canActivate:[authGuard] },
       { path: 'student/resources', component: AddResources, canActivate: [authGuard] },
{ path: 'student/resources-list', component: AllResources, canActivate: [authGuard] },
      { path: 'assessment/view', component: AssessmentView },
      { path: 'assessment/manage', component: AssessmentManage },
      // { path: 'questions', component: Questions },
      { path: 'recommendations', component: Recommendations },
      // { path: 'performance-prediction', component: Performanceprediction },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    
    ]
  }
];