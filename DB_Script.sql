-- --- PHẦN 1: DỌN DẸP DỮ LIỆU CŨ (Chạy để không bị lỗi trùng) ---
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

-- 1. Bảng Users (GỐC)
CREATE TABLE Users (
  Id VARCHAR(255) PRIMARY KEY,
  Username VARCHAR(255) NOT NULL,
  PasswordHash VARCHAR(255) NOT NULL,
  FullName VARCHAR(255),
  Email VARCHAR(255),
  Organization VARCHAR(255),
  Role VARCHAR(50),
  AvatarUrl VARCHAR(500),
  CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CreatedBy VARCHAR(255),
  UpdatedDate TIMESTAMP,
  IsDeleted BOOLEAN DEFAULT FALSE,
  Note VARCHAR(255)
);

-- 2. Bảng Conferences (Cần Users)
CREATE TABLE Conferences (
  Id VARCHAR(255) PRIMARY KEY,
  Chair_Users_Id VARCHAR(255),
  Name VARCHAR(255),
  Description TEXT,
  StartDate TIMESTAMP,
  EndDate TIMESTAMP,
  SubmissionDeadline TIMESTAMP,
  ReviewDeadline TIMESTAMP,
  IsBlindReview BOOLEAN DEFAULT FALSE,
  CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CreatedBy VARCHAR(255),
  UpdatedDate TIMESTAMP,
  IsDeleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (Chair_Users_Id) REFERENCES Users(Id)
);

-- 3. Bảng Tracks (Cần Conferences)
CREATE TABLE Tracks (
  Id VARCHAR(255) PRIMARY KEY,
  Conference_Id VARCHAR(255),
  Name VARCHAR(255),
  Code VARCHAR(50),
  Description TEXT,
  CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CreatedBy VARCHAR(255),
  UpdatedDate TIMESTAMP,
  IsDeleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (Conference_Id) REFERENCES Conferences(Id)
);

-- 4. Bảng Papers (Cần Tracks, Users)
CREATE TABLE Papers (
  Id VARCHAR(255) PRIMARY KEY,
  Track_Id VARCHAR(255),
  Submitter_Users_Id VARCHAR(255),
  Title VARCHAR(255),
  Abstract TEXT,
  Keywords VARCHAR(255),
  FileUrl VARCHAR(500),
  CameraReadyUrl VARCHAR(500),
  Status VARCHAR(50),
  CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CreatedBy VARCHAR(255),
  UpdatedDate TIMESTAMP,
  IsDeleted BOOLEAN DEFAULT FALSE,
  Note VARCHAR(255),
  FOREIGN KEY (Track_Id) REFERENCES Tracks(Id),
  FOREIGN KEY (Submitter_Users_Id) REFERENCES Users(Id)
);

-- 5. Bảng PaperAuthors (Cần Papers)
CREATE TABLE PaperAuthors (
  Id VARCHAR(255) PRIMARY KEY,
  Paper_Id VARCHAR(255),
  AuthorName VARCHAR(255),
  AuthorEmail VARCHAR(255),
  Organization VARCHAR(255),
  IsCorrespondingAuthor BOOLEAN DEFAULT FALSE,
  CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Paper_Id) REFERENCES Papers(Id)
);

-- 6. Bảng Assignments (Cần Papers, Users)
CREATE TABLE Assignments (
  Id VARCHAR(255) PRIMARY KEY,
  Paper_Id VARCHAR(255),
  Reviewer_Users_Id VARCHAR(255),
  AssignedDate TIMESTAMP,
  DeadlineDate TIMESTAMP,
  Status VARCHAR(50),
  IsManualAssignment BOOLEAN DEFAULT TRUE,
  CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CreatedBy VARCHAR(255),
  UpdatedDate TIMESTAMP,
  IsDeleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (Paper_Id) REFERENCES Papers(Id),
  FOREIGN KEY (Reviewer_Users_Id) REFERENCES Users(Id)
);

-- 7. Bảng Reviews (Cần Assignments)
CREATE TABLE Reviews (
  Id VARCHAR(255) PRIMARY KEY,
  Assignment_Id VARCHAR(255),
  Score INT,
  ConfidenceLevel INT,
  CommentsForAuthor TEXT,
  CommentsForChair TEXT,
  SubmittedDate TIMESTAMP,
  CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedDate TIMESTAMP,
  IsDeleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (Assignment_Id) REFERENCES Assignments(Id)
);

-- 8. Bảng Decisions (Cần Papers, Users)
CREATE TABLE Decisions (
  Id VARCHAR(255) PRIMARY KEY,
  Paper_Id VARCHAR(255),
  Chair_Users_Id VARCHAR(255),
  Result VARCHAR(50),
  FinalComment TEXT,
  DecisionDate TIMESTAMP,
  CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  IsDeleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (Paper_Id) REFERENCES Papers(Id),
  FOREIGN KEY (Chair_Users_Id) REFERENCES Users(Id)
);

-- 9. Bảng ConflictsOfInterest (Cần Users, Papers)
CREATE TABLE ConflictsOfInterest (
  Id VARCHAR(255) PRIMARY KEY,
  Reviewer_Users_Id VARCHAR(255),
  Paper_Id VARCHAR(255),
  Reason VARCHAR(255),
  DeclaredDate TIMESTAMP,
  Status VARCHAR(50),
  IsDeleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (Reviewer_Users_Id) REFERENCES Users(Id),
  FOREIGN KEY (Paper_Id) REFERENCES Papers(Id)
);

-- 10. Bảng AuditLogsAI (Cần Users)
CREATE TABLE AuditLogsAI (
  Id VARCHAR(255) PRIMARY KEY,
  Action_Users_Id VARCHAR(255),
  ActionType VARCHAR(100),
  InputHash VARCHAR(500),
  ModelVersion VARCHAR(50),
  Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Note VARCHAR(255),
  FOREIGN KEY (Action_Users_Id) REFERENCES Users(Id)
);