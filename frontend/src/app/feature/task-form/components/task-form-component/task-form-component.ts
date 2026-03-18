// Task form component: used for both creating and editing a task
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../service/task-service';
import { AlertService } from '../../../../shared/alert.service';

@Component({
    selector: 'app-task-form-component',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './task-form-component.html',
})
export class TaskFormComponent implements OnInit {
    taskForm: FormGroup;
    isEditMode = false;
    taskId?: number;
    errorMessage = '';
    successMessage = '';
    loading = false;
    minDate: string = new Date().toISOString().split('T')[0]; // today's date for due_date min

    constructor(
        private fb: FormBuilder,
        private taskService: TaskService,
        private alertService: AlertService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.taskForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
            description: ['', [Validators.maxLength(1000)]],
            status: ['TODO'],
            priority: ['MEDIUM'],
            due_date: [''],
        });
    }

    ngOnInit(): void {
        // If an id param is in the URL, we are in edit mode — load the task
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.taskId = +id;
            this.taskService.getTaskById(this.taskId).subscribe({
                next: (task) => {
                    this.taskForm.patchValue({
                        ...task,
                        due_date: task.due_date ? task.due_date.split('T')[0] : '',
                    });
                },
                error: () => {
                    this.errorMessage = 'Failed to load task.';
                },
            });
        }
    }

    get title() { return this.taskForm.get('title')!; }

    onSubmit(): void {
        if (this.taskForm.invalid) return;

        const title = this.taskForm.value.title?.trim();
        if (!title || title.length < 3) {
            this.errorMessage = 'Title must be at least 3 characters.';
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        const formValue = { ...this.taskForm.value, title };

        // Remove due_date if empty so the backend ignores it
        if (!formValue.due_date) delete formValue.due_date;

        // Use create or update depending on the mode
        const request$ = this.isEditMode && this.taskId
            ? this.taskService.updateTask(this.taskId, formValue)
            : this.taskService.createTask(formValue);

        request$.subscribe({
            next: () => {
                this.alertService.show(this.isEditMode ? 'Task updated successfully' : 'Task created successfully');
                this.loading = false;
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.errorMessage = err.error?.detail || 'Operation failed.';
                this.loading = false;
            },
        });
    }

    cancel(): void {
        this.taskForm.reset({ status: 'TODO', priority: 'MEDIUM' });
        this.errorMessage = '';
        this.successMessage = '';
    }
}
