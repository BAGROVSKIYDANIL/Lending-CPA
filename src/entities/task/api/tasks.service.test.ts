import { TestBed } from '@angular/core/testing';
import { ApiClient } from '@shared/api';
import { of } from 'rxjs';
import { TasksService } from '@entities/task';

describe('TasksService', () => {
  it('requests localized tasks and rejects an invalid response', () => {
    const get = jasmine.createSpy().and.returnValue(of(null));
    TestBed.configureTestingModule({ providers: [{ provide: ApiClient, useValue: { get } }] });
    let failed = false;
    TestBed.inject(TasksService).getTasks('en').subscribe({ error: () => { failed = true; } });
    expect(get).toHaveBeenCalledWith('tasks', { locale: 'en' });
    expect(failed).toBeTrue();
  });
});
