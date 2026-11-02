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
  email=sessionStorage.getItem("email")
  // userFname=sessionStorage.getItem("fname")
  notificationCount = 3;

  studentsMenuOpen = false;
  coursesMenuOpen = false;
  performanceMenuOpen = false;
  assessmentsMenuOpen = false;
   questionMenuOpen = false;
  departmentMenuOpen = false;
   instructorMenuOpen = false;
  sidebarCollapsed = false;
  is_logging_out=false;

  toggleStudentsMenu() {
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
    }
    this.studentsMenuOpen = !this.studentsMenuOpen;
  }

   toggleDepartmentMenu() {
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
    }
    this.departmentMenuOpen = !this.departmentMenuOpen;
  }
   toggleQuestionMenu() {
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
    }
    this.questionMenuOpen = !this.questionMenuOpen;
  }
   togglePerformanceMenu() {
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
    }
    this.performanceMenuOpen = !this.performanceMenuOpen;
  }
   toggleInstructorMenu() {
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
    }
    this.instructorMenuOpen = !this.instructorMenuOpen;
  }

  toggleCoursesMenu() {
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
    }
    this.coursesMenuOpen = !this.coursesMenuOpen;
  }

  toggleAssessmentsMenu() {
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
    }
    this.assessmentsMenuOpen = !this.assessmentsMenuOpen;
  }

  onMenuItemClick() {
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    if (this.sidebarCollapsed) {
      this.studentsMenuOpen = false;
      this.coursesMenuOpen = false;
      this.assessmentsMenuOpen = false;
    }
  }

  logout() {
    console.log('Logging out...');
  }
}