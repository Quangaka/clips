import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from 'src/app/services/modal.service';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { ModalComponent } from './components/modal/modal.component';
import { TabComponent } from './components/tab/tab.component';
import { TabContainerComponent } from './components/tab-container/tab-container.component';
import { InputComponent } from './components/input/input.component';
import { AlertComponent } from './components/alert/alert.component';
import { EventBlockerDirective } from './directives/event-blocker.directive';


@NgModule({
  declarations: [
    ModalComponent,
    TabComponent,
    TabContainerComponent,
    InputComponent,
    AlertComponent,
    EventBlockerDirective
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot()
  ],
  exports: [
    ModalComponent,
    TabContainerComponent,
    TabComponent,
    InputComponent,
    AlertComponent,
    EventBlockerDirective
  ],
  providers: [
    ModalService
  ]
})
export class SharedModule { }
