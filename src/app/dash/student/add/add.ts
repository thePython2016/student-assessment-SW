import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';



interface StudentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dob: Date | null;
  gender: string;
  course: string;
  // token:string | null
}

// base utl


@Component({
  selector: 'app-add',
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './add.html',
  styleUrl: './add.css'

  
})

export class Add {
  // token='';
  token: string | null = null;
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  address = '';
  dob: Date | null = null;
  gender = '';
  course = '';
  baseUrl='http://127.0.0.1:8000/';
  endPoint='student/'
  


  // data=''

  genders = ['Male', 'Female', 'Other'];
  courses = ['AAA', 'BBB', 'CCC', 'DDD', 'EEE', 'FFF', 'GGG'];

  // User data


  onSubmit = async ()=> {

    const data:StudentData={
    'firstName':this.firstName,
    'lastName':this.lastName,
    'email':this.email,
    'phone':this.phone,
    'address':this.address,
    'dob':this.dob,
    'gender':this.gender,
    'course':this.course

  }
  this.token=sessionStorage.getItem("loginToken")
    // console.log({
    //   firstName: this.firstName,
    //   lastName: this.lastName,
    //   email: this.email,
    //   phone: this.phone,
    //   address: this.address,
    //   dob: this.dob,
    //   gender: this.gender,
    //   course: this.course
  
      try{

      const response=await fetch(`${this.baseUrl}/${this.endPoint}${this.token}`,{
        'method':'GET',
        'headers':{
          'Content-Type':'application/json',
          'Authorization':`Bearer ${this.token}`
        },
        // 'body':JSON.stringify(data)
      });
       const result=await response.json()
       if(response.ok){
        console.log(result)
       }
    }
   

    catch(e){
      console.log(e)
    }

  }
}
    
       


