#!/bin/bash

# Azure App Serviceへのデプロイスクリプト
# 使用方法: ./deploy-azure.sh

set -e

# 変数設定（必要に応じて変更してください）
RESOURCE_GROUP="attendance-rg"
LOCATION="japaneast"
APP_SERVICE_PLAN="attendance-plan"
BACKEND_APP_NAME="attendance-backend-app"
FRONTEND_APP_NAME="attendance-frontend-app"
MYSQL_SERVER_NAME="attendance-mysql-server"
MYSQL_DB_NAME="attendance_db"
MYSQL_ADMIN_USER="attendanceadmin"
MYSQL_ADMIN_PASSWORD="YourStrongPassword123!"

echo "==================================="
echo "Azure App Service デプロイスクリプト"
echo "==================================="

# リソースグループの作成
echo "リソースグループを作成中..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# App Serviceプランの作成
echo "App Serviceプランを作成中..."
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# Azure Database for MySQLの作成
echo "Azure Database for MySQLを作成中..."
az mysql flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $MYSQL_SERVER_NAME \
  --location $LOCATION \
  --admin-user $MYSQL_ADMIN_USER \
  --admin-password $MYSQL_ADMIN_PASSWORD \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 8.0.21 \
  --storage-size 32

# データベース作成
echo "データベースを作成中..."
az mysql flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $MYSQL_SERVER_NAME \
  --database-name $MYSQL_DB_NAME

# ファイアウォールルールの追加（Azure内部からのアクセスを許可）
echo "ファイアウォールルールを設定中..."
az mysql flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name $MYSQL_SERVER_NAME \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# バックエンドApp Serviceの作成
echo "バックエンドApp Serviceを作成中..."
az webapp create \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --runtime "JAVA:17-java17"

# バックエンドのアプリケーション設定
echo "バックエンドの設定を追加中..."
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP_NAME \
  --settings \
    MYSQL_URL="jdbc:mysql://${MYSQL_SERVER_NAME}.mysql.database.azure.com:3306/${MYSQL_DB_NAME}?useSSL=true&requireSSL=true&serverTimezone=Asia/Tokyo" \
    MYSQL_USER="${MYSQL_ADMIN_USER}" \
    MYSQL_PASSWORD="${MYSQL_ADMIN_PASSWORD}" \
    GOOGLE_CREDENTIALS_PATH="/home/site/wwwroot/credentials.json" \
    CORS_ALLOWED_ORIGINS="https://${FRONTEND_APP_NAME}.azurewebsites.net"

# バックエンドのビルドとデプロイ
echo "バックエンドをビルド中..."
cd backend
mvn clean package -DskipTests
echo "バックエンドをデプロイ中..."
az webapp deploy \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP_NAME \
  --src-path target/attendance-backend-1.0.0.jar \
  --type jar
cd ..

# フロントエンドApp Serviceの作成
echo "フロントエンドApp Serviceを作成中..."
az webapp create \
  --name $FRONTEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --runtime "NODE:18-lts"

# フロントエンドのビルド
echo "フロントエンドをビルド中..."
cd frontend
npm install
npm run build:prod

# フロントエンドのデプロイ
echo "フロントエンドをデプロイ中..."
cd dist/attendance-frontend
zip -r ../../deploy.zip .
cd ../..
az webapp deploy \
  --resource-group $RESOURCE_GROUP \
  --name $FRONTEND_APP_NAME \
  --src-path deploy.zip \
  --type zip
cd ..

echo ""
echo "==================================="
echo "デプロイ完了！"
echo "==================================="
echo ""
echo "バックエンドURL: https://${BACKEND_APP_NAME}.azurewebsites.net"
echo "フロントエンドURL: https://${FRONTEND_APP_NAME}.azurewebsites.net"
echo ""
echo "次のステップ:"
echo "1. Google Calendar APIの認証情報をバックエンドにアップロード"
echo "2. Azure ポータルでEasy Authを設定"
echo "3. データベースの初期化SQLを実行"
echo ""
