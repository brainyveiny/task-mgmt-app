/**
 * @file task-form-component.spec.ts
 * @description Unit tests for the task editor component covering create and edit modes
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskFormComponent } from './task-form-component';
import { Task } from '../../../../../types/interface';
import { APP_CONFIG } from '../../../../types/constants';
/**
 * @summary Task form component test suite
 * Verifies form initialization, mode detection, and data pre-population for editing
 */
// #region describe
describe('TaskFormComponent', () => {
    let component: TaskFormComponent;
    let fixture: ComponentFixture<TaskFormComponent>;
    let httpMock: HttpTestingController;
    let router: Router;
    const apiUrl = `${APP_CONFIG.apiUrl}/tasks`;
    const mockTask: Task = {
        id: 1,
        title: 'Existing Task',
        description: 'Desc',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        due_date: '2026-04-01T00:00:00',
        created_at: '2026-03-01',
        updated_at: '2026-03-01',
    };
    /**
     * Helper to configure the testing module with dynamic route parameters
     */
    // #region setupModule
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
    // #endregion
    /**
     * @summary Cleanup procedure
     * Verifies that no pending HTTP requests remain after each test case
     */
    // #region afterEach
    afterEach(() => {
        httpMock.verify();
    });
    // #endregion
    /**
     * @summary Create mode verification
     * Confirms the form starts with blank/default state when no ID is provided in route
     */
    // #region create-mode-tests
    describe('create mode', () => {
        beforeEach(async () => {
            setupModule(null);
            fixture.detectChanges();
        });
        it('should create and initialize with default status', () => {
            expect(component).toBeTruthy();
            expect(component.taskForm.get('status')?.value).toBe('TODO');
        });
    });
    // #endregion
    /**
     * @summary Edit mode verification
     * Confirms the form fetches and populates existing data when a task ID is provided
     */
    // #region edit-mode-tests
    describe('edit mode', () => {
        beforeEach(async () => {
            setupModule('1');
            fixture.detectChanges();
        });
        it('should load task data and patch the form', () => {
            const req = httpMock.expectOne(`${apiUrl}/1`);
            req.flush(mockTask);
            expect(component.taskForm.get('title')?.value).toBe('Existing Task');
        });
    });
    // #endregion
});
// #endregion
