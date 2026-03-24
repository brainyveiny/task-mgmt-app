/**
 * @file app.spec.ts
 * @description Unit tests for the root App component and its core routing infrastructure
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterOutlet } from '@angular/router';
import { By } from '@angular/platform-browser';
import { App } from './app';
/**
 * @summary Root component test suite
 * Verifies component instantiation, selector validity, and router outlet presence
 */
// #region describe
describe('App', () => {
    let component: App;
    let fixture: ComponentFixture<App>;
    /**
     * @summary Test environment initialization
     * Configures the Angular testing module and compiles the root component
     */
    // #region beforeEach
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [App],
        }).compileComponents();
        fixture = TestBed.createComponent(App);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    // #endregion
    /**
     * @summary Instance verification
     * Confirms the component launches successfully
     */
    // #region create-test
    it('should create the app', () => {
        expect(component).toBeTruthy();
    });
    // #endregion
    /**
     * @summary Selector verification
     * Confirms the component uses the correct element tag
     */
    // #region selector-test
    it('should have app-root as its selector', () => {
        const element = fixture.nativeElement as HTMLElement;
        expect(element.tagName.toLowerCase()).toBe('app-root');
    });
    // #endregion
    /**
     * @summary Template verification
     * Confirms the presence of a router outlet for navigation content
     */
    // #region outlet-test
    it('should contain a router-outlet', () => {
        const routerOutlet = fixture.debugElement.query(By.directive(RouterOutlet));
        expect(routerOutlet).toBeTruthy();
    });
    // #endregion
});
// #endregion
