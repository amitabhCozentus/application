import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PrimengModule } from '../../app/shared/primeng/primeng.module';


@NgModule({
  declarations: [
  ],
  imports: [
    PrimengModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
  ],
  exports: [PrimengModule]
})
export class AppCommonModule { }
