import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TaskService, Task, TaskCreate, TaskUpdate } from './task-service';
import { environment } from '../../../../environments/environment';

describe('TaskService', () => {
    let service: TaskService;
    let httpMock: HttpTestingController;
    const apiUrl = `${environment.apiUrl}/tasks`;

    const mockTask: Task = {
        id: 1,
        title: 'Test Task',
        description: 'Test description',
        status: 'TODO',
        priority: 'MEDIUM',
        due_date: '2026-04-01',
        created_at: '2026-03-01',
        updated_at: '2026-03-01',
        user_id: 1,
    };

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

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getTasks', () => {
        it('should send a GET request without params', () => {
            service.getTasks().subscribe((tasks) => {
                expect(tasks.length).toBe(1);
                expect(tasks[0]).toEqual(mockTask);
            });

            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('GET');
            expect(req.request.params.keys().length).toBe(0);
            req.flush([mockTask]);
        });

        it('should send status as a query param when provided', () => {
            service.getTasks('TODO').subscribe();

            const req = httpMock.expectOne(`${apiUrl}?status=TODO`);
            expect(req.request.method).toBe('GET');
            expect(req.request.params.get('status')).toBe('TODO');
            req.flush([]);
        });

        it('should send search as a query param when provided', () => {
            service.getTasks(undefined, 'report').subscribe();

            const req = httpMock.expectOne(`${apiUrl}?search=report`);
            expect(req.request.params.get('search')).toBe('report');
            req.flush([]);
        });

        it('should send both status and search params when provided', () => {
            service.getTasks('IN_PROGRESS', 'deploy').subscribe();

            const req = httpMock.expectOne(`${apiUrl}?status=IN_PROGRESS&search=deploy`);
            expect(req.request.params.get('status')).toBe('IN_PROGRESS');
            expect(req.request.params.get('search')).toBe('deploy');
            req.flush([]);
        });
    });

    describe('getTaskById', () => {
        it('should return the matching task from the tasks list', () => {
            const secondTask: Task = { ...mockTask, id: 2, title: 'Second Task' };

            service.getTaskById(2).subscribe((task) => {
                expect(task.id).toBe(2);
                expect(task.title).toBe('Second Task');
            });

            const req = httpMock.expectOne(apiUrl);
            req.flush([mockTask, secondTask]);
        });

        it('should throw an error when task is not found', () => {
            service.getTaskById(999).subscribe({
                error: (err) => {
                    expect(err.message).toBe('Task not found');
                },
            });

            const req = httpMock.expectOne(apiUrl);
            req.flush([mockTask]);
        });
    });

    describe('createTask', () => {
        it('should send a POST request with task data', () => {
            const newTask: TaskCreate = { title: 'New Task', status: 'TODO', priority: 'HIGH' };

            service.createTask(newTask).subscribe((task) => {
                expect(task).toEqual(mockTask);
            });

            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(newTask);
            req.flush(mockTask);
        });
    });

    describe('updateTask', () => {
        it('should send a PUT request with updated data', () => {
            const updateData: TaskUpdate = { title: 'Updated Title', status: 'DONE' };

            service.updateTask(1, updateData).subscribe((task) => {
                expect(task).toEqual(mockTask);
            });

            const req = httpMock.expectOne(`${apiUrl}/1`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual(updateData);
            req.flush(mockTask);
        });
    });

    describe('deleteTask', () => {
        it('should send a DELETE request', () => {
            service.deleteTask(1).subscribe();

            const req = httpMock.expectOne(`${apiUrl}/1`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });
});
