from app.models import db, SubjectConfig

# Default subject codes — used ONLY for initial DB seeding
_SEED_PRIORITY_SUBJECTS = {
    "ME3591", "ME3691", "ME3391", "ME3491", "ME3451", "CME384", "GE3251", "CME385", "MA3251", 
    "ST25120", "ST25103", "CE3601", "CE3501", "CE3405", "CE3403", "ST4201", "ST4102", 
    "AU3301", "AU3701", "AU3501", "ST4202", "ST4091", "ME8651", "ME8792", "ME8071", 
    "ME8493", "ME8693", "ME8492", "ME8391", "ME8593", "MA8452", "ME8594", "GE8152", 
    "CE8601", "CE8501", "CE8404", "CE8604", "CE8703", "AT8503", "AT8602", "AT8601", "PR8451"
}

_SEED_DRAWING_SUBJECTS = {
    "AU3501", "ME3491", "GE3251", 
    "PR8451", "ME8492", "ME8594", "GE8152", "ME25C01"
}

# Keep these as module-level exports for backward compatibility with seating_algorithm.py fallback
DEFAULT_PRIORITY_SUBJECTS = _SEED_PRIORITY_SUBJECTS
DEFAULT_DRAWING_SUBJECTS = _SEED_DRAWING_SUBJECTS


def seed_default_subjects():
    """Seed default subject codes into the database on first run.
    Only inserts if the SubjectConfig table is completely empty."""
    existing_count = SubjectConfig.query.count()
    if existing_count > 0:
        return  # Already seeded or has custom entries

    for code in _SEED_PRIORITY_SUBJECTS:
        db.session.add(SubjectConfig(
            type='priority',
            subject_code=code,
            is_default=True
        ))
    
    for code in _SEED_DRAWING_SUBJECTS:
        db.session.add(SubjectConfig(
            type='drawing',
            subject_code=code,
            is_default=True
        ))
    
    db.session.commit()


def get_all_priority_subjects():
    """Get all priority subject codes from the database."""
    try:
        configs = SubjectConfig.query.filter_by(type='priority').all()
        return {c.subject_code for c in configs}
    except Exception:
        return DEFAULT_PRIORITY_SUBJECTS


def get_all_drawing_subjects():
    """Get all drawing subject codes from the database."""
    try:
        configs = SubjectConfig.query.filter_by(type='drawing').all()
        return {c.subject_code for c in configs}
    except Exception:
        return DEFAULT_DRAWING_SUBJECTS


def add_custom_subject_config(subject_type, subject_code):
    """Add a subject configuration."""
    config = SubjectConfig(
        type=subject_type,
        subject_code=subject_code,
        is_default=False
    )
    db.session.add(config)
    db.session.commit()
    return config


def delete_subject_config(subject_type, subject_code):
    """Delete any subject configuration (including defaults)."""
    config = SubjectConfig.query.filter_by(type=subject_type, subject_code=subject_code).first()
    if config:
        db.session.delete(config)
        db.session.commit()
        return True
    return False
