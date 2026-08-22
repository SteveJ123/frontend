import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Service } from '../../service/service';
import { map, Observable } from 'rxjs';
import { apiUrl } from '../../core/constants/api';

interface LeaderboardUser {
  rank: number;
  name: string;
  points: string;
  avatarBg?: string;
}

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  instructor: string;
  image: string;
}

interface TagItem {
  id: string;
  name: string;
  selected: boolean;
}

interface Membership {
  id: number;
  name: string;
  selected: boolean;
}

interface SelectedMedia {
  file: File;
  type: 'image' | 'video' | 'audio';
  previewUrl: string;
}

@Component({
  selector: 'app-create-admin-post',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-admin-post.html',
  styleUrl: './create-admin-post.css',
})
export class CreateAdminPost {
  // isSidebarOpen = signal(false);

  upcomingSessions: Session[] = [
    {
      id: '1',
      title: 'Morning Sveyog Yoga',
      date: '24 Aug',
      time: '02:30 AM - 03:50 AM',
      instructor: 'Ageless Lifestyle Hub',
      image:
        'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: '2',
      title: 'The Glow-Up Hour',
      date: '24 Aug',
      time: '07:00 PM - 08:00 PM',
      instructor: 'Ageless Lifestyle Hub',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    },
  ];

  leaderboard: LeaderboardUser[] = [
    { rank: 1, name: 'Uma Maheswari Amarnath', points: '51.98K ALHP' },
    { rank: 2, name: 'Sushma William', points: '48.57K ALHP' },
    { rank: 3, name: 'malathi', points: '44.27K ALHP' },
    { rank: 4, name: 'Legala Manjula', points: '39.79K ALHP' },
    { rank: 5, name: 'Baljit', points: '38.10K ALHP' },
  ];

  // toggleSidebar() {
  //   this.isSidebarOpen.update((v) => !v);
  // }
  isOpen = signal(false);
  loading: boolean = false;
  posts: any = [];
  errorMessage!: string;

  openModal() {
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden'; // Prevents background body scrolling
  }

  closeModal() {
    this.isOpen.set(false);
    document.body.style.overflow = 'auto'; // Re-enables background body scrolling
  }

  isTagModalOpen = signal(false);

  // Default available tags list
  allTags: TagItem[] = [
    { id: '1', name: 'Welcome Message', selected: false },
    { id: '2', name: 'Upcoming Events', selected: false },
    { id: '3', name: 'Announcements', selected: false },
    { id: '4', name: 'Events', selected: false },
    { id: '5', name: 'Polls', selected: false },
    { id: '6', name: 'Success Stories', selected: false },
    { id: '7', name: 'Elite Club Exclusive', selected: false },
    { id: '8', name: 'journey', selected: false },
    { id: '9', name: 'Challenge', selected: false },
    { id: '10', name: 'Sveyog Yoga-Body Flow', selected: false },
    { id: '11', name: 'Festival Celebrations', selected: false },
    { id: '12', name: 'Diamond Success', selected: false },
  ];

  // Temporary tags array for staging selections inside modal
  tempTags: TagItem[] = [];

  // Saved confirmed tags shown on the main page
  savedTags = signal<TagItem[]>([]);
  postContent: string = '';
  posts$!: Observable<any[]>;
  constructor(
    private http: HttpClient,
    private service: Service,
  ) {}

  ngOnInit(): void {
    // this.getPosts();
    this.getPostsObservable();
  }

  getPostsObservable() {
    this.posts$ = this.service.getPosts().pipe(map((response) => response.data));
  }

  // getPosts(): void {
  //   this.loading = true;

  //   this.service.getPosts().subscribe({
  //     next: (response) => {
  //       console.log('API Response:', response);

  //       this.posts = response.data;

  //       this.loading = false;
  //     },

  //     error: (error) => {
  //       console.error('Error fetching posts:', error);

  //       this.errorMessage = 'Unable to load posts';
  //       this.loading = false;
  //     },
  //   });
  // }

  openTagModal() {
    // Clone state so changes aren't finalized until "Save changes" is clicked
    this.tempTags = this.allTags.map((tag) => ({ ...tag }));
    this.isTagModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeTagModal() {
    this.isTagModalOpen.set(false);
    document.body.style.overflow = 'auto';
  }

  toggleTag(tag: TagItem) {
    tag.selected = !tag.selected;
  }

  isAllSelected(): boolean {
    return this.tempTags.length > 0 && this.tempTags.every((t) => t.selected);
  }

  toggleSelectAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.tempTags.forEach((t) => (t.selected = isChecked));
  }

  saveChanges() {
    // Commit temporary state back to primary tags array
    this.allTags = this.tempTags.map((tag) => ({ ...tag }));
    this.savedTags.set(this.allTags.filter((t) => t.selected));
    this.closeTagModal();
  }

  removeTag(tagToRemove: TagItem) {
    const found = this.allTags.find((t) => t.id === tagToRemove.id);
    if (found) found.selected = false;
    this.savedTags.set(this.allTags.filter((t) => t.selected));
  }

  // Modal visibility signal
  isMembershipModalOpen = signal(false);

  searchQuery = '';

  // Temporary state inside the modal
  tempMemberships: Membership[] = [
    { id: 1, name: 'Face YogaSutra Practitioner Certificate Program', selected: false },
    { id: 2, name: 'Elite Club Membership', selected: false },
  ];

  // Saved selection state
  savedMemberships = signal<Membership[]>([]);

  openMembershipModal(): void {
    // Sync current saved selection state into temp modal state
    const savedIds = new Set(this.savedMemberships().map((m) => m.id));
    this.tempMemberships = this.tempMemberships.map((m) => ({
      ...m,
      selected: savedIds.has(m.id),
    }));
    this.isMembershipModalOpen.set(true);
  }

  closeMembershipModal(): void {
    this.isMembershipModalOpen.set(false);
  }

  toggleMembership(item: Membership): void {
    item.selected = !item.selected;
  }

  isAllMembershipsSelected(): boolean {
    return this.tempMemberships.length > 0 && this.tempMemberships.every((m) => m.selected);
  }

  toggleSelectAllMemberships(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.tempMemberships.forEach((m) => (m.selected = isChecked));
  }

  filteredMemberships(): Membership[] {
    if (!this.searchQuery.trim()) {
      return this.tempMemberships;
    }
    return this.tempMemberships.filter((m) =>
      m.name.toLowerCase().includes(this.searchQuery.toLowerCase()),
    );
  }

  saveMembershipChanges(): void {
    this.savedMemberships.set(this.tempMemberships.filter((m) => m.selected));
    this.closeMembershipModal();
  }

  selectedFiles: SelectedMedia[] = [];
  isUploading = false;

  onFileSelected(event: Event, type: 'image' | 'video' | 'audio'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const previewUrl = URL.createObjectURL(file);

      this.selectedFiles.push({ file, type, previewUrl });

      // Reset input value to allow selecting the same file again if needed
      input.value = '';
    }
  }

  removeFile(index: number): void {
    URL.revokeObjectURL(this.selectedFiles[index].previewUrl);
    this.selectedFiles.splice(index, 1);
  }

  togglePoll(): void {
    console.log('Poll feature clicked');
  }

  publishPost(): void {
    if (this.selectedFiles.length === 0) {
      alert('Please select at least one media file to publish.');
      return;
    }

    // this.isUploading = true;
    // const formData = new FormData();
    // console.log('this.selectedFiles', this.selectedFiles);
    // // Append files to FormData payload
    // this.selectedFiles.forEach((item, index) => {
    //   formData.append(`media_${index}`, item.file, item.file.name);
    //   formData.append(`type_${index}`, item.type);
    // });

    if (!this.postContent.trim() && this.selectedFiles.length === 0) {
      alert('Please enter some text or attach media before publishing.');
      return;
    }

    this.isUploading = true;

    // Build multipart FormData payload
    const formData = new FormData();

    // 1. Text Content
    formData.append('content', this.postContent);

    // 2. Selected Tags (sending array of IDs/Names as JSON)
    const tagIds = this.savedTags().map((tag) => tag.id);
    formData.append('tagIds', JSON.stringify(tagIds));

    // 3. Selected Memberships
    const membershipIds = this.savedMemberships().map((m) => m.id);
    formData.append('membershipIds', JSON.stringify(membershipIds));

    // 4. File attachments
    this.selectedFiles.forEach((item, index) => {
      formData.append(`files`, item.file, item.file.name);
      formData.append(`fileTypes`, item.type);
    });
    // console.log('formdata', formData);
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Send payload to backend API endpoint
    this.service.posts(formData).subscribe({
      next: (response: any) => {
        console.log('Published successfully:', response);
        this.isUploading = false;
        this.selectedFiles = []; // Clear attachments after success
        this.resetForm();
        this.getPostsObservable();
        this.closeModal();
      },
      error: (error: any) => {
        console.error('Upload failed:', error);
        this.isUploading = false;
      },
    });
  }

  // Reset form after successful submission
  resetForm(): void {
    this.postContent = '';
    this.savedTags.set([]);
    this.savedMemberships.set([]);
    this.selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    this.selectedFiles = [];
  }

  getMediaUrl(path: string): string {
    if (!path) {
      return '';
    }

    // Convert Windows \ to /
    const normalizedPath = path.replace(/\\/g, '/');

    return `${apiUrl}${normalizedPath}`;
    // return `https://backend-2rgv.onrender.com/${normalizedPath}`;
  }

  getPostAge(createdAt: string): string {
    if (!createdAt) {
      return '';
    }

    const created = new Date(createdAt);

    const now = new Date();

    const difference = now.getTime() - created.getTime();

    const minutes = Math.floor(difference / (1000 * 60));

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
      return `${days}d`;
    }

    const months = Math.floor(days / 30);

    return `${months}mo`;
  }

  getTagName(tagId: string): string {
    const tag = this.allTags.find((tag) => tag.id === tagId);

    return tag ? tag.name : tagId;
  }
}
