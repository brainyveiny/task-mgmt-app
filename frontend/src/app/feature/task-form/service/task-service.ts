// Task service: handles all CRUD API calls for tasks
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

    // GET /tasks — optional filters: task_status and search
    getTasks(status?: TaskStatus, search?: string): Observable<Task[]> {
        let params = new HttpParams();
        if (status) params = params.set('task_status', status);
        if (search) params = params.set('search', search);
        return this.http.get<Task[]>(this.apiUrl, { params });
    }

    // GET /tasks/:id
    getTaskById(id: number): Observable<Task> {
        return this.http.get<Task>(`${this.apiUrl}/${id}`);
    }

    // POST /tasks
    createTask(data: TaskCreate): Observable<Task> {
        return this.http.post<Task>(this.apiUrl, data);
    }

    // PUT /tasks/:id
    updateTask(id: number, data: TaskUpdate): Observable<Task> {
        return this.http.put<Task>(`${this.apiUrl}/${id}`, data);
    }

    // DELETE /tasks/:id
    deleteTask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
