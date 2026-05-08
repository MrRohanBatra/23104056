# Notifiction microservice
## Stage 1
### Actions

* **fetch notifications** receive latest unread notifications
* **update read status** update the read satus of notifications
* **push notifications** send the a push notification

### API Endpoints

* **GET** /notifications  fetch notifications
* **PATCH** /notifications/:id update notification status


**REQUEST EXAMPLE**
```json
{
  "notifications": [
    {
      "id": "uuid-v4",
      "type": "Placement",
      "title": "Microsoft Recruitment",
      "message": "Applications are now open.",
      "isRead": false,
      "timestamp": "2026-05-08T10:00:00Z"
    }
  ]
}

