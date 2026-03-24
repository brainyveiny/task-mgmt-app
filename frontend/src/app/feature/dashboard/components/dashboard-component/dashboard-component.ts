/**
 * @file dashboard-component.ts
 * @description Central dashboard for task management using Kanban-style visualization and filtering
 */
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../../task-form/service/task-service';
import { AuthService } from '../../../login/service/auth-service';
import { Task, TaskStatus } from '../../../../types/interface';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
/**
 * @summary Dashboard interaction controller
 * Manages task list state, provides search/filter logic, and handles drag-and-drop status transitions
 */
@Component({
    selector: 'app-dashboard-component',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, DragDropModule],
    templateUrl: './dashboard-component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
    public tasks: Task[] = [];
    public todoTasks: Task[] = [];
    public inProgressTasks: Task[] = [];
    public doneTasks: Task[] = [];
    public searchQuery = '';
    public selectedStatus: TaskStatus | '' = '';
    public loading = false;
    public showLogoutConfirmation = false;
    private shouldAlertSearch = false;
    private searchSubject = new Subject<string>();
    private searchSubscription?: Subscription;
    /**
     * Injects dependencies for data fetching, authentication, and view synchronization
     */
    // #region constructor
    constructor(
        private taskService: TaskService,
        private authenticationService: AuthService,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef
    ) { }
    // #endregion
    /**
     * Initializes the component by loading tasks and setting up the debounced search stream
     */
    // #region ngOnInit
    public ngOnInit(): void {
        this.loadTasks();
        this.searchSubscription = this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
            this.loadTasks();
        });
    }
    // #endregion
    /**
     * Cleans up subscriptions to prevent memory leaks on component destruction
     */
    // #region ngOnDestroy
    public ngOnDestroy(): void {
        this.searchSubscription?.unsubscribe();
    }
    // #endregion
    /**
     * Fetches tasks from the backend with optional status and search term filters
     */
    // #region loadTasks
    public loadTasks(): void {
        this.loading = true;
        this.taskService.getTasks(
            this.selectedStatus || undefined,
            this.searchQuery || undefined
        ).subscribe({
            next: (response) => {
                this.tasks = response;
                this.splitTasks();
                this.loading = false;
                if (this.shouldAlertSearch) {
                    if (this.tasks.length > 0) {
                        alert('Task found successfully');
                    } else {
                        alert('Task not found');
                    }
                    this.shouldAlertSearch = false;
                }
                this.changeDetectorRef.detectChanges();
            },
            error: () => {
                alert('Something went wrong');
                this.loading = false;
                this.changeDetectorRef.detectChanges();
            },
        });
    }
    // #endregion
    /**
     * Partitions the raw task list into separate status-based arrays for Kanban columns
     */
    // #region splitTasks
    private splitTasks(): void {
        this.todoTasks = this.tasks.filter(task => {
            return task.status === 'TODO';
        });
        this.inProgressTasks = this.tasks.filter(task => {
            return task.status === 'IN_PROGRESS';
        });
        this.doneTasks = this.tasks.filter(task => {
            return task.status === 'DONE';
        });
    }
    // #endregion
    /**
     * Triggers the debounced search subject on query input
     */
    // #region onSearch
    public onSearch(): void {
        this.searchSubject.next(this.searchQuery);
    }
    // #endregion
    /**
     * Triggers an immediate task load with searching feedback when Enter is pressed
     */
    // #region onSearchEnter
    public onSearchEnter(): void {
        this.shouldAlertSearch = true;
        this.loadTasks();
    }
    // #endregion
    /**
     * Reloads tasks when status filters change
     */
    // #region onFilter
    public onFilter(): void {
        this.loadTasks();
    }
    // #endregion
    /**
     * Handles CDK drag-and-drop events to reorder or transition task statuses
     * @param event Drag-drop event payload
     * @param newStatus The target status for the dropped task
     */
    // #region onDrop
    public onDrop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
            const task = event.container.data[event.currentIndex];
            task.status = newStatus;
            this.taskService.updateTask(task.id, { status: newStatus }).subscribe({
                next: () => {
                    alert('Task updated successfully');
                },
                error: () => {
                    alert('Something went wrong');
                    this.loadTasks();
                }
            });
        }
    }
    // #endregion
    /**
     * Orchestrates task deletion with user confirmation
     * @param id Unique task identifier
     */
    // #region deleteTask
    public deleteTask(id: number): void {
        if (!confirm('Delete this task?')) {
            return;
        }
        this.taskService.deleteTask(id).subscribe({
            next: () => {
                alert('Task deleted successfully');
                this.loadTasks();
            },
            error: () => {
                alert('Something went wrong');
            },
        });
    }
    // #endregion
    /**
     * Navigates to the task editing interface
     * @param id Target task ID
     */
    // #region editTask
    public editTask(id: number): void {
        this.router.navigate(['/tasks', id, 'edit']);
    }
    // #endregion
    /**
     * Navigates to the task creation interface
     */
    // #region createTask
    public createTask(): void {
        this.router.navigate(['/tasks/new']);
    }
    // #endregion
    /**
     * Displays the logout confirmation modal
     */
    // #region confirmLogout
    public confirmLogout(): void {
        this.showLogoutConfirmation = true;
    }
    // #endregion
    /**
     * Dismisses the logout confirmation modal
     */
    // #region cancelLogout
    public cancelLogout(): void {
        this.showLogoutConfirmation = false;
    }
    // #endregion
    /**
     * Terminates the user session and redirects to the login page
     */
    // #region logout
    public logout(): void {
        this.authenticationService.logout();
        alert('Logged out successfully');
        this.router.navigate(['/login']);
    }
    // #endregion
    /**
     * Determines the appropriate CSS class for task priority labels
     * @param priority Task priority level
     * @returns CSS class name string
     */
    // #region getPriorityClass
    public getPriorityClass(priority: string): string {
        return { LOW: 'priority-low', MEDIUM: 'priority-medium', HIGH: 'priority-high' }[priority] || '';
    }
    // #endregion
}
