import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Shape returned by the API
interface ApiResource {
  id: number;
  title: string;
  description: string;
  course: number | null;
  course_name: string;
  filename: string;
  file_type: string;
  size: number;
  created_at: string;
}

// Shape used by the template
interface Resource {
  id: number;
  title: string;
  subject: string;
  meta: string;
  filename: string;
  icon: string;
  bg: string;
  fg: string;
}

const ICONS: Record<string, { icon: string; bg: string; fg: string }> = {
  pdf:  { icon: 'picture_as_pdf', bg: '#fef3f2', fg: '#b42318' },
  doc:  { icon: 'description',    bg: '#eef4ff', fg: '#3b82f6' },
  docx: { icon: 'description',    bg: '#eef4ff', fg: '#3b82f6' },
  ppt:  { icon: 'slideshow',      bg: '#fff6ed', fg: '#c4320a' },
  pptx: { icon: 'slideshow',      bg: '#fff6ed', fg: '#c4320a' },
  xls:  { icon: 'table_chart',    bg: '#ecfdf3', fg: '#027a48' },
  xlsx: { icon: 'table_chart',    bg: '#ecfdf3', fg: '#027a48' },
  txt:  { icon: 'article',        bg: '#f2f4f7', fg: '#475467' },
};
const DEFAULT_ICON = { icon: 'insert_drive_file', bg: '#f2f4f7', fg: '#475467' };

@Component({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  selector: 'app-resources',
  styleUrl: './resources.css',
  templateUrl: './resources.html',
})
export class Resources implements OnInit {
  trackById(_: number, r: Resource) { return r.id; }
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private snack = inject(MatSnackBar);

  private api = 'https://student-assessment-4ipf.onrender.com  ';

  searchQuery = '';
  categories: string[] = ['All'];
  selectedCategory = 'All';

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

  private toResource(r: ApiResource): Resource {
    const ext = (r.file_type || r.filename.split('.').pop() || '').toLowerCase().replace('.', '');
    const style = ICONS[ext] ?? DEFAULT_ICON;
    const subject = r.course_name || 'General';
    const parts = [subject, (ext || 'file').toUpperCase()];
    if (r.size) parts.push(this.sizeText(r.size));
    return {
      id: r.id,
      title: r.title,
      subject,
      meta: parts.join(' · '),
      filename: r.filename,
      ...style,
    };
  }

  // Loads every page; works with a plain array or a paginated {results, next} response
  private load(url: string, loaded: Resource[] = []) {
    this.http.get<any>(url, { headers: this.headers() }).subscribe({
      next: (res) => {
        const rows: ApiResource[] = Array.isArray(res) ? res : (res.results ?? []);
        this.resources = [...loaded, ...rows.map((r) => this.toResource(r))];
        if (res.next) {
          this.load(res.next, this.resources);
        } else {
          this.loading = false;
          const subjects = [...new Set(this.resources.map((r) => r.subject))].sort();
          this.categories = ['All', ...subjects];
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

  get filteredResources(): Resource[] {
    const q = this.searchQuery.toLowerCase();
    return this.resources.filter((r) => {
      const matchesCategory = this.selectedCategory === 'All' || r.subject === this.selectedCategory;
      const matchesSearch = r.title.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  // Downloads through the API and saves with the real filename
  openResource(r: Resource): void {
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

  private sizeText(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}