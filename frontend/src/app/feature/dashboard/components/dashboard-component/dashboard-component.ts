// Dashboard component: loads tasks, supports search/filter, drag-drop, edit, delete
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../../task-form/service/task-service';
import { AuthService } from '../../../login/service/auth-service';
import { Task, TaskStatus } from '../../../task-form/service/task-service';
import { AlertService } from '../../../../shared/alert.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'app-dashboard-component',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, DragDropModule],
    templateUrl: './dashboard-component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
    tasks: Task[] = [];
    todoTasks: Task[] = [];
    inProgressTasks: Task[] = [];
    doneTasks: Task[] = [];
    searchQuery = '';
    selectedStatus: TaskStatus | '' = '';
    errorMessage = '';
    loading = false;

    // Used to debounce search input so we don't call API on every keypress
    private searchSubject = new Subject<string>();
    private searchSub?: Subscription;

    constructor(
        private taskService: TaskService,
        private authService: AuthService,
        private router: Router,
        private alertService: AlertService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Load tasks immediately on page load
        this.loadTasks();
        // Wait 400ms after user stops typing before fetching
        this.searchSub = this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
            this.loadTasks();
            if (this.searchQuery && this.tasks.length > 0) {
                this.alertService.show('Task found');
            }
        });
    }

    ngOnDestroy(): void {
        this.searchSub?.unsubscribe();
    }

    // Fetch tasks from the API with current filters
    loadTasks(): void {
        this.loading = true;
        this.taskService.getTasks(
            this.selectedStatus || undefined,
            this.searchQuery || undefined
        ).subscribe({
            next: (response) => {
                this.tasks = response;
                this.splitTasks();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.errorMessage = 'Failed to load tasks.';
                this.loading = false;
                this.cdr.detectChanges();
            },
        });
    }

    // Split flat task list into three status buckets for the kanban columns
    splitTasks(): void {
        this.todoTasks = this.tasks.filter(t => t.status === 'TODO');
        this.inProgressTasks = this.tasks.filter(t => t.status === 'IN_PROGRESS');
        this.doneTasks = this.tasks.filter(t => t.status === 'DONE');
    }

    onSearch(): void { this.searchSubject.next(this.searchQuery); }
    onFilter(): void { this.loadTasks(); }

    // Called when a task card is dropped into a column
    onDrop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): void {
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
                error: () => { this.loadTasks(); }
            });
        }
    }

    deleteTask(id: number): void {
        if (!confirm('Delete this task?')) return;
        this.taskService.deleteTask(id).subscribe({
            next: () => {
                this.alertService.show('Task deleted successfully');
                this.loadTasks();
            },
            error: () => {
                this.errorMessage = 'Failed to delete task.';
            },
        });
    }

    editTask(id: number): void {
        this.router.navigate(['/tasks', id, 'edit']);
    }

    createTask(): void {
        this.router.navigate(['/tasks/new']);
    }

    logout(): void {
        this.authService.logout();
        this.alertService.show('Logged out successfully');
        this.router.navigate(['/login']);
    }

    // Returns a CSS class based on task priority for color coding
    getPriorityClass(priority: string): string {
        return { LOW: 'priority-low', MEDIUM: 'priority-medium', HIGH: 'priority-high' }[priority] || '';
    }
}
