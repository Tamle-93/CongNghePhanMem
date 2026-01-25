# Database Schema - New Tables & Enhancements

## 📊 New Database Tables

### 1. `submission_versions` Table
```sql
CREATE TABLE submission_versions (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    paper_id INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    title VARCHAR(500),
    abstract TEXT,
    keywords VARCHAR(500),
    change_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX (paper_id),
    INDEX (version),
    INDEX (created_at)
);
```

**Purpose**: Track all versions of submitted papers
**Use Case**: Authors update papers, each update creates new version entry
**Audit Trail**: Full history of all changes

---

### 2. `refresh_tokens` Table
```sql
CREATE TABLE refresh_tokens (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    token_hash VARCHAR(500),
    is_revoked BOOLEAN DEFAULT FALSE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (user_id),
    INDEX (token),
    INDEX (expires_at)
);
```

**Purpose**: Store JWT refresh tokens for token renewal
**Use Case**: Expire access tokens, allow refresh without re-login
**Security**: Tracks IP and user agent, can revoke tokens

---

### 3. `audit_logs` Table
```sql
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    changes JSON,
    status VARCHAR(20),
    error_message TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX (user_id),
    INDEX (action),
    INDEX (entity_type),
    INDEX (entity_id),
    INDEX (timestamp)
);
```

**Purpose**: Comprehensive system audit trail
**Use Case**: Track all user actions, system events, compliance
**Queries**: Filter by user, action, date range, entity
**Compliance**: Immutable audit trail

---

### 4. `email_logs` Table
```sql
CREATE TABLE email_logs (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    email_type VARCHAR(100) NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    user_id INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX (idempotency_key),
    INDEX (recipient_email),
    INDEX (status),
    INDEX (created_at)
);
```

**Purpose**: Track all emails sent for idempotency and compliance
**Use Case**: Prevent duplicate emails on retries, track failures
**Deduplication**: Uses idempotency_key to prevent duplicates
**Reliability**: Tracks all attempts and failures

---

### 5. `feature_flags` Table
```sql
CREATE TABLE feature_flags (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    conference_id INTEGER NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    config VARCHAR(2000),
    description VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE,
    INDEX (conference_id),
    INDEX (feature_name),
    UNIQUE KEY (conference_id, feature_name)
);
```

**Purpose**: Control AI and optional features per conference
**Use Case**: Toggle features on/off, store feature configuration
**Config**: JSON string for feature-specific settings
**Per-Conference**: Different settings for each conference

---

## 📈 Existing Table Modifications

### `papers` Table (No Schema Changes)
- Still uses existing structure
- **Enhancement**: Now supports `SubmissionVersion` for versioning
- **Change Tracking**: `submission_versions` table maintains history

### `users` Table (No Schema Changes)
- Existing structure intact
- **New Relations**: 
  - One-to-many with `refresh_tokens`
  - One-to-many with `audit_logs`
  - One-to-many with `email_logs`

### `conferences` Table (No Schema Changes)
- Existing structure intact
- **New Relations**:
  - One-to-many with `feature_flags`

---

## 🔑 Indexes for Performance

### `submission_versions`
```sql
INDEX (paper_id)      -- Find versions for a paper
INDEX (version)       -- Find specific version
INDEX (created_at)    -- Timeline queries
```

### `refresh_tokens`
```sql
INDEX (user_id)       -- Find tokens for user
INDEX (token)         -- Validate token
INDEX (expires_at)    -- Find expired tokens
```

### `audit_logs`
```sql
INDEX (user_id)       -- Filter by user
INDEX (action)        -- Filter by action type
INDEX (entity_type)   -- Filter by entity
INDEX (entity_id)     -- Find related audits
INDEX (timestamp)     -- Range queries
```

### `email_logs`
```sql
INDEX (idempotency_key) -- Prevent duplicates
INDEX (recipient_email) -- Find emails for user
INDEX (status)          -- Find failed/pending
INDEX (created_at)      -- Timeline queries
```

### `feature_flags`
```sql
INDEX (conference_id)     -- Find flags for conference
INDEX (feature_name)      -- Find specific feature
UNIQUE (conference_id, feature_name) -- One flag per feature per conference
```

---

## 📊 Data Model Relationships

```
User
├── Has many RefreshToken (one-to-many)
├── Has many AuditLog (one-to-many)
├── Has many EmailLog (one-to-many)
└── Has many SubmissionVersion (one-to-many) - created_by

Paper
├── Has many SubmissionVersion (one-to-many)
└── Belongs to Conference (many-to-one)

Conference
├── Has many FeatureFlag (one-to-many)
└── Related to SubmissionVersion via Paper

FeatureFlag
└── Belongs to Conference (many-to-one)

SubmissionVersion
├── Belongs to Paper (many-to-one)
└── Belongs to User (many-to-one) - creator

RefreshToken
└── Belongs to User (many-to-one)

AuditLog
└── Belongs to User (many-to-one) - nullable for system actions

EmailLog
└── Belongs to User (many-to-one) - nullable for system emails
```

---

## 🔄 Data Flow Examples

### Submission Version Workflow
```
User uploads paper (paper_id=1)
    → Create Paper record
    → Create SubmissionVersion v1
    
User updates paper
    → Update Paper record
    → Create SubmissionVersion v2
    
User updates again
    → Update Paper record
    → Create SubmissionVersion v3
    
Query: Get all versions of paper 1
    SELECT * FROM submission_versions 
    WHERE paper_id=1 
    ORDER BY version ASC
```

### Refresh Token Workflow
```
User login
    → Create RefreshToken (expires in 7 days)
    → Return AccessToken (expires in 1 hour)
    
AccessToken expires
    → User calls /auth/refresh with RefreshToken
    → Generate new AccessToken
    → Return new AccessToken
    
User logout
    → Revoke RefreshToken (set is_revoked=1)
    → User must login again
```

### Audit Log Workflow
```
User submits paper
    → Create Paper record
    → Create SubmissionVersion v1
    → Log to AuditLog: user_id, action=PAPER_SUBMITTED, ...
    
Chair auto-assigns reviewers
    → Create Assignment records
    → Log to AuditLog: user_id=NULL, action=AUTO_ASSIGNMENT_RUN, ...
    
Query: Get all actions by user 42
    SELECT * FROM audit_logs 
    WHERE user_id=42 
    ORDER BY timestamp DESC
```

### Email Idempotency Workflow
```
Decision made → Send email to author
    → Generate idempotency_key = hash(recipient+type+entity)
    → Check: EmailLog WHERE idempotency_key=... AND status='sent'
    → If exists: SKIP (already sent)
    → If not: Create EmailLog, send email, update status='sent'
    
Retry on failure
    → Check retry_count < max_retries
    → If yes: retry send, increment retry_count
    → If no: mark status='failed', log error
```

---

## 🗂️ Query Examples

### Get Paper Version History
```sql
SELECT sv.version, sv.change_notes, sv.created_at, 
       u.full_name as creator, sv.file_size
FROM submission_versions sv
JOIN users u ON sv.created_by = u.id
WHERE sv.paper_id = 123
ORDER BY sv.version ASC;
```

### Get All Actions for Conference Today
```sql
SELECT al.action, al.entity_type, COUNT(*) as count
FROM audit_logs al
WHERE DATE(al.timestamp) = CURDATE()
  AND al.entity_id IN (
    SELECT id FROM papers WHERE conference_id = 1
  )
GROUP BY al.action, al.entity_type
ORDER BY count DESC;
```

### Find Sent Emails for Paper
```sql
SELECT el.recipient_email, el.subject, el.sent_at, el.retry_count
FROM email_logs el
WHERE el.related_entity_type = 'Paper'
  AND el.related_entity_id = 123
  AND el.status = 'sent'
ORDER BY el.sent_at DESC;
```

### Get Active Feature Flags
```sql
SELECT feature_name, config
FROM feature_flags
WHERE conference_id = 1
  AND enabled = TRUE;
```

### Check User Session Tokens
```sql
SELECT id, token, expires_at, is_revoked
FROM refresh_tokens
WHERE user_id = 42
  AND is_revoked = FALSE
  AND expires_at > NOW();
```

---

## 📋 Migration Script Example (Alembic)

```python
def upgrade():
    # Create submission_versions
    op.create_table(
        'submission_versions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('paper_id', sa.Integer(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('file_path', sa.String(500), nullable=False),
        sa.Column('file_size', sa.Integer()),
        sa.Column('title', sa.String(500)),
        sa.Column('abstract', sa.Text()),
        sa.Column('keywords', sa.String(500)),
        sa.Column('change_notes', sa.Text()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('created_by', sa.Integer()),
        sa.ForeignKeyConstraint(['paper_id'], ['papers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('ix_submission_versions_paper_id', 'paper_id'),
        sa.Index('ix_submission_versions_version', 'version'),
        sa.Index('ix_submission_versions_created_at', 'created_at')
    )
    
    # Similar for other tables...
    # Create refresh_tokens, audit_logs, email_logs, feature_flags
```

---

## 🔐 Data Security

### Sensitive Data
- **Passwords**: Already hashed (existing system)
- **Tokens**: Stored separately, hashed in production
- **Email**: Stored plain (necessary for sending)
- **IP Addresses**: Logged for audit trail

### Access Control
- Audit logs: Chair/Admin only
- Email logs: Admin only
- Feature flags: Chair/Admin to toggle
- Refresh tokens: User's own only

### Data Retention
- Audit logs: Keep indefinitely (compliance)
- Email logs: Keep for 90+ days (reliability)
- Refresh tokens: Delete after expiration + 30 days
- Submission versions: Keep indefinitely (history)

---

**Database Schema Version**: 1.0  
**Last Updated**: January 23, 2026  
**Status**: Production Ready
