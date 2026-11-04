import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Resource {
  id: number;
  title: string;
  description: string;
  course: number | null;
  course_name: string;
  file_url: string;
  filename: string;
  file_type: string;
  size: number;
  created_at: string;
}

@Component({
  imports: [DatePipe, MatButtonModule, MatIconModule, MatProgressBarModule, MatSnackBarModule],
  selector: 'app-all-resources',
  styleUrl: './all-resources.css',
  templateUrl: './all-resources.html',
})
export class AllResources implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private snack = inject(MatSnackBar);

  private api = 'https://student-assessment-4ipf.onrender.com  ';

  resources: Resource[] = [];
  loading = true;
  error = '';
  downloadingId: number | null = null;

  ngOnInit() {
    this.load(`${this.api}/resources/`);
  }

  private headers(): HttpHeaders {
    const raw = localStorage.getItem('loginToken') ?? sessionStorage.getItem('loginToken');
    const token = raw ? raw.replace(/^"|"$/g, '') : '';
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  // Loads every page; works with a plain array or a paginated {results, next} response
  private load(url: string, loaded: Resource[] = []) {
    this.http.get<any>(url, { headers: this.headers() }).subscribe({
      next: (res) => {
        const rows: Resource[] = Array.isArray(res) ? res : (res.results ?? []);
        this.resources = [...loaded, ...rows];
        if (res.next) {
          this.load(res.next, this.resources);
        } else {
          this.loading = false;
        }
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error =
          err.status === 401 ? 'Your session has expired. Please log in again.'
          : err.status === 0 ? 'Cannot reach the server.'
          : `Could not load resources (status ${err.status}).`;
        this.cdr.markForCheck();
      },
    });
  }

  // Downloads through the API and saves with the real filename. Errors show as a popup.
  download(r: Resource) {
    if (this.downloadingId !== null) return;
    this.downloadingId = r.id;

    this.http.get(`${this.api}/resources/${r.id}/download/`, {
      headers: this.headers(),
      responseType: 'blob',
    }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = r.filename || r.title;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        this.downloadingId = null;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.downloadingId = null;
        const msg =
          err.status === 401 ? 'Your session has expired. Please log in again.'
          : err.status === 404 ? 'File not found on the server.'
          : err.status === 0 ? 'Cannot reach the server.'
          : `Could not download (status ${err.status}).`;
        this.snack.open(msg, 'Close', { duration: 4000 });
        this.cdr.markForCheck();
      },
    });
  }

  typeLabel(r: Resource): string {
    return (r.file_type || r.filename.split('.').pop() || 'FILE').replace('.', '').toUpperCase();
  }

  sizeText(bytes: number): string {
    if (!bytes) return '';
    return bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}