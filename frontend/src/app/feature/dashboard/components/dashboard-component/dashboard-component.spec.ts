/**
 * @file dashboard-component.spec.ts
 * @description Comprehensive unit tests for the main task dashboard component
 */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { DashboardComponent } from './dashboard-component';
import { Task } from '../../../../types/interface';
import { APP_CONFIG } from '../../../../types/constants';
/**
 * @summary Dashboard component test suite
 * Verifies task loading, partition logic, search/filter functionality, and session management
 */

// #region describe
describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let httpMock: HttpTestingController;
    let router: Router;
    const apiUrl = `${APP_CONFIG.apiUrl}/tasks`;
    const mockTasks: Task[] = [
        { id: 1, title: 'Todo Task', description: 'Desc 1', status: 'TODO', priority: 'HIGH', created_at: '2026-03-01', updated_at: '2026-03-01' },
        { id: 2, title: 'Progress Task', description: 'Desc 2', status: 'IN_PROGRESS', priority: 'MEDIUM', created_at: '2026-03-01', updated_at: '2026-03-01' },
        { id: 3, title: 'Done Task', description: 'Desc 3', status: 'DONE', priority: 'LOW', created_at: '2026-03-01', updated_at: '2026-03-01' },
    ];
    /**
     * @summary Test environment initialization
     * Injects core providers for HTTP testing and navigation
     */

    // #region beforeEach
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
    // #endregion

    /**
     * @summary Cleanup verification
     * Resets local storage and verifies pending HTTP requests
     */

    // #region afterEach
    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });
    // #endregion

    /**
     * Helper to initialize the component with a pre-loaded task set
     */

    // #region initComponent
    function initComponent(): void {
        fixture.detectChanges();
        const req = httpMock.expectOne(apiUrl);
        req.flush(mockTasks);
    }
    // #endregion

    /**
     * @summary Identity verification
     * Confirms the component launches successfully
     */

    // #region create-test
    it('should create', () => {
        initComponent();
        expect(component).toBeTruthy();
    });
    // #endregion

    /**
     * @summary Initialization tests
     * Verifies data fetching on lifecycle init
     */

    // #region initialization-tests
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
    // #endregion

    /**
     * @summary Column partition verify
     * Confirms tasks are correctly categorized by status
     */

    // #region splitTasks-tests
    describe('splitTasks', () => {
        it('should split tasks into TODO, IN_PROGRESS, and DONE lists', () => {
            initComponent();
            expect(component.todoTasks.length).toBe(1);
            expect(component.inProgressTasks.length).toBe(1);
            expect(component.doneTasks.length).toBe(1);
        });
    });
    // #endregion

    /**
     * @summary Debounced search verify
     * Confirms search triggers API calls with correct query parameters after debounce delay
     */

    // #region onSearch-tests
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
    // #endregion

    /**
     * @summary Status filter verify
     * Confirms selecting a status reloads tasks with appropriate query params
     */

    // #region onFilter-tests
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
    // #endregion

    /**
     * @summary Task deletion verify
     * Confirms deletion sends DELETE request and refreshes view upon browser confirmation
     */

    // #region deleteTask-tests
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
    });
    // #endregion

    /**
     * @summary Session management verify
     * Confirms logout clears state and initiates navigation
     */

    // #region logout-tests
    describe('logout', () => {
        it('should set showLogoutConfirmation to true on confirmLogout()', () => {
            initComponent();
            component.confirmLogout();
            expect(component.showLogoutConfirmation).toBe(true);
        });
        it('should call authService.logout and navigate on logout()', () => {
            initComponent();
            vi.spyOn(router, 'navigate');
            component.logout();
            expect(router.navigate).toHaveBeenCalledWith(['/login']);
        });
        it('should hide modal on cancelLogout', () => {
            initComponent();
            component.showLogoutConfirmation = true;
            component.cancelLogout();
            expect(component.showLogoutConfirmation).toBe(false);
        });
    });
    // #endregion

    /**
     * @summary UI class mapping verify
     * Confirms priority strings map to correct visual style classes
     */

    // #region getPriorityClass-tests
    describe('getPriorityClass', () => {
        it('should return priority-low for LOW', () => {
            initComponent();
            expect(component.getPriorityClass('LOW')).toBe('priority-low');
        });
    });
    // #endregion

});
// #endregion
