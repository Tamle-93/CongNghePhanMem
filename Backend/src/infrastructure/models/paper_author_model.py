from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey
)
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base


class PaperAuthor(Base):
    """
    Association table between Paper and User (Author)
    Supports:
    - Multiple authors per paper
    - Author order
    - Corresponding author
    """

    __tablename__ = "paper_authors"

    id = Column(Integer, primary_key=True, index=True)

    paper_id = Column(
        Integer,
        ForeignKey("papers.id", ondelete="CASCADE"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    author_order = Column(Integer, nullable=False)

    is_corresponding = Column(Boolean, default=False)

    affiliation = Column(String(255))

    # Relationships
    paper = relationship("Paper", back_populates="authors")
    author = relationship("User", back_populates="authored_papers")
