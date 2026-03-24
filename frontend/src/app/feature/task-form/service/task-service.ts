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
    /**
     * Injects the HTTP client for backend communication
     */
    // #region constructor
    constructor(private httpClient: HttpClient) {
    }
    // #endregion
    /**
     * Retrieves a list of tasks with applied server-side filtering
     * @param status Optional filter for task status
     * @param search Optional keyword search filter
     */
    // #region getTasks
    public getTasks(status?: TaskStatus, search?: string): Observable<Task[]> {
        let parameters = new HttpParams();
        if (status) {
            parameters = parameters.set('task_status', status);
        }
        if (search) {
            parameters = parameters.set('search', search);
        }
        return this.httpClient.get<Task[]>(this.apiUrl, { params: parameters });
    }
    // #endregion
    /**
     * Fetches a single task record by its unique identifier
     * @param id Target task ID
     */
    // #region getTaskById
    public getTaskById(id: number): Observable<Task> {
        return this.httpClient.get<Task>(`${this.apiUrl}/${id}`);
    }
    // #endregion
    /**
     * Persists a new task record to the backend
     * @param data Initial task property set
     */
    // #region createTask
    public createTask(data: TaskCreate): Observable<Task> {
        return this.httpClient.post<Task>(this.apiUrl, data);
    }
    // #endregion
    /**
     * Updates an existing task record with partial or full data
     * @param id Target task ID
     * @param data Set of properties to modify
     */
    // #region updateTask
    public updateTask(id: number, data: TaskUpdate): Observable<Task> {
        return this.httpClient.put<Task>(`${this.apiUrl}/${id}`, data);
    }
    // #endregion
    /**
     * Permanently removes a task record from the backend
     * @param id Target task ID
     */
    // #region deleteTask
    public deleteTask(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
    }
    // #endregion
}
