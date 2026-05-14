from sqlalchemy import Column, Integer, String, Text

from app.database import Base

class UploadedContent(Base):

    __tablename__ = "uploaded_content"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    file_name = Column(String)

    file_type = Column(String)

    extracted_text = Column(Text)