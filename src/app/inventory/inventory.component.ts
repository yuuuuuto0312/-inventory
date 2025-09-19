import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.services';
import { InventoryService } from '../services/inventory.service'; // サービスのパスに注意
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ItemDialogComponent } from '../dialog/item.dialog.component';
import { UserItemDialogComponent } from '../dialog/user.item.dialog.component';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';


@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [CommonModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule


    ],
    providers: [InventoryService],

    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
    inventories: any[] = [];
    dataSource: any[] = [];
    displayedColumns: string[] = ['id', 'name', 'quantity'];
    userRole: string = ''; // ← ロール表示用


    constructor(
        private inventoryService: InventoryService,
        private authService: AuthService,
        private dialog: MatDialog,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
      if (isPlatformBrowser(this.platformId)) {
        this.userRole = this.authService.getRole();
        this.loadInventories();
      }
    }

    loadInventories() {
        this.inventoryService.getInventories().subscribe((data: any[]) => {
            this.inventories = data;
            this.dataSource = data;
        });
    }


    openAddDialog() {
  const dialogRef = this.dialog.open(ItemDialogComponent);

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      console.log('追加された商品:', result);
      // TODO: POST APIでDBに保存する処理を追加
    }
  });
}
openDialog(row: any) {
  const dialogRef = this.dialog.open(UserItemDialogComponent, {
    data: { ...row }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result && result.quantity > 0) {
      this.inventoryService.updateInventory(result.id).subscribe((updated) => {
        const index = this.dataSource.findIndex(item => item.id === updated.id);
        if (index !== -1) {
          this.dataSource[index].quantity = updated.quantity;
          this.dataSource = [...this.dataSource]; // Angularに変更を検知させる
        }
      });
    }
  });
}



    logout() {
        console.log('ログアウト処理');
        // 必要なら AuthService でログアウト処理を追加
    }
}