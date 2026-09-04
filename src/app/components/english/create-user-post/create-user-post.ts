import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Service } from '../../../service/service';
import { map, Observable, tap, shareReplay } from 'rxjs';
import { apiUrl } from '../../../core/constants/api';
import { AuthService } from '../../../service/AuthService';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../service/toast.service';
import { Router } from '@angular/router';

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

interface Comment {
  id: number;
  username: string;
  avatar: string;
  content: string;
  createdAt: string;
  isCreator?: boolean;
}

// interface Post {
//   id: number;
//   content: string;
//   createdAt: string;
//   mediaFiles?: any[];
//   showComments?: boolean; // Toggles comment section
//   comments?: Comment[];
//   newCommentText?: string;
// }

// interface Post {
//   _id: string;
//   content: string;
//   comments?: any[];
//   showComments?: boolean;
//   newCommentText?: string;
//   replyingToId?: string | null; // Tracks comment ID being replied to
// }

interface Post {
  _id: string;
  content: string;
  comments: Comment[];
  showComments: boolean;
  newCommentText: string;
  replyingToId: string | null;
  loadingComments?: boolean; // Add this line
}

@Component({
  selector: 'app-create-user-post',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-user-post.html',
  styleUrl: './create-user-post.css',
  host: {
    class: 'w-full block',
  },
})
export class CreateUserPost {
  // isSidebarOpen = signal(false);
  private toastService = inject(ToastService);
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

  title: string = '';

  targetPostId: string | null = null;

  editingPostId: string | null = null;
  editContent: string = '';

  // Track existing files marked for removal during edit
  removedMediaIds: string[] = [];

  // Track new media files added during edit
  newEditFiles: { file: File; previewUrl: string; type: string }[] = [];

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
  cachedPosts: any[] = [];
  // Track viewed posts during the session to avoid duplicate API calls
  productToDeleteId: string = '';
  showDeleteModal: boolean = false;
  showPostContentError: boolean = false;
  constructor(
    // private http: HttpClient,
    // private service: Service,
    // private cd: ChangeDetectorRef,
  ) {}
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private service = inject(Service);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  username: any = this.authService.getUserName();
  commentUsername = this.authService.getUserName();
  userId = this.authService.getUserId();

  viewedPostIds: any = new Set<string>();
  get currentRouteLanguage(): string {
    const urlSegments = this.router.url.split('/').filter(Boolean); // e.g. ['te', 'user-feed']
    const firstSegment = urlSegments[0]; // 'te' or 'en'

    return firstSegment === 'te' ? 'te' : 'en';
  }

  userLanguage: any = '';
  userType: any = '';
  ngOnInit(): void {
    // this.getPosts();
    // 1. Capture target postId from query parameters
    this.userLanguage = this.authService.getUserLanguage();
    this.userType = this.authService.getUserRole();

    this.getPostsObservable();

    this.route.queryParams.subscribe((params) => {
      this.targetPostId = params['postId'] || null;
      if (this.targetPostId) {
        console.log('this.cachedPosts', this.cachedPosts);
        if (this.cachedPosts.length > 0) {
          // User is ALREADY on the feed page and data is loaded:
          // Scroll immediately without re-fetching posts
          this.scrollToPost(this.targetPostId);
        }
      }
    });
  }

  getPostsObservable() {
    // this.posts$ = this.service.getPosts().pipe(map((response) => response.data));
    const activeLanguage = this.currentRouteLanguage;
    this.posts$ = this.service.getPosts(activeLanguage).pipe(
      map((response) => response.data || []),
      tap((posts: any[]) => {
        // Automatically track a view for each loaded post once per session
        // Cache posts in component state
        this.cachedPosts = posts;
        console.log('posts', posts);
        posts.forEach((post) => {
          if (post._id && !this.viewedPostIds.has(post._id)) {
            this.trackPostView(post);
          }
        });
        // 2. Trigger auto-scrolling if a targetPostId parameter exists
        if (this.targetPostId) {
          setTimeout(() => {
            this.scrollToPost(this.targetPostId!);
          }, 300);
        }
      }),
      shareReplay(1),
    );
  }

  scrollToPost(postId: string): void {
    const element = document.getElementById('post-' + postId);

    if (element) {
      // Smooth scroll to the post element
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Highlight post briefly to draw user attention
      element.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50/30');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50/30');
      }, 2500);
    }
  }

  trackPostView(post: any): void {
    // Record view in memory immediately to avoid duplicates
    this.viewedPostIds.add(post._id);

    this.service.registerView(post._id).subscribe({
      next: (res: any) => {
        if (res.success) {
          post.views = res.views;
        }
      },
      error: (err) => console.error('Error tracking view:', err),
    });
  }

  toggleLike(post: any): void {
    if (!this.userId) return;

    // Store state snapshot for local rollback on failure
    const previousLikes = [...(post.likes || [])];
    const previousLikeCount = post.likeCount ?? post.likes?.length ?? 0;

    const isCurrentlyLiked = this.isPostLikedByCurrentUser(post);

    // Optimistic UI Update directly on the post object
    if (isCurrentlyLiked) {
      post.likes = post.likes.filter((id: string) => id !== this.userId);
      post.likeCount = Math.max(0, previousLikeCount - 1);
    } else {
      post.likes = [...(post.likes || []), this.userId];
      post.likeCount = previousLikeCount + 1;
    }

    // Sync with backend without reloading the entire posts$ stream
    this.service.toggleLike(post._id, this.userId).subscribe({
      next: (res: any) => {
        if (res.success) {
          post.likeCount = res.likeCount;
          post.likes = res.likes;
        }
      },
      error: (err) => {
        console.error('Failed to toggle like:', err);
        // Instant local rollback
        post.likes = previousLikes;
        post.likeCount = previousLikeCount;
      },
    });
  }

  isPostLikedByCurrentUser(post: any): boolean {
    if (!post?.likes || !this.userId) return false;
    return post.likes.includes(this.userId);
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
    // Reset error state on attempt
    this.showPostContentError = false;

    if (!this.postContent.trim()) {
      this.showPostContentError = true;
      return;
    }

    this.isUploading = true;

    // Build multipart FormData payload
    const formData = new FormData();

    // 1. Text Content]
    formData.append('userId', localStorage.getItem('userId') || '');
    formData.append('content', this.postContent);
    formData.append('role', localStorage.getItem('role') || '');

    // 2. Selected Tags (sending array of IDs/Names as JSON)
    const tagIds = this.savedTags().map((tag) => tag.id);
    formData.append('tagIds', JSON.stringify(tagIds));

    // 3. Selected Memberships
    const membershipIds = this.savedMemberships().map((m) => m.id);
    formData.append('membershipIds', JSON.stringify(membershipIds));

    if (this.userType === 'user') {
      formData.append('targetLanguage', this.userLanguage); // Pass current URL language
    } else {
      formData.append('targetLanguage', this.currentRouteLanguage === 'te' ? 'Telugu' : 'English'); // Pass current URL language
    }
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
        this.isUploading = false;
        this.selectedFiles = []; // Clear attachments after success
        this.resetForm();
        this.getPostsObservable();
        this.closeModal();
        this.toastService.success('Post Created Successfully');
      },
      error: (error: any) => {
        console.error('Upload failed:', error);
        this.isUploading = false;
        this.toastService.error('Post Not Created Successfully');
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

  @ViewChild('postContentInput') postContentInput!: ElementRef<HTMLTextAreaElement>;

  showEmojiPicker: boolean = false;

  // Categorized emoji collection list
  emojiList: string[] = [
    '😀',
    '😃',
    '😄',
    '😁',
    '😆',
    '😅',
    '😂',
    '🤣',
    '😊',
    '😇',
    '🙂',
    '🙃',
    '😉',
    '😌',
    '😍',
    '🥰',
    '😘',
    '😗',
    '😙',
    '😚',
    '😋',
    '😛',
    '😜',
    '🤪',
    '😝',
    '🤑',
    '🤗',
    '🤭',
    '🤫',
    '🤔',
    '🤐',
    '🤨',
    '😐',
    '😑',
    '😶',
    '😏',
    '😒',
    '🙄',
    '😬',
    '🤥',
    '😌',
    '😔',
    '😪',
    '🤤',
    '😴',
    '😷',
    '🤒',
    '🤕',
    '🤢',
    '🤮',
    '🤧',
    '🥵',
    '🥶',
    '🥴',
    '😵',
    '🤯',
    '🤠',
    '🥳',
    '😎',
    '🤓',
    '🧐',
    '😕',
    '😟',
    '🙁',
    '😮',
    '😯',
    '😲',
    '😳',
    '🥺',
    '😦',
    '👍',
    '👎',
    '👏',
    '🙌',
    '👐',
    '🤲',
    '🤝',
    '🙏',
    '✌️',
    '🤘',
    '🔥',
    '✨',
    '💖',
    '❤️',
    '🎉',
    '🌟',
    '💯',
    '🚀',
    '💡',
    '💬',
  ];

  /**
   * Toggles emoji picker overlay display
   */
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  /**
   * Appends selected emoji to post text and keeps cursor active
   */
  selectEmoji(emoji: string): void {
    this.postContent += emoji;
    this.showEmojiPicker = false; // Close popup after selection

    if (this.postContentInput) {
      this.postContentInput.nativeElement.focus();
    }
  }

  /**
   * Optional: Closes popup when pressing the Escape key
   */
  @HostListener('document:keydown.escape')
  onKeydownHandler(): void {
    if (this.showEmojiPicker) {
      this.showEmojiPicker = false;
    }
  }

  // Toggle comments section and load comments from backend
  toggleComments(post: Post) {
    post.showComments = !post.showComments;
    console.log('post.showComments', post.showComments);

    if (post.showComments && !post.comments) {
      post.loadingComments = true;
      this.loadComments(post);
    }
  }

  loadComments(post: Post) {
    this.http.get<any>(`http://localhost:5000/api/comments/post/${post._id}`).subscribe({
      next: (data) => {
        const comments = data?.comments || [];
        post.comments = [...comments];
        post.loadingComments = false; // Stop loading state
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load comments', err);
        post.loadingComments = false; // Stop loading state on failure
        this.cd.detectChanges();
      },
    });
  }

  // Prepare component state when user clicks 'Reply' on a specific comment
  setReplyTo(post: Post, parentCommentId: string) {
    post.replyingToId = parentCommentId;
  }

  // Submit comment or reply
  submitComment(post: Post) {
    if (!post.newCommentText?.trim()) return;

    const commentPayload = {
      postId: post._id,
      userId: this.userId,
      username: this.commentUsername,
      content: post.newCommentText,
      parentId: post.replyingToId || null,
    };

    this.http.post('http://localhost:5000/api/comments', commentPayload).subscribe({
      next: (newComment: any) => {
        if (!post.comments) post.comments = [];
        post.comments.push(newComment);
        post.newCommentText = '';
        post.replyingToId = null;
        // post.showComments = !post.showComments;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Failed to submit comment', err),
    });
  }

  startEditing(post: any): void {
    this.activeMenuPostId = null;
    this.editingPostId = post._id;
    this.editContent = post.content;
    this.removedMediaIds = [];
    this.newEditFiles = [];
  }

  cancelEditing(): void {
    this.editingPostId = null;
    this.editContent = '';
    this.removedMediaIds = [];
    this.newEditFiles = [];
  }

  // Remove existing saved media from post
  markMediaForRemoval(mediaId: string): void {
    this.removedMediaIds.push(mediaId);
  }

  // Check if media is marked deleted in edit mode
  isMediaRemoved(mediaId: string): boolean {
    return this.removedMediaIds.includes(mediaId);
  }

  // Handle new media selection in Edit Mode
  onEditFileSelected(event: any, type: string): void {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      this.newEditFiles.push({ file, previewUrl, type });
    }
  }

  removeNewEditFile(index: number): void {
    this.newEditFiles.splice(index, 1);
  }

  saveEdit(post: any): void {
    if (!this.userId) {
      console.error('User is not authenticated.');
      return;
    }
    const formData = new FormData();
    formData.append('userId', this.userId);
    formData.append('content', this.editContent);

    // Append IDs of files to remove
    this.removedMediaIds.forEach((id) => formData.append('removedMediaIds', id));

    // Append new media files to upload
    this.newEditFiles.forEach((item) => formData.append('newFiles', item.file));

    this.service.updatePost(post._id, formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          post.content = res.data.content;
          post.mediaFiles = res.data.mediaFiles;
          this.cancelEditing();
          this.cd.detectChanges();
          this.toastService.success('Post Updated Successfully!');
        }
      },
      error: (err) => {
        console.error('Failed to update post:', err);
        this.toastService.error('Post Not Updated Successfully!');
      },
    });
  }

  // deletePost(postId: string): void {
  //   if (confirm('Are you sure you want to delete this post and its attachments?')) {
  //     this.service.deletePost(postId, this.userId).subscribe({
  //       next: (res) => {
  //         if (res.success) {
  //           window.location.reload();
  //         }
  //       },
  //       error: (err) => console.error('Failed to delete post:', err),
  //     });
  //   }
  // }

  // Opens the custom popup dialog
  openDeleteModal(id: string): void {
    this.activeMenuPostId = null;
    this.productToDeleteId = id;
    this.showDeleteModal = true;
  }

  // Closes the popup dialog without deleting
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDeleteId = '';
  }

  // Executed when "OK" / "Delete" is pressed in the modal
  confirmDelete(): void {
    if (!this.productToDeleteId) return;
    this.service.deletePost(this.productToDeleteId, this.userId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.getPostsObservable();
          this.toastService.success('Post deleted successfully!');
          this.cancelDelete();
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        (console.error('Error deleting product:', err), this.cancelDelete());
        this.cancelDelete();
        this.cd.detectChanges();
        this.toastService.error('Post not deleted!');
      },
    });
  }

  activeMenuPostId: string | null = null;

  toggleMenu(postId: string, event: Event): void {
    event.stopPropagation(); // Prevents HostListener from immediately closing the menu
    this.activeMenuPostId = this.activeMenuPostId === postId ? null : postId;
  }

  // Clear error dynamically when the user starts typing
  onContentInput(): void {
    if (this.postContent.trim()) {
      this.showPostContentError = false;
    }
  }
}
