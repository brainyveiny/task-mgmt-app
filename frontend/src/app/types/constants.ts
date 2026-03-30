/**
 * @file constants.ts
 * @description Application-wide static configuration and infrastructure constants
 */
import { environment } from '../../environments/environment';
/**
 * @summary Global application configuration
 * Houses backend foundation URL and API endpoint base paths sourced from environment files
 */

// #region APP_CONFIG
export const APP_CONFIG = {
    apiUrl: environment.apiUrl
};
// #endregion
