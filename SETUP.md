# FCM Mobile Notification Manager

## 1. Cai package

```bash
pnpm install
```

## 2. Tao Firebase project

1. Vao Firebase Console va tao project.
2. Them Web App de lay Firebase config.
3. Vao Project settings -> Cloud Messaging de lay Web Push certificates / VAPID key.
4. Vao Project settings -> Service accounts -> Generate new private key de lay Firebase Admin key.

## 3. Cau hinh `.env.local`

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
```

`FIREBASE_CLIENT_EMAIL` va `FIREBASE_PRIVATE_KEY` phai copy tu file JSON tai ve o Firebase Console -> Project settings -> Service accounts -> Generate new private key.
Khong dung email dang nhap Firebase cho `FIREBASE_CLIENT_EMAIL` va khong de `...` trong `FIREBASE_PRIVATE_KEY`.

## 4. Cau hinh Service Worker

Mo `public/firebase-messaging-sw.js` va thay cac gia tri `YOUR_FIREBASE_*` bang Firebase Web App config that.

Quan trong: file service worker khong doc duoc `NEXT_PUBLIC_*` cua Next.js, nen config trong file nay phai hard-code.

## 5. Chay local

```bash
pnpm dev
```

Mo:

- `/register`: trang public cho mobile dang ky nhan tin.
- `/dashboard`: tong quan admin.
- `/devices`: quan ly mobile, toggle active, xoa, gui rieng.
- `/send`: gui broadcast cho toan bo mobile active.

## 6. Du lieu Excel

Ung dung dung file `data.xlsx` o root project. Khi API chay lan dau, file se duoc tao/cap nhat voi 2 sheet:

- `Devices`: danh sach mobile/token.
- `NotificationLogs`: lich su gui tin.

Khong can `DATABASE_URL` va khong can database server.
