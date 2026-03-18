import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Simple alert service: shows a toast message globally for 3 seconds
@Injectable({ providedIn: 'root' })
export class AlertService {
    message$ = new BehaviorSubject<string>('');

    constructor(private zone: NgZone) { }

    show(message: string): void {
        this.zone.run(() => {
            this.message$.next(message);
            setTimeout(() => this.message$.next(''), 3000);
        });
    }
}
