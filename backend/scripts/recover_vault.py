
import os
import uuid
from backend.database import SessionLocal
from backend.models.vault_model import VaultDocument
from backend.routes.vault_routes import detect_doc_type

def recover_docs():
    UPLOAD_DIR = os.path.join("backend", "uploads")
    if not os.path.exists(UPLOAD_DIR):
        print("Uploads dir not found.")
        return

    db = SessionLocal()
    try:
        files = os.listdir(UPLOAD_DIR)
        for f in files:
            # Check if this file is already in the DB
            storage_url = f"/uploads/{f}"
            exists = db.query(VaultDocument).filter(VaultDocument.storage_url == storage_url).first()
            if exists:
                print(f"File {f} already in DB.")
                continue
            
            # Re-index
            file_path = os.path.join(UPLOAD_DIR, f)
            size = os.path.getsize(file_path)
            content_type = "application/pdf" if f.endswith(".pdf") else "image/jpeg"
            doc_type = detect_doc_type(f, content_type)
            
            new_doc = VaultDocument(
                user_id=1,
                name=f"Recovered {doc_type.title()} Document",
                doc_type=doc_type,
                storage_url=storage_url,
                size_bytes=size
            )
            db.add(new_doc)
            print(f"Read-indexed {f} as {doc_type}")
            
        db.commit()
        print("Recovery complete.")
    finally:
        db.close()

if __name__ == "__main__":
    recover_docs()
