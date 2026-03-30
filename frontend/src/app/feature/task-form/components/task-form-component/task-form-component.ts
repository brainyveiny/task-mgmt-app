/**
 * @file task-form-component.ts
 * @description Integrated form for both creating new tasks and updating existing ones
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../service/task-service';

/**
 * @summary Task editor component
 * Manages form state, handles route parameterization for edit mode, and facilitates backend persistence
 */
@Component({
    selector: 'app-task-form-component',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './task-form-component.html',
})
export class TaskFormComponent implements OnInit {
    public taskForm: FormGroup;
    public isEditMode = false;
    public taskId?: number;
    public loading = false;
    public minDate: string = new Date().toISOString().split('T')[0];

    // #region constructor
    constructor(
        private formBuilder: FormBuilder,
        private taskService: TaskService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.taskForm = this.formBuilder.group({
            title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
            description: ['', [Validators.maxLength(1000)]],
            status: ['TODO'],
            priority: ['MEDIUM'],
            due_date: [''],
        });
    }
    // #endregion

    // #region ngOnInit
    public ngOnInit(): void {
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
                error: (error) => {
                    alert(error?.error?.detail || 'Something went wrong');
                },
            });
        }
    }
    // #endregion

    // #region title
    public get title() {
        return this.taskForm.get('title')!;
    }
    // #endregion

    // #region onSubmit
    public onSubmit(): void {
        if (this.taskForm.invalid) {
            return;
        }
        this.loading = true;
        const formValue = { ...this.taskForm.value, title: this.taskForm.value.title?.trim() };
        if (!formValue.due_date) {
            delete formValue.due_date;
        }
        const request$ = this.isEditMode && this.taskId
            ? this.taskService.updateTask(this.taskId, formValue)
            : this.taskService.createTask(formValue);
        request$.subscribe({
            next: () => {
                alert(this.isEditMode ? 'Task updated successfully' : 'Task created successfully');
                this.loading = false;
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                this.loading = false;
                alert(error?.error?.detail || 'Something went wrong');
            },
        });
    }
    // #endregion

    // #region cancel
    public cancel(): void {
        this.taskForm.reset({ status: 'TODO', priority: 'MEDIUM' });
    }
    // #endregion
}
