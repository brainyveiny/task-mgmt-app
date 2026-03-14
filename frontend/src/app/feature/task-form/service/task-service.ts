import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string;
    created_at: string;
    updated_at: string;
    user_id: number;
}

export interface TaskCreate {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string;
}

export interface TaskUpdate {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
    private readonly apiUrl = `${environment.apiUrl}/tasks`;

    constructor(private http: HttpClient) { }

    getTasks(status?: TaskStatus, search?: string): Observable<Task[]> {
        let params = new HttpParams();
        if (status) params = params.set('status', status);
        if (search) params = params.set('search', search);
        return this.http.get<Task[]>(this.apiUrl, { params });
    }

    getTaskById(id: number): Observable<Task> {
        return this.http.get<Task>(`${this.apiUrl}/${id}`);
    }

    createTask(data: TaskCreate): Observable<Task> {
        return this.http.post<Task>(this.apiUrl, data);
    }

    updateTask(id: number, data: TaskUpdate): Observable<Task> {
        return this.http.put<Task>(`${this.apiUrl}/${id}`, data);
    }

    deleteTask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
