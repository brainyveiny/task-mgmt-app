/**
 * @file task-service.ts
 * @description Data access layer for task-related CRUD operations and filtering
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../types/constants';
import { Task, TaskStatus, TaskUpdate, TaskCreate } from '../../../types/interface';

/**
 * @summary Task management data provider
 * Handles API interactions for task lifecycle, including status-based filtering and search query integration
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
    private readonly apiUrl = `${APP_CONFIG.apiUrl}/tasks`;

    // #region constructor
    constructor(private httpClient: HttpClient) {}
    // #endregion

    // #region getTasks
    public getTasks(status?: TaskStatus, search?: string): Observable<Task[]> {
        let parameters = new HttpParams();
        if (status) { parameters = parameters.set('task_status', status); }
        if (search) { parameters = parameters.set('search', search); }
        return this.httpClient.get<Task[]>(this.apiUrl, { params: parameters });
    }
    // #endregion

    // #region getTaskById
    public getTaskById(id: number): Observable<Task> {
        return this.httpClient.get<Task>(`${this.apiUrl}/${id}`);
    }
    // #endregion

    // #region createTask
    public createTask(data: TaskCreate): Observable<Task> {
        return this.httpClient.post<Task>(this.apiUrl, data);
    }
    // #endregion

    // #region updateTask
    public updateTask(id: number, data: TaskUpdate): Observable<Task> {
        return this.httpClient.put<Task>(`${this.apiUrl}/${id}`, data);
    }
    // #endregion

    // #region deleteTask
    public deleteTask(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
    }
    // #endregion
}
