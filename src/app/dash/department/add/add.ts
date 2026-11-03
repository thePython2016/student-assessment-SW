import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import {ChangeDetectorRef, inject } from '@angular/core';
import { NgForm } from '@angular/forms';


interface DepartmentData {
  departmentCode_: string;
  departmentName_: string;
  description: string;
}

@Component({
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  selector: 'app-add',
  styleUrl: './add.css',
  templateUrl: './add.html',
})

export class Add {

  private cdr = inject(ChangeDetectorRef);
  // Base and Enddpoint

base="http://127.0.0.1:8000";
endPoint='department';



  // Form data----------------------->

  message = '';
  departmentCode= '';
  departmentName='';
  description= '';
  error='';
  success=''
  deptName='';
  submittedName=''
  

  async onSubmit(form: NgForm) {

    // Data to be sent to database-------------->

  const deptData:DepartmentData={
  departmentCode_:this.departmentCode,
  departmentName_:this.departmentName,
  description:this.description



  }
try{
const response=await fetch(`${this.base}/${this.endPoint}/`,{
  method:'POST',
  headers:{
    "Content-Type":"application/json",
    // "Authorization":`Bearer ${token}`
  },
  body:JSON.stringify(deptData)


})

// this.deptName=result.departmentName_

if(response.ok){
  const result=await response.json();
  this.success="Department added successfully";

  // this.departmentCode= '';
  this.submittedName=result.departmentName_;
  // this.description= '';
   form.resetForm();


   setTimeout(() => {
    this.success = '';
    this.cdr.detectChanges();
  }, 3000);   // 3000 = 3 seconds
  
}
else{
  this.error="Data Could not be added"
  setTimeout(() => {
    this.error = '';
    this.cdr.detectChanges();
  }, 3000);   // 3000 = 3 seconds
  
  
}
  this.cdr.detectChanges();
}
catch(e){
  this.error="Server error occured"
  this.cdr.detectChanges();   // add

  setTimeout(() => {
    this.error = '';
    this.cdr.detectChanges();
  }, 3000);   // 3000 = 3 seconds
  
}
}
}