# Family Tree Backend Architecture

## Technologies used

- [NestJS](https://nestjs.com/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Zod](https://zod.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL](https://www.postgresql.org/)
- [Google Auth](https://developers.google.com/identity/protocols/oauth2)
- [JWT](https://jwt.io/)

## Database structure

```mermaid
erDiagram
    users {
        uuid id PK
        text email "unique"
        text username
        text name
        text image "url to bucket"
        user_gender gender "male female unknown"
        text description "who he/she is"
        date dob "date of birth"
        date dod "date of death"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    members {
        uuid id PK
        uuid family_tree_id FK
        text name
        text image "url to bucket"
        member_gender gender "male female unknown"
        text description "who he/she is/was"
        date dob "date of birth"
        date dod "date of death"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    family_trees {
        uuid id PK
        text name
        uuid created_by FK
        text image "url to bucket"
        boolean public "not mvp"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    family_tree_members {
        uuid id PK
        uuid family_tree_id FK
        uuid user_id FK "not mvp"
        uuid member_id FK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    family_tree_members_connection {
        uuid id PK
        uuid family_tree_id FK
        uuid from_user_id FK
        uuid to_user_id FK
        family_tree_connection connection_type "parent(vertical) or spouse(horizontal)"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    fcm_tokens {
        uuid id PK
        text token
        uuid user_id FK
        fcm_token_device_type device_type "Android, Mac, Linux, Windows"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    notifications {
        uuid id PK
        text content
        uuid receiver_user_id FK
        uuid sender_user_id FK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    notification_reads {
        uuid user_id FK,PK
        timestamp updated_at
    }

    users ||--o{ family_trees : "owner"
    users ||--o{ family_tree_members : "users in family tree"
    users ||--o{ family_tree_members_connections : "connects_from"
    users ||--o{ family_tree_members_connections : "connects_to"
    users ||--o{ fcm_tokens : "has"
    users ||--o{ notifications : "sends"
    users ||--o{ notifications : "receives"
    users ||--o{ notification_reads : "marks_read"
    
    family_trees ||--o{ members : "contains"
    family_trees ||--o{ family_tree_members : "has_members"
    family_trees ||--o{ family_tree_members_connections : "has_connections"
    
    members ||--o{ family_tree_members : "represented_in"
    
    family_tree_members }o--|| members : "references_members"
    family_tree_members }o--|| users : "references_user"
    family_tree_members }o--|| family_trees : "belongs_to"
    
    family_tree_members_connections }o--|| family_trees : "belongs_to"
    family_tree_members_connections }o--|| users : "from_user"
    family_tree_members_connections }o--|| users : "to_user"
    
    fcm_tokens }o--|| users : "belongs_to"
    
    notifications }o--|| users : "sender"
    notifications }o--|| users : "receiver"
    
    notification_reads }o--|| users : "user"
```

## APIs

- ### **Auth**

  - **GET** `/auth/google` => Redirect to Google Auth
  - **GET** `/auth/google/callback` => Callback from Google Auth
  - **GET** `/auth/logout` => Logout from current session

- ### **Users**

  - **GET** `/users/me` => Get current user
  - **GET** `/users/{id}` => Get user by id
  - **PUT** `/users` => Update current user
  - **PATCH** `/users/avatar` => Update user avatar to random one

- ### **Family Trees**

  - **GET** `/family-trees` => Get all family trees of current user
  - **GET** `/family-trees/publics/{name}` => Get all public family trees by name (not mvp)
  - **GET** `/family-trees/{id}` => Get members and members connections of family tree
  - **POST** `/family-trees` => Create family tree
  - **PUT** `/family-trees/{id}` => Update family tree by id
  - **DELETE** `/family-trees/{id}` => Delete family tree by id

- ### **Family Tree Members**

  - **GET** `/family-trees/{familyTreeId}/members` => Get members of family tree
  - **GET** `/family-trees/{familyTreeId}/members/{id}` => Get member info by id
  - **POST** `/family-trees/{familyTreeId}/members` => Add member to family tree
  - **PUT** `/family-trees/{familyTreeId}/members/{id}` => Update member by id
  - **DELETE** `/family-trees/{familyTreeId}/members/{id}` => Delete member from family tree

- ### **Family Tree Members Connections**

  - **GET** `/family-trees/{familyTreeId}/members/connections` => Get connections of family tree
  - **GET** `/family-trees/{familyTreeId}/members/{memberUserId}/connections` => Get connections of member
  - **POST** `/family-trees/{familyTreeId}/members/connections` => Add connection to member
  - **PUT** `/family-trees/{familyTreeId}/members/connections/{id}` => Update connection by id
  - **DELETE** `/family-trees/{familyTreeId}/members/connections/{id}` => Delete connection from member

- ### **FCM Tokens**

  - **POST** `/fcm-tokens` => Create fcm token
  - **DELETE** `/fcm-tokens` => Delete fcm token

- ### **Notifications**

  - **GET** `/notifications` => Get notifications of current user
  - **GET** `/notifications/read` => Mark notifications as read

- ### **Files**

  - **POST** `/files/{folder}` => Upload file, either avatar or tree