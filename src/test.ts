// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
// PrimeNG base component imports to allow global monkey-patching in tests
// Newer PrimeNG versions load theme styles via @primeuix/styled during ngOnInit of components
// which is unnecessary and brittle in unit tests. We no-op those loaders here.
// These imports are safe in test context; if the path changes, the try/catch below will guard.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - types may not be available for this deep import in test build
import * as PrimeBase from 'primeng/basecomponent';

// Global polyfills/stubs for browser APIs used by PrimeNG widgets in tests
(() => {
    const w = window as any;
    // Stub ResizeObserver if missing or partial
    if (typeof w.ResizeObserver === 'undefined') {
        w.ResizeObserver = class {
            observe() { /* noop */ }
            unobserve() { /* noop */ }
            disconnect() { /* noop */ }
        };
    } else {
        // Ensure methods exist to avoid teardown crashes
        try {
            const ro = w.ResizeObserver.prototype as any;
            ro.observe = ro.observe || function () { /* noop */ };
            ro.unobserve = ro.unobserve || function () { /* noop */ };
            ro.disconnect = ro.disconnect || function () { /* noop */ };
        } catch { /* ignore */ }
    }

    // Monkey-patch PrimeNG BaseComponent theme/style loaders to no-op in tests
    try {
        const BaseComponent = (PrimeBase as any).BaseComponent;
        if (BaseComponent && BaseComponent.prototype) {
            const proto = BaseComponent.prototype as any;
            proto._loadThemeStyles = function () { /* noop in tests */ };
            proto._loadStyles = function () { /* noop in tests */ };
        }
    } catch {
        // If import shape changes, ignore; specs that use NO_ERRORS_SCHEMA will still pass
    }
})();

declare const require: {
    context(path: string, deep?: boolean, filter?: RegExp): {
        keys(): string[];
        <T>(id: string): T;
    };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
);
// Angular CLI (Karma builder) will discover tests based on tsconfig.spec.json include.
