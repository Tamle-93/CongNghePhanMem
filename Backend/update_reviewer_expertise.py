#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Update reviewer expertise and affiliation
"""

import os
import sys
import random

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from infrastructure.databases.base import SessionLocal
from infrastructure.models import User

# Expertise areas
EXPERTISE_AREAS = [
    "Machine Learning, Deep Learning, Neural Networks",
    "Natural Language Processing, Text Mining, Sentiment Analysis",
    "Computer Vision, Image Recognition, Object Detection",
    "Data Mining, Big Data Analytics, Data Visualization",
    "Software Engineering, DevOps, Agile Development",
    "Cybersecurity, Network Security, Cryptography",
    "IoT, Smart Systems, Embedded Computing",
    "Cloud Computing, Distributed Systems, Microservices",
    "Artificial Intelligence, Expert Systems, Knowledge Representation",
    "Database Systems, Data Management, SQL/NoSQL",
    "Mobile Development, Cross-platform Apps, UI/UX",
    "Blockchain, Cryptocurrency, Smart Contracts",
    "Bioinformatics, Computational Biology, Health Informatics",
    "Robotics, Automation, Control Systems",
    "Game Development, Virtual Reality, Augmented Reality",
]

AFFILIATIONS = [
    "University of Technology Ho Chi Minh City (HUTECH)",
    "Vietnam National University HCMC",
    "FPT University",
    "Ton Duc Thang University",
    "RMIT Vietnam",
    "University of Science HCMC",
    "Posts and Telecommunications Institute of Technology",
    "Ho Chi Minh City University of Technology",
    "Can Tho University",
    "Hanoi University of Science and Technology",
]

def update_reviewer_expertise():
    """Update expertise for reviewers"""
    print("\n🔄 Updating reviewer expertise and affiliations...")
    
    db = SessionLocal()
    
    try:
        # Get all users
        users = db.query(User).filter(User.is_deleted == False).all()
        
        updated_count = 0
        reviewer_count = 0
        
        for user in users:
            # Check if user is a reviewer
            if 'Reviewer' in user.roles:
                reviewer_count += 1
                
                # Update expertise if not set
                if not user.expertise:
                    # Assign 2-3 random expertise areas
                    num_expertise = random.randint(2, 3)
                    selected = random.sample(EXPERTISE_AREAS, num_expertise)
                    # Take first keyword from each area
                    expertise_keywords = [e.split(',')[0].strip() for e in selected]
                    user.expertise = ', '.join(expertise_keywords)
                    updated_count += 1
                
                # Update affiliation if not set
                if not user.affiliation:
                    user.affiliation = random.choice(AFFILIATIONS)
        
        db.commit()
        print(f"✅ Found {reviewer_count} reviewers")
        print(f"✅ Updated {updated_count} reviewers with expertise")
        
        # Show sample
        print("\n📋 Sample updated reviewers:")
        for user in users[:5]:
            if 'Reviewer' in user.roles:
                print(f"  - {user.full_name}: {user.expertise}")
                print(f"    Affiliation: {user.affiliation}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == '__main__':
    update_reviewer_expertise()
    print("\n✅ Done!")
