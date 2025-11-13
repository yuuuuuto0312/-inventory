# 勤怠管理Webアプリケーション

Azure App Serviceにデプロイ可能な勤怠管理システムです。

## 機能

- ✅ 出勤・退勤の記録
- ✅ Googleカレンダーへの自動連携
- ✅ 管理者による勤怠データのExcel出力
- ✅ 日単位での勤怠記録管理
- ✅ Easy Auth による認証

## 技術スタック

### バックエンド
- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- Azure Database for MySQL
- Google Calendar API
- Apache POI (Excel出力)

### フロントエンド
- Angular 17
- TypeScript
- RxJS

## プロジェクト構成

```
attendance-app/
├── backend/           # Spring Boot バックエンド
│   ├── src/
│   │   └── main/
│   │       ├── java/com/attendance/
│   │       │   ├── config/          # CORS設定など
│   │       │   ├── controller/      # REST APIコントローラー
│   │       │   ├── model/           # エンティティクラス
│   │       │   ├── repository/      # データアクセス層
│   │       │   ├── service/         # ビジネスロジック
│   │       │   └── dto/             # データ転送オブジェクト
│   │       └── resources/
│   │           └── application.yml  # アプリケーション設定
│   └── pom.xml
├── frontend/          # Angular フロントエンド
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/         # UIコンポーネント
│   │   │   ├── services/           # APIサービス
│   │   │   ├── models/             # データモデル
│   │   │   └── app.module.ts
│   │   └── environments/           # 環境設定
│   ├── angular.json
│   └── package.json
└── database/          # データベーススキーマ
    └── init.sql
```

## データベーススキーマ

### users テーブル
| カラム名 | 型 | 説明 |
|---------|-----|------|
| user_id | BIGINT | 主キー（自動採番） |
| username | VARCHAR(100) | ユーザー名 |
| email | VARCHAR(200) | メールアドレス |
| role | VARCHAR(20) | ロール（USER/ADMIN） |

### attendance_records テーブル
| カラム名 | 型 | 説明 |
|---------|-----|------|
| record_id | BIGINT | 主キー（自動採番） |
| user_id | BIGINT | ユーザーID（外部キー） |
| check_in_time | DATETIME | 出勤時刻 |
| check_out_time | DATETIME | 退勤時刻 |
| record_date | DATETIME | 記録日時 |
| google_calendar_event_id | VARCHAR(500) | Googleカレンダーイベントキー |

## セットアップ手順

### 1. 必要な環境

- Java 17以上
- Node.js 18以上
- Maven 3.8以上
- Azure CLI
- Azure Database for MySQL

### 2. Google Calendar API設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. Google Calendar APIを有効化
3. OAuth 2.0認証情報を作成
4. `credentials.json` をダウンロードして `backend/src/main/resources/` に配置

### 3. データベースのセットアップ

Azure Database for MySQLを作成し、`database/init.sql` を実行してテーブルを作成します。

```bash
mysql -h <your-mysql-host> -u <username> -p < database/init.sql
```

### 4. バックエンドの設定

`backend/src/main/resources/application.yml` を編集:

```yaml
spring:
  datasource:
    url: jdbc:mysql://<your-mysql-host>:3306/attendance_db?useSSL=true
    username: <your-username>
    password: <your-password>
```

### 5. ローカル開発

#### バックエンド起動
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### フロントエンド起動
```bash
cd frontend
npm install
npm start
```

アプリケーションは http://localhost:4200 で起動します。

## Azure App Serviceへのデプロイ

### バックエンドのデプロイ

1. App Serviceを作成（Java 17、Linux）

```bash
az group create --name attendance-rg --location japaneast

az appservice plan create --name attendance-plan --resource-group attendance-rg --sku B1 --is-linux

az webapp create --name attendance-backend-app --resource-group attendance-rg --plan attendance-plan --runtime "JAVA:17-java17"
```

2. アプリケーション設定を追加

```bash
az webapp config appsettings set --resource-group attendance-rg --name attendance-backend-app --settings \
  MYSQL_URL="jdbc:mysql://<your-mysql-host>:3306/attendance_db?useSSL=true" \
  MYSQL_USER="<your-username>" \
  MYSQL_PASSWORD="<your-password>" \
  GOOGLE_CREDENTIALS_PATH="/home/site/wwwroot/credentials.json" \
  CORS_ALLOWED_ORIGINS="https://<frontend-app-name>.azurewebsites.net"
```

3. デプロイ

```bash
cd backend
mvn clean package
az webapp deploy --resource-group attendance-rg --name attendance-backend-app --src-path target/attendance-backend-1.0.0.jar --type jar
```

### フロントエンドのデプロイ

1. App Serviceを作成（Node.js）

```bash
az webapp create --name attendance-frontend-app --resource-group attendance-rg --plan attendance-plan --runtime "NODE:18-lts"
```

2. 環境変数を設定

`frontend/src/environments/environment.prod.ts` を編集:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://attendance-backend-app.azurewebsites.net'
};
```

3. ビルドしてデプロイ

```bash
cd frontend
npm run build:prod
cd dist/attendance-frontend
zip -r deploy.zip .
az webapp deploy --resource-group attendance-rg --name attendance-frontend-app --src-path deploy.zip --type zip
```

### Easy Authの設定

Azure ポータルで各App Serviceの「認証」から、Microsoft/Google/その他のプロバイダーを設定してください。

## API エンドポイント

### 勤怠記録
- `POST /api/attendance/record` - 出勤・退勤を記録
- `GET /api/attendance/user/{userId}` - ユーザーの勤怠記録を取得
- `GET /api/attendance/today/{userId}` - 今日の勤怠状況を取得
- `GET /api/attendance/range?startDate=&endDate=` - 期間指定で取得
- `GET /api/attendance/export?startDate=&endDate=` - Excel出力

### ユーザー管理
- `GET /api/users` - 全ユーザーを取得
- `GET /api/users/{userId}` - ユーザーIDで取得
- `POST /api/users` - ユーザーを作成

## セキュリティ

- Easy Authによる認証
- CORS設定
- MySQLへのSSL接続
- 環境変数による機密情報の管理

## トラブルシューティング

### Googleカレンダー連携が失敗する
- `credentials.json` が正しく配置されているか確認
- Google Cloud ConsoleでAPIが有効化されているか確認
- OAuth 2.0の承認済みリダイレクトURIが正しいか確認

### データベース接続エラー
- Azure Database for MySQLのファイアウォールルールを確認
- SSL接続が有効になっているか確認
- 接続文字列が正しいか確認

### CORS エラー
- バックエンドの`CORS_ALLOWED_ORIGINS`設定を確認
- フロントエンドのURLが正しく設定されているか確認

## ライセンス

MIT License

## サポート

問題が発生した場合は、GitHubのIssuesでご報告ください。
