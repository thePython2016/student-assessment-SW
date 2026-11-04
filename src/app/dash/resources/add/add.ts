import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';

interface Option { id: number; name: string; }

@Component({
  imports: [
    FormsModule, MatButtonModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatProgressBarModule, MatSelectModule,
  ],
  selector: 'app-add',
  styleUrl: './add.css',
  templateUrl: './add.html',
})
export class Add implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private api = 'https://student-assessment-4ipf.onrender.com  ';
  private uploadSub?: Subscription;

  // Keep these in step with the backend (ALLOWED_EXTENSIONS and MAX_MB)
  readonly allowed = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'];
  readonly maxMb = 20;
  readonly accept = this.allowed.map((e) => '.' + e).join(',');

  courses: Option[] = [];
  model = { title: '', description: '', courseId: 0 };   // 0 = general (no course)
  file: File | null = null;

  fileError = '';
  uploading = false;
  progress = 0;
  message = '';
  isError = false;

  ngOnInit() {
    this.loadCourses(`${this.api}/course/`);
  }

  // Loads every page; works with a plain array or a paginated {results, next} response
  private loadCourses(url: string, loaded: Option[] = []) {
    this.http.get<any>(url, { headers: this.headers() }).subscribe({
      next: (res) => {
        const rows: any[] = Array.isArray(res) ? res : (res.results ?? []);
        const all = [
          ...loaded,
          ...rows.map((c) => ({ id: c.id, name: `${c.course_code} - ${c.course_name}` })),
        ];
        this.courses = all;
        this.cdr.markForCheck();
        if (res.next) this.loadCourses(res.next, all);   // fetch next page
      },
      error: (err: HttpErrorResponse) => {
        this.isError = true;
        this.message = err.status === 401
          ? 'Your session has expired. Please log in again.'
          : 'Could not load courses.';
        this.cdr.markForCheck();
      },
    });
  }

  // Only the token. Do NOT set Content-Type: the browser adds the multipart boundary itself.
  private headers(): HttpHeaders {
    const raw = localStorage.getItem('loginToken') ?? sessionStorage.getItem('loginToken');
    const token = raw ? raw.replace(/^"|"$/g, '') : '';
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  onFile(event: Event) {
    const f = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.fileError = '';
    this.file = null;
    if (!f) return;

    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!this.allowed.includes(ext)) {
      this.fileError = `File type not allowed. Use: ${this.allowed.join(', ')}.`;
    } else if (f.size > this.maxMb * 1024 * 1024) {
      this.fileError = `File is too large. Maximum is ${this.maxMb} MB.`;
    } else {
      this.file = f;
      if (!this.model.title) this.model.title = f.name.replace(/\.[^.]+$/, '');   // suggest a title
    }
  }

  sizeText(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  upload(form: NgForm) {
    if (form.invalid) { form.control.markAllAsTouched(); }
    if (!this.file) { this.fileError = this.fileError || 'Choose a file to upload.'; }
    if (form.invalid || !this.file) return;

    const body = new FormData();
    body.append('title', this.model.title);
    body.append('description', this.model.description);
    if (this.model.courseId) body.append('course', String(this.model.courseId));
    body.append('file', this.file);

    this.uploading = true;
    this.progress = 0;
    this.message = '';

    this.uploadSub = this.http.post(`${this.api}/resources/`, body, {
      headers: this.headers(),
      reportProgress: true,
      observe: 'events',
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          this.uploading = false;
          this.isError = false;
          this.message = 'Resource uploaded.';
          this.reset(form);
        }
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.uploading = false;
        this.isError = true;
        this.message = this.errorText(err);
        this.cdr.markForCheck();
      },
    });
  }

  // Unsubscribing aborts the HTTP request in the browser
  cancelUpload() {
    this.uploadSub?.unsubscribe();
    this.uploadSub = undefined;
    this.uploading = false;
    this.progress = 0;
    this.isError = true;
    this.message = 'Upload cancelled.';
    this.cdr.markForCheck();
  }

  removeFile() {
    this.file = null;
    this.fileError = '';
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  private reset(form: NgForm) {
    form.resetForm({ title: '', description: '', courseId: 0 });
    this.file = null;
    this.fileError = '';
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  clear(form: NgForm) {
    this.reset(form);
    this.message = '';
  }

  private errorText(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Cannot reach the server.';
    if (err.status === 401) return 'Your session has expired. Please log in again.';
    if (err.status === 403) return 'Only administrators can upload resources.';
    if (err.status === 413) return 'The file is too large for the server.';
    if (err.status === 400 && err.error && typeof err.error === 'object') {
      const first = Object.values(err.error)[0];
      return String(Array.isArray(first) ? first[0] : first);   // first validation message
    }
    return `Could not upload (status ${err.status}).`;
  }
}