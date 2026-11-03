import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

type MenuKey =
  | 'students'
  | 'resources'
  | 'courses'
  | 'performance'
  | 'assessments'
  | 'question'
  | 'department'
  | 'instructor';

@Component({
  selector: 'app-dash-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './dash-layout.html',
  styleUrl: './dash-layout.css'
})
export class DashLayout {

  email = sessionStorage.getItem("email")
  // userFname=sessionStorage.getItem("fname")
  notificationCount = 3;

  sidebarCollapsed = false;
  is_logging_out = false;

  // Only one menu can be open at a time. null means all are closed.
  openMenu: MenuKey | null = null;

  // These keep the names your HTML already uses, for example [class.open]="performanceMenuOpen".
  get studentsMenuOpen() { return this.openMenu === 'students'; }
  get resourcesMenuOpen() { return this.openMenu === 'resources'; }
  get coursesMenuOpen() { return this.openMenu === 'courses'; }
  get performanceMenuOpen() { return this.openMenu === 'performance'; }
  get assessmentsMenuOpen() { return this.openMenu === 'assessments'; }
  get questionMenuOpen() { return this.openMenu === 'question'; }
  get departmentMenuOpen() { return this.openMenu === 'department'; }
  get instructorMenuOpen() { return this.openMenu === 'instructor'; }

  // Opens the chosen menu and closes any other. Clicking the open one closes it.
  private toggle(menu: MenuKey) {
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
    }
    this.openMenu = this.openMenu === menu ? null : menu;
  }

  toggleStudentsMenu() { this.toggle('students'); }
  toggleDepartmentMenu() { this.toggle('department'); }
  toggleQuestionMenu() { this.toggle('question'); }
  togglePerformanceMenu() { this.toggle('performance'); }
  toggleInstructorMenu() { this.toggle('instructor'); }
  toggleCoursesMenu() { this.toggle('courses'); }
  toggleResourcesMenu() { this.toggle('resources'); }
  toggleAssessmentsMenu() { this.toggle('assessments'); }

  onMenuItemClick() {
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    if (this.sidebarCollapsed) {
      this.openMenu = null;   // collapsing the sidebar closes every menu
    }
  }

  constructor(private router: Router) {}

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/']);
  }
}