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
    public showDeleteConfirmation = false;
    public deleteTargetId: number | null = null;
    public username: string = '';
    private shouldAlertSearch = false;
    private searchSubject = new Subject<string>();
    private searchSubscription?: Subscription;

    // #region constructor
    constructor(
        private taskService: TaskService,
        private authenticationService: AuthService,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef
    ) { }
    // #endregion

    // #region ngOnInit
    public ngOnInit(): void {
        this.authenticationService.getCurrentUser().subscribe({
            next: (res: any) => {
                this.username = res.username;
                this.changeDetectorRef.detectChanges();
            },
            error: () => {
                // Fallback: decode username from JWT if API call fails
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        this.username = payload.username || payload.sub || 'User';
                    } catch {
                        this.username = 'User';
                    }
                    this.changeDetectorRef.detectChanges();
                }
            }
        });
        this.loadTasks();
        this.searchSubscription = this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
            this.loadTasks();
        });
    }
    // #endregion

    // #region ngOnDestroy
    public ngOnDestroy(): void {
        this.searchSubscription?.unsubscribe();
    }
    // #endregion

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
            error: (error) => {
                alert(error?.error?.detail || 'Something went wrong');
                this.loading = false;
                this.changeDetectorRef.detectChanges();
            },
        });
    }
    // #endregion

    // #region splitTasks
    private splitTasks(): void {
        this.todoTasks = this.tasks.filter(task => task.status === 'TODO');
        this.inProgressTasks = this.tasks.filter(task => task.status === 'IN_PROGRESS');
        this.doneTasks = this.tasks.filter(task => task.status === 'DONE');
    }
    // #endregion

    // #region onSearch
    public onSearch(): void {
        this.searchSubject.next(this.searchQuery);
    }
    // #endregion

    // #region onSearchEnter
    public onSearchEnter(): void {
        this.shouldAlertSearch = true;
        this.loadTasks();
    }
    // #endregion

    // #region onFilter
    public onFilter(): void {
        this.loadTasks();
    }
    // #endregion

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
                error: (error) => {
                    alert(error?.error?.detail || 'Something went wrong');
                    this.loadTasks();
                }
            });
        }
    }
    // #endregion

    // #region deleteTask
    public deleteTask(id: number): void {
        this.deleteTargetId = id;
        this.showDeleteConfirmation = true;
    }
    // #endregion

    // #region confirmDelete
    public confirmDelete(): void {
        if (this.deleteTargetId === null) return;
        this.taskService.deleteTask(this.deleteTargetId).subscribe({
            next: () => {
                alert('Task deleted successfully');
                this.loadTasks();
            },
            error: (error) => {
                alert(error?.error?.detail || 'Something went wrong');
            },
        });
        this.showDeleteConfirmation = false;
        this.deleteTargetId = null;
    }
    // #endregion

    // #region cancelDelete
    public cancelDelete(): void {
        this.showDeleteConfirmation = false;
        this.deleteTargetId = null;
    }
    // #endregion

    // #region editTask
    public editTask(id: number): void {
        this.router.navigate(['/tasks', id, 'edit']);
    }
    // #endregion

    // #region createTask
    public createTask(): void {
        this.router.navigate(['/tasks/new']);
    }
    // #endregion

    // #region confirmLogout
    public confirmLogout(): void {
        this.showLogoutConfirmation = true;
    }
    // #endregion

    // #region cancelLogout
    public cancelLogout(): void {
        this.showLogoutConfirmation = false;
    }
    // #endregion

    // #region logout
    public logout(): void {
        this.authenticationService.logout();
        alert('Logout successful');
        this.router.navigate(['/login']);
    }
    // #endregion

    // #region getPriorityClass
    public getPriorityClass(priority: string): string {
        return { LOW: 'priority-low', MEDIUM: 'priority-medium', HIGH: 'priority-high' }[priority] || '';
    }
    // #endregion
}