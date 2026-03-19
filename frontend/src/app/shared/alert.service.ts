// Global service to trigger and manage transient alert notifications
//#region Imports
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
//#endregion
 
//#region Service
@Injectable({ providedIn: 'root' })
export class AlertService {
    message$ = new BehaviorSubject<string>('');

    constructor(private zone: NgZone) { }
 
    /**
     * Shows a message for 3 seconds
     * @param message - The string to display
     */
    show(message: string): void {
        this.zone.run(() => {
            this.message$.next(message);
            setTimeout(() => this.message$.next(''), 3000);
        });
    }
}
//#endregion
