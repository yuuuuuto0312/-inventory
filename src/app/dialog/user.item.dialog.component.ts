import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-item-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './user.item.dialog.component.html',
  styleUrls: ['./user.item.dialog.component.css']
})
export class UserItemDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UserItemDialogComponent>
  ) {}

  useItem(): void {
    if (this.data.quantity > 0) {
      this.data.quantity--;
    }
    this.dialogRef.close(this.data); // 使用後のデータを返す
  }
}