import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { TaskFormComponent } from './task-form-component';
import { Task } from '../../service/task-service';
import { environment } from '../../../../environments/environment';

describe('TaskFormComponent', () => {
    let component: TaskFormComponent;
    let fixture: ComponentFixture<TaskFormComponent>;
    let httpMock: HttpTestingController;
    let router: Router;
    const apiUrl = `${environment.apiUrl}/tasks`;

    const mockTask: Task = {
        id: 1,
        title: 'Existing Task',
        description: 'Some description',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        due_date: '2026-04-01T00:00:00',
        created_at: '2026-03-01',
        updated_at: '2026-03-01',
    };

    function setupModule(routeId: string | null = null) {
        TestBed.configureTestingModule({
            imports: [TaskFormComponent],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: convertToParamMap(routeId ? { id: routeId } : {}),
                        },
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TaskFormComponent);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
    }

    afterEach(() => {
        httpMock.verify();
    });

    describe('create mode', () => {
        beforeEach(async () => {
            await setupModule(null);
            fixture.detectChanges();
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should not be in edit mode', () => {
            expect(component.isEditMode).toBe(false);
        });

        it('should initialize form with default values', () => {
            expect(component.taskForm.get('title')?.value).toBe('');
            expect(component.taskForm.get('description')?.value).toBe('');
            expect(component.taskForm.get('status')?.value).toBe('TODO');
            expect(component.taskForm.get('priority')?.value).toBe('MEDIUM');
            expect(component.taskForm.get('due_date')?.value).toBe('');
        });

        describe('form validation', () => {
            it('should mark title as invalid when empty', () => {
                component.taskForm.get('title')?.setValue('');
                expect(component.taskForm.get('title')?.valid).toBe(false);
            });

            it('should mark title as invalid when less than 3 characters', () => {
                component.taskForm.get('title')?.setValue('ab');
                expect(component.taskForm.get('title')?.valid).toBe(false);
            });

            it('should mark title as valid with 3 or more characters', () => {
                component.taskForm.get('title')?.setValue('abc');
                expect(component.taskForm.get('title')?.valid).toBe(true);
            });

            it('should allow empty description', () => {
                component.taskForm.get('description')?.setValue('');
                expect(component.taskForm.get('description')?.valid).toBe(true);
            });
        });

        describe('onSubmit - create', () => {
            it('should not submit when form is invalid', () => {
                component.onSubmit();
                httpMock.expectNone(apiUrl);
            });

            it('should send a POST request when creating a task', () => {
                component.taskForm.setValue({
                    title: 'New Task',
                    description: 'Task description',
                    status: 'TODO',
                    priority: 'MEDIUM',
                    due_date: '',
                });
                component.onSubmit();

                const req = httpMock.expectOne(apiUrl);
                expect(req.request.method).toBe('POST');
                expect(req.request.body.title).toBe('New Task');
                req.flush(mockTask);
            });

            it('should set success message on successful creation', fakeAsync(() => {
                vi.spyOn(router, 'navigate');
                component.taskForm.setValue({
                    title: 'New Task',
                    description: '',
                    status: 'TODO',
                    priority: 'MEDIUM',
                    due_date: '',
                });
                component.onSubmit();

                const req = httpMock.expectOne(apiUrl);
                req.flush(mockTask);

                expect(component.successMessage).toBe('Task created!');
                expect(component.loading).toBe(false);
            }));

            it('should set error message on creation failure', () => {
                component.taskForm.setValue({
                    title: 'New Task',
                    description: '',
                    status: 'TODO',
                    priority: 'MEDIUM',
                    due_date: '',
                });
                component.onSubmit();

                const req = httpMock.expectOne(apiUrl);
                req.flush({ detail: 'Failed to create' }, { status: 400, statusText: 'Bad Request' });

                expect(component.errorMessage).toBe('Failed to create');
                expect(component.loading).toBe(false);
            });
        });

        describe('cancel', () => {
            it('should reset the form to default values', () => {
                component.taskForm.setValue({
                    title: 'Some task',
                    description: 'Some desc',
                    status: 'DONE',
                    priority: 'HIGH',
                    due_date: '2026-05-01',
                });
                component.cancel();

                expect(component.taskForm.get('status')?.value).toBe('TODO');
                expect(component.taskForm.get('priority')?.value).toBe('MEDIUM');
                expect(component.errorMessage).toBe('');
                expect(component.successMessage).toBe('');
            });
        });
    });

    describe('edit mode', () => {
        beforeEach(async () => {
            await setupModule('1');
            fixture.detectChanges();
        });

        it('should be in edit mode when route has an id', () => {
            const req = httpMock.expectOne(`${apiUrl}/1`);
            req.flush(mockTask);
            expect(component.isEditMode).toBe(true);
            expect(component.taskId).toBe(1);
        });

        it('should load the task and patch the form', () => {
            const req = httpMock.expectOne(`${apiUrl}/1`);
            req.flush(mockTask);

            expect(component.taskForm.get('title')?.value).toBe('Existing Task');
            expect(component.taskForm.get('description')?.value).toBe('Some description');
            expect(component.taskForm.get('status')?.value).toBe('IN_PROGRESS');
            expect(component.taskForm.get('priority')?.value).toBe('HIGH');
            expect(component.taskForm.get('due_date')?.value).toBe('2026-04-01');
        });

        it('should send a PUT request when updating a task', () => {
            const req = httpMock.expectOne(`${apiUrl}/1`);
            req.flush(mockTask);

            component.taskForm.get('title')?.setValue('Updated Title');
            component.onSubmit();

            const updateReq = httpMock.expectOne(`${apiUrl}/1`);
            expect(updateReq.request.method).toBe('PUT');
            expect(updateReq.request.body.title).toBe('Updated Title');
            updateReq.flush({ ...mockTask, title: 'Updated Title' });

            expect(component.successMessage).toBe('Task updated!');
        });

        it('should set error message when loading task fails', () => {
            const req = httpMock.expectOne(`${apiUrl}/1`);
            req.flush(null, { status: 500, statusText: 'Server Error' });

            expect(component.errorMessage).toBe('Failed to load task.');
        });
    });

    describe('template', () => {
        beforeEach(async () => {
            await setupModule(null);
            fixture.detectChanges();
        });

        it('should show Create Task heading in create mode', () => {
            fixture.detectChanges();
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('h2')?.textContent).toContain('Create Task');
        });

        it('should have title input field', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('#task-title')).toBeTruthy();
        });

        it('should have description textarea', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('#task-description')).toBeTruthy();
        });

        it('should have status and priority dropdowns', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('#task-status')).toBeTruthy();
            expect(compiled.querySelector('#task-priority')).toBeTruthy();
        });

        it('should have a due date input', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('#task-due-date')).toBeTruthy();
        });

        it('should have submit and cancel buttons', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
            expect(compiled.querySelector('.btn-secondary')).toBeTruthy();
        });

        it('should have a back to dashboard link', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('.back-link')).toBeTruthy();
        });
    });
});
