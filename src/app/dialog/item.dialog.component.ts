// ...existing code...
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-admin-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './item.dialog.component.html',
  styleUrls: ['./item.dialog.component.css']
})
export class ItemDialogComponent {
      mode: 'add' | 'view' = 'add'; // モード切り替え用
  name: string = '';
  quantity: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ItemDialogComponent>
  ) {
    // データが渡されている場合は「view」モードに切り替え
    if (data) {
      this.mode = 'view';
      this.name = data.name;
      this.quantity = data.quantity;
    }
  }

  useItem() {
    if (this.quantity > 0) {
      this.quantity--;
    }
    this.dialogRef.close({ ...this.data, quantity: this.quantity });
  }

  submitNewItem() {
    this.dialogRef.close({ name: this.name, quantity: this.quantity });
  }

  // 必要に応じてプロパティやメソッドをここに追加
}

