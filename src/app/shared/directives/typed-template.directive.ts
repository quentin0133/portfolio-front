import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[typedTemplate]',
})
export class TypedTemplateDirective<TContext extends Record<string, any>> {
  @Input({ alias: 'typedTemplate' }) context!: TContext;

  constructor(public template: TemplateRef<TContext>) {}

  static ngTemplateContextGuard<TContext extends Record<string, any>>(
    dir: TypedTemplateDirective<TContext>,
    ctx: unknown,
  ): ctx is TContext {
    return true;
  }
}
