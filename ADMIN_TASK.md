# Admin Task Runbook

This document lists operational tasks an admin may perform for the backend.

## 1. Prerequisites

- Backend service is running and reachable.
- Admin is authenticated with Firebase and has a valid Firebase ID token.
- Admin is authorized by either:
  - Firebase custom claim `role=ADMIN`, or
  - admin email listed in `ADMIN_EMAILS` environment variable.

Relevant backend endpoint:
- `POST /user/notifications/create` (guarded by `FirebaseAuthGuard`)

## 2. Common Environment Variables

- `API_BASE_URL`:
  - Local: `http://localhost:3001`
  - Production: your deployed backend URL
- `ADMIN_TOKEN`: Firebase ID token of admin user

Example:

```bash
export API_BASE_URL="http://localhost:3001"
export ADMIN_TOKEN="<firebase_id_token>"
```

## 3. Notification Creation (Admin)

Endpoint:

```text
POST /user/notifications/create
```

Headers:

```text
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

Payload fields:
- `title` (required, string)
- `details` (required, string)
- `iconId` (optional, number)
- `broadcast` (optional, boolean)
- `userIds` (optional, number[])

Behavior:
- If `broadcast=true`: notification is created for all users.
- If `broadcast` is not true: backend uses `userIds` for target users.
- If no users are resolved, backend returns `No target users found`.

### 3.1 Broadcast Notification

```bash
curl -X POST "$API_BASE_URL/user/notifications/create" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Maintenance Window",
    "details": "Services may be briefly unavailable at 02:00 UTC.",
    "iconId": 1,
    "broadcast": true
  }'
```

### 3.2 Targeted Notification

```bash
curl -X POST "$API_BASE_URL/user/notifications/create" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Plan Update",
    "details": "Your account has been updated successfully.",
    "iconId": 2,
    "userIds": [12, 35, 41]
  }'
```

### 3.3 Expected Success Response

```json
{
  "status": "success",
  "data": {
    "message": "Notification created successfully",
    "notification": {
      "id": 101,
      "title": "Maintenance Window",
      "details": "Services may be briefly unavailable at 02:00 UTC.",
      "iconId": 1
    },
    "recipients": 58
  }
}
```

## 4. Verify Notification Delivery

Use any recipient token to call:

```bash
curl "$API_BASE_URL/user/notifications?recentMax=20" \
  -H "Authorization: Bearer <RECIPIENT_TOKEN>"
```

Expected:
- Notification appears in `data.notifications`
- `read` should be `false` initially

## 5. Mark Notification as Read (User Action)

```bash
curl -X POST "$API_BASE_URL/user/notifications/read" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"notificationId": 101}'
```

## 6. Admin Troubleshooting

- `403 Only admin can create notifications`:
  - Admin token user is not authorized.
  - Check Firebase custom claim `role=ADMIN` or `ADMIN_EMAILS`.
- `400 title and details are required`:
  - Missing/blank title or details.
- `400 No target users found`:
  - `broadcast` is false and `userIds` are empty/invalid/non-existent.
- `401 No token provided / Invalid or expired token`:
  - Refresh `ADMIN_TOKEN`.

## 7. Optional: Subscription Admin Actions

These endpoints exist and are guarded:

- `POST /user/upgrade`
  - Payload: `{ "term": "d7" | "d30" | "d365" }`
- `POST /user/subscription/sync`
  - Payload: `{ "status": "PRO" | "UNSUBSCRIBED", "subscriptionExpiration": "ISO-STRING-or-null" }`
- `POST /user/unsubscribe`
  - No payload required

Use them only with proper admin process and audit trail.
