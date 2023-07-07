import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: '/products'},
  {path: 'products',
        loadChildren: () => import('./pages/fetch-bulk-products/fetch-bulk-products.module').then(m => m.FetchBulkProductsModule)
      }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
