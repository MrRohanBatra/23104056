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
```



## STAGE 2

**use PostgreSQL**
* **REASON** notifications have a fixed structure.SQL provides powerful indexing.we use nosql databases when we dont know the structure but here the structure is known so POSTGRESQL is preferred


```
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    student_id INT NOT NULL,
    notification_type VARCHAR(20),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
* **SCALING CHALENGE** query might slow down for lot of users 


## STAGE 3

* **query** ```select * from notifications where student_id=1000 and is_read=false order by created_at DESC;``` can slow down the result 

* **solution** we can create an index to reduce the computation cost from O(N)

