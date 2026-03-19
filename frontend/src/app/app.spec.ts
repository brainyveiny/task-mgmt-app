// Testing for Root App component
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterOutlet } from '@angular/router';
import { By } from '@angular/platform-browser';
import { App } from './app';

describe('App', () => {
    let component: App;
    let fixture: ComponentFixture<App>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [App],
        }).compileComponents();

        fixture = TestBed.createComponent(App);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('should have app-root as its selector', () => {
        const element = fixture.nativeElement as HTMLElement;
        expect(element.tagName.toLowerCase()).toBe('app-root');
    });

    it('should contain a router-outlet', () => {
        const routerOutlet = fixture.debugElement.query(By.directive(RouterOutlet));
        expect(routerOutlet).toBeTruthy();
    });
});
