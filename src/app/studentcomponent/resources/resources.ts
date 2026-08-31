import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';

interface Resource {
  title: string;
  subject: string;
  type: 'pdf' | 'video' | 'link';
  meta: string;
  icon: string;
  bg: string;
  fg: string;
  actionLabel: string;
  actionIcon: string;
}

@Component({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
  ],
  selector: 'app-resources',
  styleUrl: './resources.css',
  templateUrl: './resources.html',
})
export class Resources {
  searchQuery = '';

  categories = ['All', 'Mathematics', 'Science', 'English', 'History'];
  selectedCategory = 'All';

  resources: Resource[] = [
    {
      title: 'Algebra formula sheet',
      subject: 'Mathematics',
      type: 'pdf',
      meta: 'Mathematics · PDF · 1.2 MB',
      icon: 'picture_as_pdf',
      bg: '#fef3f2',
      fg: '#b42318',
      actionLabel: 'Download',
      actionIcon: 'download',
    },
    {
      title: 'Photosynthesis explained',
      subject: 'Science',
      type: 'video',
      meta: 'Science · Video · 14 min',
      icon: 'play_circle',
      bg: '#eef4ff',
      fg: '#3b82f6',
      actionLabel: 'Watch',
      actionIcon: 'play_arrow',
    },
    {
      title: 'Essay writing guide',
      subject: 'English',
      type: 'link',
      meta: 'English · External link',
      icon: 'link',
      bg: '#ecfdf3',
      fg: '#027a48',
      actionLabel: 'Open',
      actionIcon: 'open_in_new',
    },
    {
      title: 'World War I timeline',
      subject: 'History',
      type: 'pdf',
      meta: 'History · PDF · 3.4 MB',
      icon: 'picture_as_pdf',
      bg: '#fef3f2',
      fg: '#b42318',
      actionLabel: 'Download',
      actionIcon: 'download',
    },
  ];

  get filteredResources(): Resource[] {
    return this.resources.filter((r) => {
      const matchesCategory = this.selectedCategory === 'All' || r.subject === this.selectedCategory;
      const matchesSearch = r.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  openResource(resource: Resource): void {
    // Placeholder — trigger download, open link, or play video depending on resource.type
  }
}