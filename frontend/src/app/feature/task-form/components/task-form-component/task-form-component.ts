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
    /**
     * Initializes the reactive form with rigorous validation constraints
     */
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
    /**
     * Detects operation mode (Insert vs Update) and pre-populates data if editing
     */
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
                error: () => {
                    alert('Something went wrong');
                },
            });
        }
    }
    // #endregion
    /**
     * Getter for the title form control
     * Utilized for template validation and state tracking
     */
    // #region title
    public get title() {
        return this.taskForm.get('title')!;
    }
    // #endregion
    /**
     * Submits task data to either the creation or update endpoint based on current mode
     */
    // #region onSubmit
    public onSubmit(): void {
        if (this.taskForm.invalid) {
            return;
        }
        const title = this.taskForm.value.title?.trim();
        if (!title || title.length < 3) {
            alert('Title must be at least 3 characters.');
            return;
        }
        this.loading = true;
        const formValue = { ...this.taskForm.value, title };
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
            error: () => {
                alert('Something went wrong');
                this.loading = false;
            },
        });
    }
    // #endregion
    /**
     * Reverts form state to default values for new task creation
     */
    // #region cancel
    public cancel(): void {
        this.taskForm.reset({ status: 'TODO', priority: 'MEDIUM' });
    }
    // #endregion
}
