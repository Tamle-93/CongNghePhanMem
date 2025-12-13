-- --- PHẦN 1: DỌN DẸP DỮ LIỆU CŨ (Chạy để không bị lỗi trùng) ---
-- CHẠY ĐOẠN NÀY RIÊNG ĐỂ XÓA SẠCH BẢNG CŨ
DROP TABLE IF EXISTS AuditLogsAI CASCADE;
DROP TABLE IF EXISTS ConflictsOfInterest CASCADE;
DROP TABLE IF EXISTS Decisions CASCADE;
DROP TABLE IF EXISTS Reviews CASCADE;
DROP TABLE IF EXISTS Assignments CASCADE;
DROP TABLE IF EXISTS PaperAuthors CASCADE;
DROP TABLE IF EXISTS Papers CASCADE;
DROP TABLE IF EXISTS Tracks CASCADE;
DROP TABLE IF EXISTS Conferences CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
-- --- PHẦN 2: TẠO BẢNG THEO THỨ TỰ (Cha trước - Con sau) ---

-- ====================================================
-- TẠO LẠI CÁC BẢNG (CHUẨN UUID + SecurityData)
-- ====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Bảng 1: Users
CREATE TABLE Users (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Username VARCHAR(255) NOT NULL,
  PasswordHash VARCHAR(255) NOT NULL,
  FullName VARCHAR(255),
  Email VARCHAR(255) UNIQUE, 
  Organization VARCHAR(255),
  Role VARCHAR(50) DEFAULT 'Author',
  AvatarUrl VARCHAR(500),
  CreatedDate TIMESTAMP DEFAULT NOW(),
  CreatedBy VARCHAR(255),
  UpdatedDate TIMESTAMP,
  IsDeleted BOOLEAN DEFAULT FALSE,
  Note VARCHAR(255),
  SecurityData JSONB  -- Cột quan trọng lưu câu hỏi bảo mật
);

-- Bảng 2: Conferences
CREATE TABLE Conferences (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Chair_Users_Id UUID REFERENCES Users(Id),
  Name VARCHAR(255),
  Description TEXT,
  StartDate TIMESTAMP,
  EndDate TIMESTAMP,
  SubmissionDeadline TIMESTAMP,
  ReviewDeadline TIMESTAMP,
  IsBlindReview BOOLEAN DEFAULT FALSE,
  CreatedDate TIMESTAMP DEFAULT NOW(),
  CreatedBy VARCHAR(255),
  UpdatedDate TIMESTAMP,
  IsDeleted BOOLEAN DEFAULT FALSE
);

-- Bảng 3: Tracks 
CREATE TABLE Tracks (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Conference_Id UUID REFERENCES Conferences(Id),
  Name VARCHAR(255),
  Code VARCHAR(50),
  Description TEXT,
  CreatedDate TIMESTAMP DEFAULT NOW(),
  CreatedBy VARCHAR(255),
  UpdatedDate TIMESTAMP,
  IsDeleted BOOLEAN DEFAULT FALSE
);

-- Bảng 4: Papers
CREATE TABLE Papers (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Track_Id UUID REFERENCES Tracks(Id),
  Submitter_Users_Id UUID REFERENCES Users(Id),
  Title VARCHAR(255),
  Abstract TEXT,
  Keywords VARCHAR(255),
  FileUrl VARCHAR(500),
  CameraReadyUrl VARCHAR(500),
  Status VARCHAR(50),
  CreatedDate TIMESTAMP DEFAULT NOW(),
  CreatedBy VARCHAR(255),
  UpdatedDate TIMESTAMP,
  IsDeleted BOOLEAN DEFAULT FALSE,
  Note VARCHAR(255)
);

-- Bảng 5: PaperAuthors
CREATE TABLE PaperAuthors (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Paper_Id UUID REFERENCES Papers(Id),
  AuthorName VARCHAR(255),
  AuthorEmail VARCHAR(255),
  Organization VARCHAR(255),
  IsCorrespondingAuthor BOOLEAN DEFAULT FALSE,
  CreatedDate TIMESTAMP DEFAULT NOW()
);

-- Bảng 6: Assignments 
CREATE TABLE Assignments (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Paper_Id UUID REFERENCES Papers(Id),
  Reviewer_Users_Id UUID REFERENCES Users(Id),
  AssignedDate TIMESTAMP,
  DeadlineDate TIMESTAMP,
  Status VARCHAR(50),
  IsManualAssignment BOOLEAN DEFAULT TRUE,
  CreatedDate TIMESTAMP DEFAULT NOW(),
  CreatedBy VARCHAR(255),
  UpdatedDate TIMESTAMP,
  IsDeleted BOOLEAN DEFAULT FALSE
);

-- Bảng 7: Reviews
CREATE TABLE Reviews (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Assignment_Id UUID REFERENCES Assignments(Id),
  Score INT,
  ConfidenceLevel INT,
  CommentsForAuthor TEXT,
  CommentsForChair TEXT,
  SubmittedDate TIMESTAMP,
  CreatedDate TIMESTAMP DEFAULT NOW(),
  UpdatedDate TIMESTAMP,
  IsDeleted BOOLEAN DEFAULT FALSE
);

-- Bảng 8: Decisions 
CREATE TABLE Decisions (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Paper_Id UUID REFERENCES Papers(Id),
  Chair_Users_Id UUID REFERENCES Users(Id),
  Result VARCHAR(50),
  FinalComment TEXT,
  DecisionDate TIMESTAMP,
  CreatedDate TIMESTAMP DEFAULT NOW(),
  IsDeleted BOOLEAN DEFAULT FALSE
);

-- Bảng 9: ConflictsOfInterest
CREATE TABLE ConflictsOfInterest (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Reviewer_Users_Id UUID REFERENCES Users(Id),
  Paper_Id UUID REFERENCES Papers(Id),
  Reason VARCHAR(255),
  DeclaredDate TIMESTAMP,
  Status VARCHAR(50),
  IsDeleted BOOLEAN DEFAULT FALSE
);

-- Bảng 10: AuditLogsAI 
CREATE TABLE AuditLogsAI (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Action_Users_Id UUID REFERENCES Users(Id),
  ActionType VARCHAR(100),
  InputHash VARCHAR(500),
  ModelVersion VARCHAR(50),
  Timestamp TIMESTAMP DEFAULT NOW(),
  Note VARCHAR(255)
);