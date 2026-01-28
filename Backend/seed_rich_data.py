# Backend/seed_rich_data.py
"""
Seed Database with RICH Sample Data - Hội nghị, Bài báo, Reviews, Decisions
Giữ nguyên Users, chỉ fake dữ liệu hội nghị và liên quan

USAGE:
    cd Backend
    python seed_rich_data.py
"""
import sys
import os
import random
from datetime import datetime, timedelta

# Add src to path
current_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(current_dir, 'src')
sys.path.insert(0, src_dir)

print(f"📂 Current directory: {current_dir}")
print(f"📂 Src directory: {src_dir}")

from infrastructure.databases.base import init_db, SessionLocal

# Create session
db_session = SessionLocal()
from infrastructure.models.user_model import User
from infrastructure.models.role_model import Role
from infrastructure.models.user_role_model import UserRole
from infrastructure.models.conference_model import Conference
from infrastructure.models.track_model import Track
from infrastructure.models.paper_model import PaperStatus, Paper
from infrastructure.models.paper_author_model import PaperAuthor
from infrastructure.models.assignment_model import Assignment
from infrastructure.models.review_model import Review
from infrastructure.models.decision_model import Decision

from werkzeug.security import generate_password_hash

# =================================================================
# SAMPLE DATA DEFINITIONS
# =================================================================

# Tên hội nghị thực tế
CONFERENCE_NAMES = [
    "International Conference on Artificial Intelligence and Machine Learning (ICAIML)",
    "IEEE Conference on Software Engineering and Applications (CSEA)",
    "ACM Symposium on Computer Vision and Pattern Recognition (CVPR-Vn)",
    "International Conference on Big Data and Cloud Computing (ICBDCC)",
    "Asia-Pacific Conference on Cybersecurity (APCS)",
    "Vietnam Symposium on Natural Language Processing (VSNLP)",
    "International Conference on Internet of Things and Smart Cities (IoTSC)",
    "Conference on Blockchain Technology and Applications (CBTA)",
    "International Workshop on Quantum Computing (IWQC)",
    "ASEAN Conference on Robotics and Automation (ACRA)",
]

# Địa điểm tổ chức
LOCATIONS = [
    "Ho Chi Minh City, Vietnam",
    "Hanoi, Vietnam", 
    "Da Nang, Vietnam",
    "Can Tho, Vietnam",
    "Nha Trang, Vietnam",
    "Hue, Vietnam",
    "Phu Quoc Island, Vietnam",
    "Vung Tau, Vietnam",
    "Hai Phong, Vietnam",
    "Quy Nhon, Vietnam",
]

# Tracks theo từng loại hội nghị
TRACKS_BY_CONFERENCE = {
    "AI": [
        ("Machine Learning", "ML", "Deep Learning, Neural Networks, Transfer Learning"),
        ("Natural Language Processing", "NLP", "Text Mining, Sentiment Analysis, Machine Translation"),
        ("Computer Vision", "CV", "Image Recognition, Object Detection, Video Analysis"),
        ("Reinforcement Learning", "RL", "Game AI, Robotics Control, Autonomous Systems"),
        ("AI Ethics & Fairness", "AIF", "Bias Detection, Explainable AI, Responsible AI"),
    ],
    "SE": [
        ("Software Architecture", "SA", "Microservices, Monolith, Event-Driven"),
        ("DevOps & CI/CD", "DO", "Continuous Integration, Deployment Automation"),
        ("Software Testing", "ST", "Unit Testing, Integration Testing, QA"),
        ("Agile Methods", "AM", "Scrum, Kanban, XP"),
        ("Code Quality", "CQ", "Code Review, Static Analysis, Refactoring"),
    ],
    "Security": [
        ("Network Security", "NS", "Firewall, IDS/IPS, VPN"),
        ("Cryptography", "CRY", "Encryption, Digital Signatures, PKI"),
        ("Application Security", "AS", "OWASP, Secure Coding, Penetration Testing"),
        ("Cloud Security", "CS", "IAM, Data Protection, Compliance"),
        ("Malware Analysis", "MA", "Reverse Engineering, Threat Intelligence"),
    ],
    "Data": [
        ("Big Data Analytics", "BDA", "Hadoop, Spark, Data Lakes"),
        ("Data Mining", "DM", "Association Rules, Clustering, Classification"),
        ("Data Visualization", "DV", "Dashboard Design, Interactive Charts"),
        ("Data Engineering", "DE", "ETL, Data Pipelines, Data Warehousing"),
        ("Data Governance", "DG", "Data Quality, Metadata Management"),
    ],
    "IoT": [
        ("Smart Home", "SH", "Home Automation, Voice Control"),
        ("Industrial IoT", "IIoT", "Manufacturing, Predictive Maintenance"),
        ("Healthcare IoT", "HIoT", "Wearables, Remote Monitoring"),
        ("Smart Agriculture", "SAG", "Precision Farming, Crop Monitoring"),
        ("Edge Computing", "EC", "Fog Computing, Real-time Processing"),
    ],
}

# Tiêu đề bài báo mẫu theo track
PAPER_TITLES = {
    "ML": [
        "A Novel Deep Learning Approach for Medical Image Segmentation",
        "Transfer Learning for Low-Resource Language Translation",
        "Efficient Neural Architecture Search using Reinforcement Learning",
        "Federated Learning for Privacy-Preserving Healthcare Analytics",
        "Self-Supervised Learning for Video Understanding",
        "Graph Neural Networks for Social Network Analysis",
        "Attention Mechanisms in Transformer Models: A Comprehensive Survey",
        "Meta-Learning for Few-Shot Classification",
        "Ensemble Methods for Robust Prediction Models",
        "Interpretable Machine Learning for Clinical Decision Support",
    ],
    "NLP": [
        "Vietnamese Named Entity Recognition using PhoBERT",
        "Cross-lingual Sentiment Analysis for Low-Resource Languages",
        "Question Answering System for Vietnamese Legal Documents",
        "Automatic Text Summarization for News Articles",
        "Hate Speech Detection in Social Media Posts",
        "Machine Translation for Vietnamese-English Language Pair",
        "Aspect-Based Sentiment Analysis for Product Reviews",
        "Dialogue System for Customer Service Automation",
        "Text Classification using Contextual Embeddings",
        "Information Extraction from Vietnamese Documents",
    ],
    "CV": [
        "Real-time Object Detection for Autonomous Vehicles",
        "Face Recognition in Challenging Conditions",
        "Medical Image Analysis using Deep Learning",
        "Video Action Recognition for Surveillance Systems",
        "Image Super-Resolution using Generative Models",
        "Semantic Segmentation for Scene Understanding",
        "3D Object Reconstruction from 2D Images",
        "Visual Question Answering for Educational Applications",
        "Pose Estimation for Human Activity Recognition",
        "Document Layout Analysis for Information Extraction",
    ],
    "SA": [
        "Microservices Architecture Best Practices",
        "Event-Driven Architecture for Scalable Systems",
        "Monolith to Microservices Migration Strategies",
        "Domain-Driven Design Implementation Patterns",
        "API Gateway Design for Microservices",
        "Service Mesh Architecture for Cloud Native Applications",
        "Containerization Strategies for Legacy Applications",
        "Serverless Architecture for Event Processing",
        "CQRS Pattern Implementation Guidelines",
        "Saga Pattern for Distributed Transactions",
    ],
    "DO": [
        "Continuous Deployment Pipeline Optimization",
        "Infrastructure as Code Best Practices",
        "Kubernetes Deployment Strategies for Production",
        "GitOps Workflow Implementation",
        "Monitoring and Observability for Microservices",
        "Chaos Engineering for Resilience Testing",
        "Blue-Green Deployment Automation",
        "Container Security in CI/CD Pipelines",
        "Performance Testing in DevOps Workflows",
        "Automated Rollback Strategies for Deployments",
    ],
    "NS": [
        "Zero Trust Network Architecture Implementation",
        "Intrusion Detection using Machine Learning",
        "Software-Defined Networking Security",
        "DDoS Attack Mitigation Strategies",
        "VPN Security Assessment Framework",
        "Network Traffic Analysis for Threat Detection",
        "Firewall Rule Optimization Techniques",
        "Network Segmentation Best Practices",
        "IoT Network Security Challenges",
        "5G Network Security Considerations",
    ],
    "BDA": [
        "Real-time Analytics Platform Architecture",
        "Data Lake Design and Implementation",
        "Stream Processing for IoT Data",
        "Scalable Data Pipeline Design",
        "Data Quality Management Framework",
        "Big Data Governance Best Practices",
        "Cost Optimization for Cloud Data Platforms",
        "Multi-tenant Data Architecture",
        "Data Mesh Implementation Patterns",
        "Hybrid Cloud Data Strategy",
    ],
    "SH": [
        "Voice-Controlled Smart Home System",
        "Energy Management for Smart Buildings",
        "Home Automation Security Framework",
        "Multi-Protocol Gateway for Smart Devices",
        "Elderly Care Monitoring System",
        "Smart Lighting Control Algorithms",
        "Indoor Air Quality Monitoring",
        "Smart Lock Security Analysis",
        "Home Energy Consumption Prediction",
        "Privacy-Preserving Smart Home Analytics",
    ],
}

# Abstract templates
ABSTRACT_TEMPLATES = [
    "This paper presents a novel approach to {topic} using {method}. Our experimental results demonstrate significant improvements over existing methods, achieving {metric}% improvement on benchmark datasets. The proposed solution addresses key challenges in {challenge} and provides practical insights for real-world applications.",
    "We introduce {method} for {topic}, a cutting-edge technique that outperforms state-of-the-art methods. Through extensive experiments on {dataset}, we show that our approach achieves {metric}% accuracy while reducing computational cost by {cost}%. This work contributes to the advancement of {field}.",
    "In this research, we investigate the application of {method} to solve {topic}. Our comprehensive analysis reveals important findings about {challenge}. The proposed framework demonstrates superior performance with {metric}% improvement in {metric_name}.",
    "This study explores {topic} through the lens of {method}. We conduct experiments on {dataset} and analyze the results using multiple evaluation metrics. Our findings indicate that {method} can effectively address {challenge}, opening new research directions in {field}.",
    "We propose a {method}-based solution for {topic} that achieves state-of-the-art results on {dataset}. The key contribution includes a novel {contribution} that improves {metric_name} by {metric}%. Our approach has practical applications in {application}.",
]

# Reviewer comments templates
REVIEWER_COMMENTS = [
    "The paper presents interesting ideas with solid experimental validation. The methodology is sound and the results are convincing. Minor revisions recommended for clarity.",
    "Well-written paper with clear contributions. The literature review is comprehensive. However, some experimental details need clarification. Recommend accept with minor revisions.",
    "This is a strong submission with novel contributions to the field. The experimental setup is rigorous and the results are significant. I recommend acceptance.",
    "The paper addresses an important problem with a creative solution. The experiments are well-designed but could benefit from additional baselines. Overall, a good contribution.",
    "Solid technical work with interesting findings. The presentation could be improved in some sections. The related work section needs expansion. Accept with revisions.",
    "The proposed method shows promise but lacks sufficient comparison with recent work. The theoretical analysis is incomplete. Major revisions required.",
    "Interesting approach but the experimental evaluation is limited. More datasets and baselines needed. The paper requires significant improvements.",
    "The paper has potential but the current version needs more work. The methodology section lacks important details. Reject and encourage resubmission.",
    "The contribution is incremental compared to existing methods. The experimental results do not convincingly demonstrate the claimed improvements. Reject.",
    "Excellent paper with significant contributions. The experimental results are impressive and the writing is clear. Strongly recommend acceptance.",
]

# Confidential comments templates
CONFIDENTIAL_COMMENTS = [
    "The authors have adequately addressed the technical challenges. I have no concerns about ethical issues.",
    "Minor concerns about reproducibility - code should be made available. Otherwise, solid work.",
    "The experimental setup seems fair. No conflicts of interest detected.",
    "I recommend this paper for the best paper award consideration. Outstanding contribution.",
    "The paper is technically sound but presentation needs improvement. Suitable for poster session.",
    "No major concerns. The authors should consider expanding the related work in the camera-ready version.",
]

# Decision comments
DECISION_COMMENTS = {
    "accepted": [
        "The paper makes significant contributions to the field and has received positive reviews. Accepted for oral presentation.",
        "Strong technical contribution with comprehensive experiments. Accepted for the main conference track.",
        "Well-received by reviewers. Accepted as a full paper. Congratulations!",
        "Excellent work addressing important research questions. Accepted for publication.",
    ],
    "rejected": [
        "After careful consideration, we regret to inform that the paper does not meet the acceptance threshold. We encourage resubmission to future venues.",
        "The reviewers identified significant concerns that could not be addressed during the review period. We recommend major revisions and resubmission.",
        "The paper does not sufficiently advance the state of the art. We encourage the authors to address reviewer feedback.",
    ],
    "revision": [
        "The paper shows promise but requires revisions. Please address reviewer comments and resubmit.",
        "Conditional accept pending major revisions. Please submit the revised version by the deadline.",
    ],
}


def clear_conference_data():
    """Xóa dữ liệu hội nghị cũ, giữ nguyên users"""
    print("🗑️  Clearing old conference data...")
    
    try:
        db_session.query(Decision).delete()
        db_session.query(Review).delete()
        db_session.query(Assignment).delete()
        db_session.query(PaperAuthor).delete()
        db_session.query(Paper).delete()
        db_session.query(Track).delete()
        db_session.query(Conference).delete()
        
        db_session.commit()
        print("✅ Old conference data cleared")
    except Exception as e:
        db_session.rollback()
        print(f"❌ Error clearing data: {e}")
        raise


def get_existing_users():
    """Lấy users hiện có trong database"""
    users = db_session.query(User).all()
    
    if not users:
        print("❌ No users found! Please run seed_database.py first.")
        sys.exit(1)
    
    # Categorize users
    admins = []
    chairs = []
    reviewers = []
    authors = []
    
    for user in users:
        # user.roles là property trả về list of role names (strings)
        roles = user.roles  # ['Admin', 'Chair', 'Reviewer', 'Author']
        if 'Admin' in roles:
            admins.append(user)
        if 'Chair' in roles:
            chairs.append(user)
        if 'Reviewer' in roles:
            reviewers.append(user)
        if 'Author' in roles:
            authors.append(user)
    
    print(f"📊 Found users: {len(admins)} admins, {len(chairs)} chairs, {len(reviewers)} reviewers, {len(authors)} authors")
    
    return {
        'admins': admins,
        'chairs': chairs,
        'reviewers': reviewers,
        'authors': authors,
        'all': users
    }


def seed_conferences(chairs):
    """Tạo nhiều hội nghị với đầy đủ thông tin"""
    print("\n🎓 Creating conferences...")
    
    today = datetime.now()
    conferences = []
    
    # Determine track types for each conference
    track_types = list(TRACKS_BY_CONFERENCE.keys())
    
    for i, name in enumerate(CONFERENCE_NAMES):
        chair = random.choice(chairs) if chairs else None
        
        # Random dates - some past, some future
        days_offset = random.randint(-60, 120)
        base_date = today + timedelta(days=days_offset)
        
        # Determine if conference is active based on dates
        is_past = days_offset < -30
        is_active = not is_past
        
        conf = Conference(
            name=name,
            description=f"Annual conference on {name.split('(')[0].strip()}. Join leading researchers and practitioners to discuss the latest advances and challenges.",
            location=LOCATIONS[i % len(LOCATIONS)],
            website_url=f"https://conf{i+1}.uth.edu.vn",
            
            submission_deadline=base_date + timedelta(days=30),
            review_deadline=base_date + timedelta(days=60),
            decision_deadline=base_date + timedelta(days=75),
            camera_ready_deadline=base_date + timedelta(days=90),
            registration_deadline=base_date + timedelta(days=100),
            conference_start_date=base_date + timedelta(days=120),
            conference_end_date=base_date + timedelta(days=122),
            
            blind_review_type=random.choice(['single-blind', 'double-blind']),
            max_reviewers_per_paper=random.randint(3, 5),
            min_reviewers_per_paper=2,
            
            chair_id=chair.id if chair else None,
            is_active=is_active
        )
        
        db_session.add(conf)
        conferences.append((conf, track_types[i % len(track_types)]))
    
    db_session.commit()
    print(f"✅ Created {len(conferences)} conferences")
    return conferences


def seed_tracks(conferences_with_types):
    """Tạo tracks cho từng hội nghị"""
    print("\n📚 Creating tracks...")
    
    all_tracks = []
    
    for conf, track_type in conferences_with_types:
        tracks_data = TRACKS_BY_CONFERENCE.get(track_type, TRACKS_BY_CONFERENCE["AI"])
        
        for name, code, description in tracks_data:
            track = Track(
                conference_id=conf.id,
                name=name,
                code=code,
                description=description
            )
            db_session.add(track)
            all_tracks.append(track)
    
    db_session.commit()
    print(f"✅ Created {len(all_tracks)} tracks")
    return all_tracks


def generate_abstract(track_code):
    """Generate random abstract based on track"""
    template = random.choice(ABSTRACT_TEMPLATES)
    
    topics = {
        "ML": "deep learning model optimization",
        "NLP": "Vietnamese text processing",
        "CV": "image recognition systems",
        "SA": "microservices design",
        "DO": "CI/CD pipeline automation",
        "NS": "network intrusion detection",
        "BDA": "big data analytics",
        "SH": "smart home automation",
    }
    
    methods = ["deep neural networks", "transformer models", "ensemble learning", "reinforcement learning", "graph neural networks"]
    datasets = ["public benchmark datasets", "real-world datasets", "proprietary datasets"]
    
    return template.format(
        topic=topics.get(track_code, "advanced computing"),
        method=random.choice(methods),
        metric=random.randint(5, 25),
        metric_name="accuracy",
        challenge="scalability and performance",
        dataset=random.choice(datasets),
        cost=random.randint(20, 50),
        field="computer science",
        contribution="architecture design",
        application="industry applications"
    )


def seed_papers(tracks, authors):
    """Tạo papers cho từng track"""
    print("\n📄 Creating papers...")
    
    papers = []
    statuses = [PaperStatus.SUBMITTED, PaperStatus.UNDER_REVIEW, PaperStatus.REVIEWED, 
                PaperStatus.ACCEPTED, PaperStatus.REJECTED, PaperStatus.DRAFT]
    status_weights = [15, 25, 20, 20, 15, 5]  # Probability weights
    
    for track in tracks:
        # Get paper titles for this track
        track_code = track.code
        titles = PAPER_TITLES.get(track_code, PAPER_TITLES.get("ML", []))
        
        # Create 3-6 papers per track
        num_papers = random.randint(3, 6)
        selected_titles = random.sample(titles, min(num_papers, len(titles)))
        
        for title in selected_titles:
            author = random.choice(authors) if authors else None
            if not author:
                continue
            
            # Random status with weights
            status = random.choices(statuses, weights=status_weights, k=1)[0]
            
            paper = Paper(
                conference_id=track.conference_id,
                track_id=track.id,
                submitter_id=author.id,
                title=title,
                abstract=generate_abstract(track_code),
                keywords=", ".join(random.sample([
                    "machine learning", "deep learning", "AI", "neural networks",
                    "data science", "big data", "cloud computing", "security",
                    "IoT", "automation", "optimization", "analytics"
                ], 4)),
                pdf_path=f"uploads/papers/paper_{track.id}_{len(papers)+1}.pdf",
                status=status
            )
            
            db_session.add(paper)
            db_session.flush()
            
            # Add paper author
            paper_author = PaperAuthor(
                paper_id=paper.id,
                user_id=author.id,
                author_order=1,
                is_corresponding=True
            )
            db_session.add(paper_author)
            
            # Sometimes add co-authors
            if random.random() > 0.5 and len(authors) > 1:
                co_author = random.choice([a for a in authors if a.id != author.id])
                co_author_record = PaperAuthor(
                    paper_id=paper.id,
                    user_id=co_author.id,
                    author_order=2,
                    is_corresponding=False
                )
                db_session.add(co_author_record)
            
            papers.append(paper)
    
    db_session.commit()
    print(f"✅ Created {len(papers)} papers")
    return papers


def seed_assignments(papers, reviewers):
    """Tạo phân công reviewer cho papers"""
    print("\n👥 Creating assignments...")
    
    if not reviewers:
        print("⚠️ No reviewers available for assignments")
        return []
    
    assignments = []
    
    # Only assign reviewers to papers that are submitted or under review
    assignable_statuses = [PaperStatus.SUBMITTED, PaperStatus.UNDER_REVIEW, 
                          PaperStatus.REVIEWED, PaperStatus.ACCEPTED, PaperStatus.REJECTED]
    
    for paper in papers:
        if paper.status not in assignable_statuses:
            continue
        
        # Assign 2-3 reviewers
        num_reviewers = random.randint(2, min(3, len(reviewers)))
        selected_reviewers = random.sample(reviewers, num_reviewers)
        
        for reviewer in selected_reviewers:
            assignment = Assignment(
                conference_id=paper.conference_id,
                paper_id=paper.id,
                reviewer_id=reviewer.id,
                is_auto_assigned=random.choice([True, False]),
                status=random.choice(['Assigned', 'In Progress', 'Completed']),
                assigned_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
            )
            
            db_session.add(assignment)
            assignments.append(assignment)
    
    db_session.commit()
    print(f"✅ Created {len(assignments)} assignments")
    return assignments


def seed_reviews(assignments):
    """Tạo reviews cho các assignments"""
    print("\n📝 Creating reviews...")
    
    reviews = []
    
    for assignment in assignments:
        # Only create reviews for completed assignments or papers under review/reviewed/decided
        paper = db_session.query(Paper).get(assignment.paper_id)
        if not paper:
            continue
        
        if paper.status in [PaperStatus.REVIEWED, PaperStatus.ACCEPTED, PaperStatus.REJECTED]:
            # Definitely has review
            should_review = True
        elif paper.status == PaperStatus.UNDER_REVIEW:
            # Maybe has review
            should_review = random.random() > 0.3
        else:
            should_review = False
        
        if not should_review:
            continue
        
        # Random score 1-10
        score = random.randint(3, 10)
        
        review = Review(
            assignment_id=assignment.id,
            paper_id=assignment.paper_id,
            score=score,
            comments_for_author=random.choice(REVIEWER_COMMENTS),
            confidential_content=random.choice(CONFIDENTIAL_COMMENTS),
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 20))
        )
        
        db_session.add(review)
        reviews.append(review)
        
        # Update assignment status
        assignment.status = 'Completed'
        assignment.score = score
    
    db_session.commit()
    print(f"✅ Created {len(reviews)} reviews")
    return reviews


def seed_decisions(papers, chairs):
    """Tạo decisions cho papers đã có kết quả"""
    print("\n⚖️ Creating decisions...")
    
    if not chairs:
        print("⚠️ No chairs available for decisions")
        return []
    
    decisions = []
    
    for paper in papers:
        if paper.status not in [PaperStatus.ACCEPTED, PaperStatus.REJECTED]:
            continue
        
        chair = random.choice(chairs)
        result = "accepted" if paper.status == PaperStatus.ACCEPTED else "rejected"
        
        decision = Decision(
            paper_id=paper.id,
            conference_id=paper.conference_id,
            chair_user_id=chair.id,
            result=result,
            final_comment=random.choice(DECISION_COMMENTS[result]),
            name=f"Decision for Paper #{paper.id}",
            code=f"DEC-{paper.id:04d}",
            description=f"Final decision for submission: {paper.title[:50]}...",
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 10))
        )
        
        db_session.add(decision)
        decisions.append(decision)
    
    db_session.commit()
    print(f"✅ Created {len(decisions)} decisions")
    return decisions


def print_summary():
    """In tổng kết dữ liệu đã tạo"""
    print("\n" + "="*60)
    print("🎉 RICH DATA SEEDED SUCCESSFULLY!")
    print("="*60)
    
    # Count data
    conf_count = db_session.query(Conference).count()
    track_count = db_session.query(Track).count()
    paper_count = db_session.query(Paper).count()
    assignment_count = db_session.query(Assignment).count()
    review_count = db_session.query(Review).count()
    decision_count = db_session.query(Decision).count()
    
    print(f"\n📊 DATA SUMMARY:")
    print(f"   - Conferences: {conf_count}")
    print(f"   - Tracks: {track_count}")
    print(f"   - Papers: {paper_count}")
    print(f"   - Assignments: {assignment_count}")
    print(f"   - Reviews: {review_count}")
    print(f"   - Decisions: {decision_count}")
    
    # Paper status breakdown
    print(f"\n📄 PAPER STATUS BREAKDOWN:")
    for status in PaperStatus:
        count = db_session.query(Paper).filter(Paper.status == status).count()
        if count > 0:
            print(f"   - {status.value}: {count}")
    
    print("\n" + "="*60)
    print("🌐 Start backend: cd Backend && python -m flask run --debug")
    print("🌐 Start frontend: cd frontend && npm run dev")
    print("="*60 + "\n")


def main():
    """Main seeding function"""
    print("\n🌱 Starting RICH data seeding...\n")
    
    try:
        # Initialize database
        init_db()
        
        # Get existing users
        users = get_existing_users()
        
        # Clear old conference data
        clear_conference_data()
        
        # Seed rich conference data
        conferences_with_types = seed_conferences(users['chairs'])
        tracks = seed_tracks(conferences_with_types)
        papers = seed_papers(tracks, users['authors'])
        assignments = seed_assignments(papers, users['reviewers'])
        reviews = seed_reviews(assignments)
        decisions = seed_decisions(papers, users['chairs'])
        
        # Print summary
        print_summary()
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        db_session.rollback()
        raise
    finally:
        db_session.close()


if __name__ == '__main__':
    main()
