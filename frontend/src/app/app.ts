/**
 * @file app.ts
 * @description Root component for the task management application
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * @summary Main application component
 * Serves as the primary entry point for the component tree and manages the root router outlet
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})

export class App { }
