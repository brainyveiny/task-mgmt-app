/**
 * @summary UI component for displaying transient global alert messages
 * Subscribes to AlertService to show/hide toast notifications
 */
//#region Imports
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from './alert.service';
//#endregion

// Global alert box: displayed at center-top, disappears after 3 seconds
@Component({
    selector: 'app-alert',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="global-alert" *ngIf="message">{{ message }}</div>
    `,
    styles: [`
        .global-alert {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: #fff;
            padding: 10px 24px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
    `]
})
export class AlertComponent implements OnInit {
    //#region Properties
    message = '';
    //#endregion

    //#region Methods
    constructor(
        private alertService: AlertService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.alertService.message$.subscribe(msg => {
            this.message = msg;
            this.cdr.markForCheck();
        });
    }
    //#endregion
}
