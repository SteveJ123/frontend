import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { apiUrl } from '../core/constants/api';
import { HttpParams } from '@angular/common/http';

export interface MediaFile {
  filename: string;
  path: string;
  mimetype: string;
  mediaType: string;
}

export interface Post {
  _id: string;
  content: string;
  tagIds: string[];
  membershipIds: string[];
  mediaFiles: MediaFile[];
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  success: boolean;
  message: string;
  data: Post[];
}

@Injectable({
  providedIn: 'root',
})
export class Service {
  private apiUrl = `${apiUrl}api/`;
  // private apiUrl = 'http://localhost:5000/api/';
  // private apiUrl = 'https://backend-2rgv.onrender.com/api/';

  // 1. Subject to hold notifications array state
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  // 2. Reactive stream for unread count
  // unreadCount$: Observable<number> = this.notifications$.pipe(
  //   map((list) => list.filter((n) => !n.isRead).length),
  // );
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  // getPosts(): Observable<PostsResponse> {
  //   return this.http.get<PostsResponse>(this.apiUrl + 'posts');
  // }

  getPosts(language?: string): Observable<PostsResponse> {
    let params = new HttpParams();

    if (language) {
      params = params.set('language', language);
    }

    return this.http.get<PostsResponse>(this.apiUrl + 'posts', { params });
  }

  getEnPosts(): Observable<PostsResponse> {
    return this.http.get<PostsResponse>(this.apiUrl + 'en/posts');
  }
  getPostsByUserId(userId: string): Observable<PostsResponse> {
    return this.http.get<PostsResponse>(`${this.apiUrl}posts/user/${userId}`);
  }

  posts(formData: any) {
    return this.http.post(this.apiUrl + 'posts', formData);
  }

  enposts(formData: any) {
    return this.http.post(this.apiUrl + 'en/posts', formData);
  }

  registerView(postId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}posts/${postId}/view`, {});
  }

  registerEnView(postId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}em/posts/${postId}/view`, {});
  }

  toggleLike(postId: string, userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}posts/${postId}/like`, { userId });
  }

  toggleEnLike(postId: string, userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}en/posts/${postId}/like`, { userId });
  }

  getPostComments(postId: any) {
    return this.http.get(`${this.apiUrl}comments/post/${postId}`);
  }

  postComments(commentPayload: any) {
    return this.http.post(`${this.apiUrl}comments`, commentPayload);
  }

  // getCourseList(courseType: any, role: any) {
  //   // return this.http.get(`${this.apiUrl}courses?search=${encodeURIComponent(url)}`);
  //   let params = new HttpParams();

  //   if (courseType) {
  //     params = params.set('courseType', courseType);
  //   }
  //   if (role) {
  //     params = params.set('role', role);
  //   }

  //   return this.http.get(`${this.apiUrl}courses`, { params });
  // }

  // createCourse(formData: any) {
  //   return this.http.post(`${this.apiUrl}courses`, formData);
  // }

  // updateCourse(id: string, formData: any): Observable<any> {
  //   return this.http.put<any>(`${this.apiUrl}courses/${id}`, formData);
  // }

  // /**
  //  * Deletes a course by ID (backend will automatically unlink the thumbnail file).
  //  */
  // deleteCourse(id: string): Observable<any> {
  //   return this.http.delete<any>(`${this.apiUrl}courses/${id}`);
  // }

  // getUserNotifications(userId: any) {
  //   const params = new HttpParams().set('userId', userId);
  //   return this.http.get(`${this.apiUrl}notifications`, { params });
  // }

  // getUserEnNotifications(userId: any) {
  //   const params = new HttpParams().set('userId', userId);
  //   return this.http.get(`${this.apiUrl}en/notifications`, { params });
  // }

  // getUserProfile(userId: any) {
  //   return this.http.get(`${this.apiUrl}personal-details/${userId}`);
  // }

  getCourses(language?: string, courseType?: string, role?: string): Observable<any> {
    let params = new HttpParams();
    if (language) params = params.set('language', language);
    if (courseType) params = params.set('courseType', courseType);
    if (role) params = params.set('role', role);

    return this.http.get<any>(`${this.apiUrl}courses`, { params });
  }

  /**
   * POST: Create a new course with multipart form data (handles file upload)
   */
  createCourse(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}courses`, formData);
  }

  /**
   * PUT: Update an existing course by ID (handles optional file replacement)
   */
  updateCourse(id: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}courses/${id}`, formData);
  }

  /**
   * DELETE: Remove a course by ID
   */
  deleteCourse(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}courses/${id}`);
  }

  getUserProfile(userId: string, lang: string = 'te'): Observable<any> {
    return this.http.get(`${this.getApiUrl(lang)}personal-details/${userId}`);
  }

  getEnUserProfile(userId: any) {
    return this.http.get(`${this.apiUrl}en/personal-details/${userId}`);
  }

  private getApiUrl(lang: string = 'te'): string {
    const isEnglish =
      lang?.toLowerCase().trim() === 'en' || lang?.toLowerCase().trim() === 'english';
    return isEnglish ? `${this.apiUrl}en/` : `${this.apiUrl}`;
  }

  // --- NOTIFICATION API ENDPOINTS ---

  fetchNotifications(userId: string, lang: string = 'te'): void {
    if (!userId) return;
    const params = new HttpParams().set('userId', userId);
    const endpoint = `${this.getApiUrl(lang)}notifications`;

    this.http.get<any>(endpoint, { params }).subscribe({
      next: (res) => {
        const list = res.data || [];
        const unread = list.filter((n: any) => !n.isRead).length;
        this.notificationsSubject.next(list);
        this.unreadCountSubject.next(unread);
      },
      error: (err) => console.error('Failed to load notifications', err),
    });
  }

  getUserNotifications(userId: string, lang: string = 'te'): Observable<any> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get(`${this.getApiUrl(lang)}notifications`, { params });
  }

  notificationsUpdateRead(notificationId: string, lang: string = 'te'): Observable<any> {
    const endpoint = `${this.getApiUrl(lang)}notifications/${notificationId}/read`;

    return this.http.patch(endpoint, {}).pipe(
      tap(() => {
        const currentList = this.notificationsSubject.value.map((item) => {
          if (item._id === notificationId) {
            return { ...item, isRead: true };
          }
          return item;
        });

        const newUnreadCount = currentList.filter((n) => !n.isRead).length;

        this.notificationsSubject.next(currentList);
        this.unreadCountSubject.next(newUnreadCount);
      }),
    );
  }

  // notificationsUpdateRead(notificationId: string): Observable<any> {
  //   return this.http.patch(`${this.apiUrl}notifications/${notificationId}/read`, {}).pipe(
  //     tap(() => {
  //       // Update local state array
  //       const currentList = this.notificationsSubject.value.map((item) => {
  //         if (item._id === notificationId) {
  //           return { ...item, isRead: true };
  //         }
  //         return item;
  //       });

  //       // Compute new unread total
  //       const newUnreadCount = currentList.filter((n) => !n.isRead).length;

  //       // Broadcast to all active subscribers instantly
  //       this.notificationsSubject.next(currentList);
  //       this.unreadCountSubject.next(newUnreadCount);
  //     }),
  //   );
  // }

  // fetchNotifications(userId: string): void {
  //   if (!userId) return;
  //   const params = new HttpParams().set('userId', userId);
  //   this.http.get<any>(`${this.apiUrl}notifications`, { params }).subscribe({
  //     next: (res) => {
  //       console.log('res-----', res.data);
  //       const list = res.data || [];
  //       const unread = list.filter((n: any) => !n.isRead).length;
  //       this.notificationsSubject.next(list);
  //       this.unreadCountSubject.next(unread);
  //     },
  //     error: (err) => console.error('Failed to load notifications', err),
  //   });
  // }

  updatePost(postId: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}posts/${postId}`, formData);
  }

  deletePost(postId: string, userId: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}posts/${postId}?userid=${userId}`);
  }

  getSession(language: any, courseType: any, role: any) {
    // return this.http.get(`${this.apiUrl}courses?search=${encodeURIComponent(url)}`);
    let params = new HttpParams();
    if (language) {
      params = params.set('language', language);
    }
    if (courseType) {
      params = params.set('courseType', courseType);
    }

    if (role) {
      params = params.set('role', role);
    }
    return this.http.get(`${this.apiUrl}session`, { params });
  }

  createSession(formData: any) {
    return this.http.post(`${this.apiUrl}session`, formData);
  }

  updateSession(id: string, formData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}session/${id}`, formData);
  }

  /**
   * Deletes a course by ID (backend will automatically unlink the thumbnail file).
   */
  deleteSession(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}session/${id}`);
  }

  // getProducts() {
  //   return this.http.get(`${this.apiUrl}products`);
  // }

  // createProduct(formData: any) {
  //   return this.http.post(`${this.apiUrl}products`, formData);
  // }

  // updateProduct(id: any, formData: any) {
  //   return this.http.put<any>(`${this.apiUrl}products/${id}`, formData);
  // }

  // deleteProduct(id: any) {
  //   return this.http.delete<any>(`${this.apiUrl}products/${id}`);
  // }

  getProducts(language?: string): Observable<any> {
    let params = new HttpParams();
    if (language) {
      params = params.set('language', language);
    }
    return this.http.get<any>(`${this.apiUrl}products`, { params });
  }

  createProduct(formData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}products`, formData);
  }

  updateProduct(id: string, formData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}products/${id}`, formData);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}products/${id}`);
  }

  //   return this.http.get<PostsResponse>(this.apiUrl + 'admin-posts');
  // }

  getAdminPosts(language?: string): Observable<PostsResponse> {
    let params = new HttpParams();
    if (language) {
      params = params.set('language', language);
    }
    return this.http.get<PostsResponse>(this.apiUrl + 'admin-posts', { params });
  }

  getAdminPostsById(userId: string): Observable<PostsResponse> {
    return this.http.get<PostsResponse>(`${this.apiUrl}admin-posts/admin/${userId}`);
  }

  postsAdmin(formData: any) {
    return this.http.post(this.apiUrl + 'admin-posts', formData);
  }

  updateAdminPost(postId: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}admin-posts/${postId}`, formData);
  }

  registerAdminPostView(postId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}admin-posts/${postId}/view`, {});
  }

  toggleAdminPostLike(postId: string, userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}admin-posts/${postId}/like`, { userId });
  }

  deleteAdminPost(postId: string, userId: any): Observable<any> {
    // return this.http.delete(`${this.apiUrl}admin-posts/${postId}?userid=${userId}`);
    const params = new HttpParams().set('userid', userId);
    return this.http.delete(`${this.apiUrl}admin-posts/${postId}`, { params });
  }

  getAdminPostComments(postId: any) {
    return this.http.get(`${this.apiUrl}admin-comments/post/${postId}`);
  }

  postAdminComments(commentPayload: any) {
    return this.http.post(`${this.apiUrl}admin-comments`, commentPayload);
  }

  fetchTrackerUpdate(userId: any) {
    return this.http.get(`${this.apiUrl}tracker-status/${userId}`);
  }

  MarkPracticeComplete(userId: any) {
    return this.http.post(`${this.apiUrl}complete-today`, { userId });
  }

  /**
   * GET: Fetch support team members (filtered by language)
   */
  getSupportTeam(language?: string): Observable<any> {
    let params = new HttpParams();
    if (language) {
      params = params.set('language', language);
    }
    return this.http.get<any>(`${this.apiUrl}support-team`, { params });
  }

  /**
   * POST: Create a new support team member
   */
  createMember(memberData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}support-team`, memberData);
  }

  /**
   * PUT: Update an existing support team member by ID
   */
  updateMember(id: string, memberData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}support-team/${id}`, memberData);
  }

  /**
   * DELETE: Remove a support team member by ID
   */
  deleteMember(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}support-team/${id}`);
  }

  getUsersTrackerSummary(language?: string): Observable<any> {
    let params = new HttpParams();
    if (language) {
      params = params.set('language', language);
    }
    return this.http.get<any>(`${this.apiUrl}admin-users-tracker`, { params });
  }

  // getPersonalDetails(userId: any) {
  //   return this.http.get<any>(`${this.apiUrl}personal-details/${userId}`);
  // }
  // uploadProfilePicture(userId: any, formData: any) {
  //   return this.http.put<any>(`${this.apiUrl}personal-details/${userId}/profile-image`, formData);
  // }

  // postProfilePicture(userId: any, formData: any) {
  //   return this.http.post<any>(`${this.apiUrl}personal-details/${userId}/profile-image`, formData);
  // }

  // deleteProfilePicture(userId: any) {
  //   return this.http.delete<any>(`${this.apiUrl}personal-details/${userId}/profile-image`);
  // }

  /**
   * GET: Fetch personal details for a user based on language
   */
  getPersonalDetails(userId: string, language: string): Observable<any> {
    const params = new HttpParams().set('language', language);
    return this.http.get<any>(`${this.apiUrl}personal-details/${userId}`, { params });
  }

  /**
   * PUT: Update text personal details (name, aboutYou, gender, birthday, language)
   */
  updatePersonalDetails(userId: string, details: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}personal-details/${userId}`, details);
  }

  /**
   * PUT: Upload or replace profile image file
   */
  uploadProfileImage(userId: string, formData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}personal-details/${userId}/profile-image`, formData);
  }

  /**
   * DELETE: Remove profile image
   */
  deleteProfileImage(userId: string, language: string): Observable<any> {
    const params = new HttpParams().set('language', language);
    return this.http.delete<any>(`${this.apiUrl}personal-details/${userId}/profile-image`, {
      params,
    });
  }

  // Fetch all courses filtered by language
  dgetCourses(language: string): Observable<any> {
    const params = new HttpParams().set('language', language);
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Fetch single course details
  getCourseById(courseId: string, language: string): Observable<any> {
    const params = new HttpParams().set('language', language);
    return this.http.get<any>(`${this.apiUrl}course/${courseId}`, { params });
  }

  // Create course (pass language in payload)
  createCourseLecture(courseData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, courseData);
  }

  // Upload lecture video (append language inside FormData)
  uploadLecture(courseId: string, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}course/${courseId}/lectures`, formData);
  }

  // Update course
  updateCourseLecture(courseId: string, courseData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${courseId}`, courseData);
  }

  // Delete course
  deleteCourseLecture(courseId: string, language: string): Observable<any> {
    const params = new HttpParams().set('language', language);
    return this.http.delete<any>(`${this.apiUrl}/${courseId}`, { params });
  }

  // // Delete specific lecture
  // deleteLecture(courseId: string, lectureId: string, language: string): Observable<any> {
  //   const params = new HttpParams().set('language', language);
  //   return this.http.delete<any>(`${this.apiUrl}/${courseId}/lectures/${lectureId}`, { params });
  // }

  // Update an existing lecture
  updateLecture(courseId: string, lectureId: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}course/${courseId}/lectures/${lectureId}`, formData);
  }

  // Delete a specific lecture
  deleteLecture(courseId: string, lectureId: string, language: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}course/${courseId}/lectures/${lectureId}?language=${language}`,
    );
  }
}
