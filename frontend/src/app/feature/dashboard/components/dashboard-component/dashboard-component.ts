import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../../task-form/service/task-service';
import { AuthService } from '../../../login/service/auth-service';
import { Task, TaskStatus } from '../../../task-form/service/task-service';
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

    private searchSubject = new Subject<string>();
    private searchSub?: Subscription;

    constructor(
        private taskService: TaskService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadTasks();
        this.searchSub = this.searchSubject.pipe(debounceTime(400)).subscribe(() => this.loadTasks());
    }

    ngOnDestroy(): void {
        this.searchSub?.unsubscribe();
    }

    loadTasks(): void {
        this.loading = true;
        this.taskService.getTasks(
            this.selectedStatus || undefined,
            this.searchQuery || undefined
        ).subscribe({
            next: (tasks) => {
                this.tasks = tasks;
                this.splitTasks();
                this.loading = false;
            },
            error: () => {
                this.errorMessage = 'Failed to load tasks.';
                this.loading = false;
            },
        });
    }

    private splitTasks(): void {
        this.todoTasks = this.tasks.filter(t => t.status === 'TODO');
        this.inProgressTasks = this.tasks.filter(t => t.status === 'IN_PROGRESS');
        this.doneTasks = this.tasks.filter(t => t.status === 'DONE');
    }

    onSearch(): void { this.searchSubject.next(this.searchQuery); }
    onFilter(): void { this.loadTasks(); }

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
            next: () => this.loadTasks(),
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
        this.router.navigate(['/login']);
    }

    getPriorityClass(priority: string): string {
        return { LOW: 'priority-low', MEDIUM: 'priority-medium', HIGH: 'priority-high' }[priority] || '';
    }
}
