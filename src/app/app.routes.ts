import { Routes } from '@angular/router';
import {Login} from './components/login/login';
import { Signup } from './components/signup/signup';
import { ForgotPassword } from './components/forgotpassword/forgotpassword';



export const routes: Routes = [
{ path: '', component: Login },
{ path: 'signup', component: Signup },
{ path: 'forgotpassword', component:ForgotPassword }

];
