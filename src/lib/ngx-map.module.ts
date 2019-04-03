import { NgModule, ModuleWithProviders } from '@angular/core';
import { NgxMapDirective } from './ngx-map.directive';
import { NGX_MAP_KEY } from './ngx-map.config';

@NgModule({
  imports: [
  ],
  declarations: [NgxMapDirective],
  exports: [NgxMapDirective]
})
export class NgxMapModule {
  static forRoot(apiKey?:string): ModuleWithProviders {
    return {
      ngModule: NgxMapModule,
      providers: [
        {provide: NGX_MAP_KEY, useValue: apiKey}
      ],
    };
  }
 }
