import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TasksService } from '@entities/task';
import { LanguageService } from '@shared/i18n';
import { FallbackPopupService } from '@shared/lib/fallback-popup';
import { CombinedPreloader } from '@shared/lib/preloader';
import { ViewportService } from '@shared/services/viewport.service';
import { Subject } from 'rxjs';
import { MultiTasks } from './multi-tasks';

describe('MultiTasks', () => {
  it('loads tasks and highlights the in-house team', async () => {
    const response = new Subject<{ description: string; tiles: { title: string; text: string }[] }>();
    const finish = jasmine.createSpy();
    await TestBed.configureTestingModule({ imports: [MultiTasks], providers: [
      { provide: TasksService, useValue: { getTasks: () => response } },
      { provide: LanguageService, useValue: { language: signal('en') } },
      { provide: ViewportService, useValue: { isMobile: signal(true) } },
      { provide: CombinedPreloader, useValue: { begin: () => finish } },
      { provide: FallbackPopupService, useValue: { showError: jasmine.createSpy() } },
    ] }).overrideComponent(MultiTasks, { set: { template: '' } }).compileComponents();
    const fixture = TestBed.createComponent(MultiTasks);
    fixture.detectChanges();
    response.next({ description: 'in-house team', tiles: [{ title: 'One', text: 'Text' }] });
    response.complete();
    expect(fixture.componentInstance.state()).toBe('ready');
    expect(fixture.componentInstance.descriptionPart()[0].highlighted).toBeTrue();
    expect(finish).toHaveBeenCalledTimes(1);
  });
});
