# Backend API Quick Reference Guide

## 🔑 Key Improvements Summary

### Security (5 Critical Fixes)
1. ✅ **Deadline Enforcement** - Backend check, 403 Forbidden on violation
2. ✅ **COI Enforcement** - Conflicted reviewers skipped in auto-assignment
3. ✅ **PDF Metadata Removal** - Privacy protection for double-blind review
4. ✅ **Email Idempotency** - Prevents duplicate emails
5. ✅ **Comprehensive Auditing** - Full system activity logging

---

## 🔐 Authentication APIs

### Refresh Access Token
```bash
POST /api/controllers/auth/refresh
Content-Type: application/json

{
  "refresh_token": "long-refresh-token-string"
}

# Response
{
  "status": "success",
  "data": {
    "access_token": "new-jwt-token",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

### Logout (Revoke Refresh Token)
```bash
POST /api/controllers/auth/logout
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "refresh_token": "long-refresh-token-string"
}

# Response
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

## 📄 Paper Management APIs

### Withdraw Paper
```bash
POST /api/controllers/papers/{id}/withdraw
Authorization: Bearer <access_token>

# Response
{
  "status": "success",
  "message": "Paper withdrawn successfully"
}

# Errors:
# 400: Cannot withdraw (after deadline, after decision)
# 403: Permission denied (not author)
# 404: Paper not found
```

---

## ⚖️ Conflict of Interest APIs

### Declare COI
```bash
POST /api/controllers/coi/declare
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "submission_id": 123,
  "reason": "Previous collaborator",
  "conference_id": 1
}

# Response
{
  "status": "success",
  "data": {
    "coi_id": 456,
    "paper_id": 123,
    "reviewer_id": 42,
    "reason": "Previous collaborator"
  }
}
```

### List COIs
```bash
GET /api/controllers/coi?conference_id=1&page=1&per_page=10
Authorization: Bearer <access_token>  # Chair/Admin only

# Response
{
  "status": "success",
  "data": [
    {
      "id": 456,
      "paper_id": 123,
      "paper_title": "Paper Title",
      "reviewer_id": 42,
      "reviewer_name": "John Doe",
      "reason": "Previous collaborator",
      "created_at": "2026-01-23T10:30:00"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "per_page": 10,
    "pages": 2
  }
}
```

### Delete COI
```bash
DELETE /api/controllers/coi/{id}
Authorization: Bearer <access_token>  # Chair/Admin only

# Response
{
  "status": "success",
  "message": "COI deleted successfully"
}
```

---

## 📊 Audit Log APIs

### Get Audit Logs
```bash
GET /api/controllers/audit?action=PAPER_SUBMITTED&page=1&per_page=20&status=success
Authorization: Bearer <access_token>  # Chair/Admin only

# Query Parameters:
# - user_id: Filter by user
# - action: Filter by action type (PAPER_SUBMITTED, USER_LOGIN, etc.)
# - entity_type: Filter by entity (Paper, Review, User, etc.)
# - entity_id: Filter by specific entity
# - status: success, failure, partial
# - start_date: ISO 8601 format
# - end_date: ISO 8601 format
# - page: Page number (default 1)
# - per_page: Items per page (default 20)

# Response
{
  "status": "success",
  "data": [
    {
      "id": 789,
      "user_id": 42,
      "user_name": "John Doe",
      "action": "PAPER_SUBMITTED",
      "entity_type": "Paper",
      "entity_id": 123,
      "changes": {"title": "New Paper", "conference_id": 1},
      "status": "success",
      "error_message": null,
      "ip_address": "192.168.1.1",
      "timestamp": "2026-01-23T10:30:00",
      "description": null
    }
  ],
  "pagination": {...}
}
```

### Get Audit Summary
```bash
GET /api/controllers/audit/summary?days=7
Authorization: Bearer <access_token>  # Chair/Admin only

# Response
{
  "status": "success",
  "data": {
    "period_days": 7,
    "total_logs": 150,
    "actions": {
      "PAPER_SUBMITTED": 45,
      "USER_LOGIN": 80,
      "REVIEW_SUBMITTED": 25
    },
    "statuses": {
      "success": 145,
      "failure": 5,
      "partial": 0
    },
    "active_users": 12,
    "top_actions": [
      ["USER_LOGIN", 80],
      ["PAPER_SUBMITTED", 45],
      ["REVIEW_SUBMITTED", 25]
    ]
  }
}
```

---

## 🚩 Feature Flags APIs

### Check Single Feature Flag
```bash
GET /api/controllers/feature-flags/1/ai_summary
Authorization: Bearer <access_token>

# Response
{
  "status": "success",
  "data": {
    "id": 1,
    "conference_id": 1,
    "feature_name": "ai_summary",
    "enabled": true,
    "config": {"max_words": 250, "language": "en"},
    "description": "AI-powered paper summarization",
    "created_at": "2026-01-20T10:00:00",
    "updated_at": "2026-01-23T10:00:00"
  }
}

# If not found, returns enabled=false
```

### List All Feature Flags
```bash
GET /api/controllers/feature-flags/1
Authorization: Bearer <access_token>  # Chair/Admin only

# Response
{
  "status": "success",
  "data": [
    {...},
    {...}
  ],
  "conference_id": 1,
  "total": 5
}
```

### Toggle Feature Flag
```bash
POST /api/controllers/feature-flags/1/ai_summary
Content-Type: application/json
Authorization: Bearer <access_token>  # Chair/Admin only

{
  "enabled": false,
  "config": "{\"max_words\": 300}",
  "description": "Optional description"
}

# Response
{
  "status": "success",
  "message": "Feature flag \"ai_summary\" disabled",
  "data": {
    "id": 1,
    "conference_id": 1,
    "feature_name": "ai_summary",
    "enabled": false,
    ...
  }
}
```

---

## 📈 Reports APIs

### Conference Statistics
```bash
GET /api/controllers/reports/statistics/1
Authorization: Bearer <access_token>  # Chair/Admin only

# Response
{
  "status": "success",
  "data": {
    "conference": {
      "id": 1,
      "name": "UTH Conf 2026",
      "submission_deadline": "2026-02-28T23:59:59",
      "days_until_deadline": 36
    },
    "papers": {
      "total": 150,
      "submitted": 145,
      "accepted": 45,
      "rejected": 50,
      "withdrawn": 3,
      "acceptance_rate_percent": 30.0,
      "by_track": [
        {"track": "AI & ML", "count": 60},
        {"track": "Security", "count": 40}
      ]
    },
    "reviews": {
      "total": 435,
      "avg_per_paper": 2.9
    },
    "assignments": {
      "total": 145,
      "auto_assigned": 120,
      "manual_assigned": 25
    },
    "reviewers": {
      "total": 50
    },
    "decisions": {
      "made": 95,
      "pending": 50
    }
  }
}
```

### Timeline Statistics
```bash
GET /api/controllers/reports/timeline/1?granularity=daily
Authorization: Bearer <access_token>  # Chair/Admin only

# Response
{
  "status": "success",
  "data": {
    "conference_id": 1,
    "timeline": [
      {
        "date": "2026-01-01",
        "stats": {
          "total": 5,
          "submitted": 5,
          "accepted": 0,
          "rejected": 0,
          "withdrawn": 0
        }
      },
      {
        "date": "2026-01-02",
        "stats": {
          "total": 8,
          "submitted": 8,
          "accepted": 0,
          "rejected": 0,
          "withdrawn": 0
        }
      }
    ],
    "total_days": 23
  }
}
```

### Reviewer Workload
```bash
GET /api/controllers/reports/reviewer-workload/1
Authorization: Bearer <access_token>  # Chair/Admin only

# Response
{
  "status": "success",
  "data": {
    "reviewers": [
      {
        "reviewer_id": 10,
        "reviewer_name": "Dr. Alice",
        "reviewer_email": "alice@uth.edu.vn",
        "assignments": 5
      },
      {
        "reviewer_id": 11,
        "reviewer_name": "Dr. Bob",
        "reviewer_email": "bob@uth.edu.vn",
        "assignments": 3
      }
    ],
    "statistics": {
      "total_reviewers": 50,
      "avg_workload": 2.9,
      "max_workload": 5,
      "min_workload": 1
    }
  }
}
```

---

## 🔄 Auto-Assignment (Enhanced)

### Auto-Assign Reviewers with COI Enforcement
```bash
POST /api/controllers/assignments/auto-assign
Content-Type: application/json
Authorization: Bearer <access_token>  # Chair/Admin only

{
  "conference_id": 1,
  "papers_per_reviewer": 3,
  "reviewers_per_paper": 3
}

# Response
{
  "status": "success",
  "data": {
    "assignments": [
      {
        "paper_id": 123,
        "paper_title": "Paper Title",
        "reviewer_id": 42,
        "reviewer_name": "John Doe",
        "match_score": 0.85
      }
    ],
    "statistics": {
      "total_papers": 150,
      "total_reviewers": 50,
      "new_assignments": 145,
      "reviewer_workload": {...},
      "papers_fully_assigned": 145,
      "papers_partially_assigned": 5,
      "papers_not_assigned": 0,
      "conflicts_respected": 12
    },
    "errors": null
  }
}

# Note: "conflicts_respected" shows COI enforcement working
```

---

## 📝 Common Audit Actions

### Actions Logged by System
- `USER_REGISTERED` - New user registration
- `USER_LOGIN` - User login
- `USER_LOGOUT` - User logout
- `PAPER_SUBMITTED` - Paper submission
- `PAPER_UPDATED` - Paper update
- `PAPER_WITHDRAWN` - Paper withdrawal
- `REVIEW_SUBMITTED` - Review submission
- `DECISION_MADE` - Decision made
- `ASSIGNMENT_CREATED` - Manual assignment
- `AUTO_ASSIGNMENT_RUN` - Auto-assignment run
- `COI_DECLARED` - COI declaration
- `COI_DELETED` - COI deletion
- `FEATURE_FLAG_TOGGLED` - Feature flag change
- `TOKEN_REFRESHED` - JWT refresh
- `SUBMISSION_AFTER_DEADLINE_ATTEMPT` - Deadline violation

---

## 🛡️ Security Features

### Deadline Enforcement
- Checked at **backend** (not just frontend)
- Returns **403 Forbidden** if deadline exceeded
- Logged to audit trail

### COI Enforcement
- Conflicted reviewers **completely skipped** in assignments
- Not just prevented from being assigned manually
- Logged with conflict reason

### PDF Metadata Stripping
- Automatically removes: author, creator, subject, keywords, timestamps
- Applied on upload
- Protects reviewer anonymity

### Email Idempotency
- Each email has unique idempotency key
- Prevents duplicate emails from retries
- Failure tracking and retry counts

---

## 🚀 Getting Started

1. **Install PyPDF2**
   ```bash
   pip install PyPDF2
   ```

2. **Run Database Migrations**
   ```bash
   # Models auto-created on first app run
   # Or: alembic upgrade head
   ```

3. **Test Endpoints**
   ```bash
   # Get audit logs
   curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/controllers/audit
   
   # Check feature flag
   curl http://localhost:5000/api/controllers/feature-flags/1/ai_summary
   ```

4. **Monitor System**
   - Check audit logs regularly
   - Review audit summary for patterns
   - Monitor reviewer workload

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Import error for PyPDF2 | `pip install PyPDF2` |
| 401 Unauthorized | Check Bearer token, verify user role |
| 403 Forbidden | Check permissions (Chair/Admin required) |
| COI not enforced | Verify COI declared before auto-assign |
| Email sent twice | Check email log, verify idempotency key |
| PDF metadata remains | Check PyPDF2 installation, verify strip called |

---

## 📚 Related Documentation

- [ENHANCEMENTS_SUMMARY.md](ENHANCEMENTS_SUMMARY.md) - Detailed implementation
- [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) - Full checklist
- Code comments in each controller and service

---

**Last Updated**: January 23, 2026
**API Version**: 1.0
**Status**: Production Ready
