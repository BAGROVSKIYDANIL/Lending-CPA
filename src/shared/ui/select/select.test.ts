import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Select } from './select';

describe('Select', () => {
  let fixture: ComponentFixture<Select>;
  let component: Select;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Select] }).compileComponents();
    fixture = TestBed.createComponent(Select);
    fixture.componentRef.setInput('controlId', 'test-select');
    fixture.componentRef.setInput('options', ['Apple', 'Banana', 'Cherry']);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('navigates and selects with the keyboard', () => {
    const changed = jasmine.createSpy();
    component.valueChange.subscribe(changed);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    component.onKeydown(new KeyboardEvent('keydown', { key: 'End' }));
    expect(component.activeIndex()).toBe(2);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(changed).toHaveBeenCalledOnceWith('Cherry');
    expect(component.expanded()).toBeFalse();
  });
  it('searches and closes on escape', () => {
    component.onKeydown(new KeyboardEvent('keydown', { key: 'b' }));
    expect(component.activeIndex()).toBe(1);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.expanded()).toBeFalse();
  });
  it('does not open or select while disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const changed = jasmine.createSpy();
    component.valueChange.subscribe(changed);
    component.toggle();
    component.choose(0);
    expect(component.expanded()).toBeFalse();
    expect(changed).not.toHaveBeenCalled();
  });
});
