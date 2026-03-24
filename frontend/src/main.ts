/**
 * @file main.ts
 * @description Application entry point for the Angular platform
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
/**
 * @summary Application bootstrap procedure
 * Initializes the root App component with the centralized provider configuration
 */
// #region bootstrap
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
// #endregion
