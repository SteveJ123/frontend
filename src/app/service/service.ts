import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../core/constants/api';

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

  constructor(private http: HttpClient) {}

  getPosts(): Observable<PostsResponse> {
    return this.http.get<PostsResponse>(this.apiUrl + 'posts');
  }

  posts(formData: any) {
    return this.http.post(this.apiUrl + 'posts', formData);
  }
}
