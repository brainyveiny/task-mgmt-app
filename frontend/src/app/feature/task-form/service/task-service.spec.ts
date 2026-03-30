/**
 * @file task-service.spec.ts
 * @description Unit tests for the task data provider and API integration logic
 */
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TaskService } from './task-service';
import { Task, TaskCreate, TaskUpdate } from '../../../types/interface';
import { APP_CONFIG } from '../../../types/constants';
/**
 * @summary Task service test suite
 * Verifies CRUD operations, URL construction, and query parameter serialization
 */

// #region describe
describe('TaskService', () => {
    let service: TaskService;
    let httpMock: HttpTestingController;
    const apiUrl = `${APP_CONFIG.apiUrl}/tasks`;
    const mockTask: Task = {
        id: 1,
        title: 'Test Task',
        description: 'Test description',
        status: 'TODO',
        priority: 'MEDIUM',
        due_date: '2026-04-01',
        created_at: '2026-03-01',
        updated_at: '2026-03-01',
    };
    /**
     * @summary Test environment initialization
     * Injects the task service and HTTP testing controller
     */

    // #region beforeEach
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });
        service = TestBed.inject(TaskService);
        httpMock = TestBed.inject(HttpTestingController);
    });
    // #endregion

    /**
     * @summary Cleanup procedure
     * Verifies that no unexpected HTTP requests remain pending
     */

    // #region afterEach
    afterEach(() => {
        httpMock.verify();
    });
    // #endregion

    /**
     * @summary Creation check
     * Confirms service instantiation success
     */

    // #region create-test
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    // #endregion

    /**
     * @summary Retrieval logic tests
     * Verifies GET requests with and without optional status/search filters
     */

    // #region getTasks-tests
    describe('getTasks', () => {
        it('should send a GET request without parameters', () => {
            service.getTasks().subscribe((tasks) => {
                expect(tasks.length).toBe(1);
                expect(tasks[0]).toEqual(mockTask);
            });
            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('GET');
            expect(req.request.params.keys().length).toBe(0);
            req.flush([mockTask]);
        });
        it('should send task_status and search as query parameters when provided', () => {
            service.getTasks('TODO', 'report').subscribe();
            const req = httpMock.expectOne(`${apiUrl}?task_status=TODO&search=report`);
            expect(req.request.method).toBe('GET');
            expect(req.request.params.get('task_status')).toBe('TODO');
            expect(req.request.params.get('search')).toBe('report');
            req.flush([]);
        });
    });
    // #endregion

    /**
     * @summary Individual record access
     * Verifies fetching a specific task by ID
     */

    // #region getTaskById-tests
    describe('getTaskById', () => {
        it('should send a GET request to /tasks/:id', () => {
            service.getTaskById(1).subscribe((task) => {
                expect(task.id).toBe(1);
            });
            const req = httpMock.expectOne(`${apiUrl}/1`);
            expect(req.request.method).toBe('GET');
            req.flush(mockTask);
        });
    });
    // #endregion

    /**
     * @summary Persistence logic tests
     * Verifies POST, PUT, and DELETE operations for task lifecycle management
     */

    // #region crud-mutation-tests
    describe('mutations', () => {
        it('should send a POST request for createTask', () => {
            const newTask: TaskCreate = { title: 'New' };
            service.createTask(newTask).subscribe();
            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('POST');
            req.flush(mockTask);
        });
        it('should send a PUT request for updateTask', () => {
            const data: TaskUpdate = { title: 'Updated' };
            service.updateTask(1, data).subscribe();
            const req = httpMock.expectOne(`${apiUrl}/1`);
            expect(req.request.method).toBe('PUT');
            req.flush(mockTask);
        });
        it('should send a DELETE request for deleteTask', () => {
            service.deleteTask(1).subscribe();
            const req = httpMock.expectOne(`${apiUrl}/1`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });
    // #endregion

});
// #endregion
