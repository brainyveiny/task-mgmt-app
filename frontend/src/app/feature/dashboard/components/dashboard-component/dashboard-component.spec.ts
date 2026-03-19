// Unit tests for the Dashboard component
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { DashboardComponent } from './dashboard-component';
import { Task } from '../../../task-form/service/task-service';
import { environment } from '../../../../environments/environment';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let httpMock: HttpTestingController;
    let router: Router;
    const apiUrl = `${environment.apiUrl}/tasks`;

    const mockTasks: Task[] = [
        { id: 1, title: 'Todo Task', description: 'Desc 1', status: 'TODO', priority: 'HIGH', created_at: '2026-03-01', updated_at: '2026-03-01' },
        { id: 2, title: 'Progress Task', description: 'Desc 2', status: 'IN_PROGRESS', priority: 'MEDIUM', created_at: '2026-03-01', updated_at: '2026-03-01' },
        { id: 3, title: 'Done Task', description: 'Desc 3', status: 'DONE', priority: 'LOW', created_at: '2026-03-01', updated_at: '2026-03-01' },
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
        localStorage.setItem('token', 'test-token');
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    function initComponent(): void {
        fixture.detectChanges();
        const req = httpMock.expectOne(apiUrl);
        req.flush(mockTasks);
    }

    it('should create', () => {
        initComponent();
        expect(component).toBeTruthy();
    });

    describe('initialization', () => {
        it('should load tasks on init', () => {
            fixture.detectChanges();
            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('GET');
            req.flush(mockTasks);
            expect(component.tasks.length).toBe(3);
        });

        it('should set loading to false after tasks are loaded', () => {
            initComponent();
            expect(component.loading).toBe(false);
        });
    });

    describe('splitTasks', () => {
        it('should split tasks into TODO, IN_PROGRESS, and DONE lists', () => {
            initComponent();
            expect(component.todoTasks.length).toBe(1);
            expect(component.inProgressTasks.length).toBe(1);
            expect(component.doneTasks.length).toBe(1);
        });

        it('should place tasks in correct lists by status', () => {
            initComponent();
            expect(component.todoTasks[0].title).toBe('Todo Task');
            expect(component.inProgressTasks[0].title).toBe('Progress Task');
            expect(component.doneTasks[0].title).toBe('Done Task');
        });
    });

    describe('onSearch', () => {
        it('should trigger a debounced search', fakeAsync(() => {
            initComponent();
            component.searchQuery = 'report';
            component.onSearch();
            tick(400);

            const req = httpMock.expectOne(`${apiUrl}?search=report`);
            req.flush([]);
            expect(component.tasks.length).toBe(0);
        }));
    });

    describe('onFilter', () => {
        it('should reload tasks with selected status filter', () => {
            initComponent();
            component.selectedStatus = 'TODO';
            component.onFilter();

            const req = httpMock.expectOne(`${apiUrl}?task_status=TODO`);
            req.flush([mockTasks[0]]);
            expect(component.tasks.length).toBe(1);
        });
    });

    describe('deleteTask', () => {
        it('should send delete request and reload tasks after confirmation', () => {
            initComponent();
            vi.spyOn(window, 'confirm').mockReturnValue(true);
            component.deleteTask(1);

            const deleteReq = httpMock.expectOne(`${apiUrl}/1`);
            expect(deleteReq.request.method).toBe('DELETE');
            deleteReq.flush(null);

            const reloadReq = httpMock.expectOne(apiUrl);
            reloadReq.flush(mockTasks.slice(1));
            expect(component.tasks.length).toBe(2);
        });

        it('should not send delete request when user cancels', () => {
            initComponent();
            vi.spyOn(window, 'confirm').mockReturnValue(false);
            component.deleteTask(1);
            httpMock.expectNone(`${apiUrl}/1`);
        });

        it('should set error message on delete failure', () => {
            initComponent();
            vi.spyOn(window, 'confirm').mockReturnValue(true);
            component.deleteTask(1);

            const req = httpMock.expectOne(`${apiUrl}/1`);
            req.flush(null, { status: 500, statusText: 'Server Error' });
            expect(component.errorMessage).toBe('Failed to delete task.');
        });
    });

    describe('editTask', () => {
        it('should navigate to the edit route', () => {
            initComponent();
            vi.spyOn(router, 'navigate');
            component.editTask(5);
            expect(router.navigate).toHaveBeenCalledWith(['/tasks', 5, 'edit']);
        });
    });

    describe('createTask', () => {
        it('should navigate to the new task route', () => {
            initComponent();
            vi.spyOn(router, 'navigate');
            component.createTask();
            expect(router.navigate).toHaveBeenCalledWith(['/tasks/new']);
        });
    });

    describe('logout', () => {
        it('should clear token and navigate to login', () => {
            initComponent();
            vi.spyOn(router, 'navigate');
            component.logout();
            expect(localStorage.getItem('token')).toBeNull();
            expect(router.navigate).toHaveBeenCalledWith(['/login']);
        });
    });

    describe('getPriorityClass', () => {
        it('should return priority-low for LOW', () => {
            initComponent();
            expect(component.getPriorityClass('LOW')).toBe('priority-low');
        });

        it('should return priority-medium for MEDIUM', () => {
            initComponent();
            expect(component.getPriorityClass('MEDIUM')).toBe('priority-medium');
        });

        it('should return priority-high for HIGH', () => {
            initComponent();
            expect(component.getPriorityClass('HIGH')).toBe('priority-high');
        });

        it('should return empty string for unknown priority', () => {
            initComponent();
            expect(component.getPriorityClass('UNKNOWN')).toBe('');
        });
    });

    describe('error handling', () => {
        it('should set error message when loading tasks fails', () => {
            fixture.detectChanges();
            const req = httpMock.expectOne(apiUrl);
            req.flush(null, { status: 500, statusText: 'Server Error' });

            expect(component.errorMessage).toBe('Failed to load tasks.');
            expect(component.loading).toBe(false);
        });
    });

    describe('template', () => {
        it('should render the My Tasks heading', () => {
            initComponent();
            fixture.detectChanges();
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('h2')?.textContent).toContain('My Tasks');
        });

        it('should have a search input', () => {
            initComponent();
            fixture.detectChanges();
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('.search-input')).toBeTruthy();
        });

        it('should have a status filter dropdown', () => {
            initComponent();
            fixture.detectChanges();
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('.filter-select')).toBeTruthy();
        });

        it('should have a logout button', () => {
            initComponent();
            fixture.detectChanges();
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('.btn-logout')).toBeTruthy();
        });
    });
});
