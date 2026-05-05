from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# =============================================================================
# CONFIG
# =============================================================================
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@ccauvery.edu')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Admin@123')

app = FastAPI(title="CCAUVERY API")
api = APIRouter(prefix="/api")

# =============================================================================
# AUTH HELPERS
# =============================================================================
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_role(*roles: str):
    async def checker(user: dict = Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker

# =============================================================================
# MODELS
# =============================================================================
class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: datetime

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=2)
    role: Literal["student", "faculty"] = "student"

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class AuthOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class CourseIn(BaseModel):
    code: str
    name: str
    duration: str
    description: str
    eligibility: str
    syllabus: List[str] = []
    careers: List[str] = []
    fees: float = 0
    image: Optional[str] = None

class Course(CourseIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FacultyIn(BaseModel):
    name: str
    designation: str
    qualification: str
    department: str
    email: Optional[str] = None
    bio: Optional[str] = None
    photo: Optional[str] = None

class Faculty(FacultyIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventIn(BaseModel):
    title: str
    description: str
    date: str  # ISO date
    location: str
    image: Optional[str] = None
    category: str = "general"

class Event(EventIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AlumniIn(BaseModel):
    name: str
    batch: str
    role: str  # current job title
    company: str
    story: str
    photo: Optional[str] = None

class Alumni(AlumniIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class AdmissionIn(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    dob: str
    gender: str
    address: str
    course_code: str
    qualification: str
    marks: float

class Admission(AdmissionIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "pending"  # pending / accepted / rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactIn(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ContactMsg(ContactIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MaterialIn(BaseModel):
    title: str
    course_code: str
    description: str
    file_url: str
    uploaded_by: Optional[str] = None

class Material(MaterialIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AttendanceIn(BaseModel):
    student_email: str
    course_code: str
    date: str
    status: Literal["present", "absent"]

class Attendance(AttendanceIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    marked_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NotificationIn(BaseModel):
    title: str
    message: str
    audience: Literal["all", "students", "faculty"] = "all"

class Notification(NotificationIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FeeIn(BaseModel):
    student_email: str
    course_code: str
    amount: float
    semester: str

class Fee(FeeIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: Literal["pending", "paid"] = "pending"
    paid_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# =============================================================================
# AUTH ROUTES
# =============================================================================
@api.post("/auth/register", response_model=AuthOut)
async def register(data: RegisterIn):
    email = data.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": data.name,
        "role": data.role,
        "password_hash": hash_password(data.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    token = create_access_token(user_doc["id"], email, data.role)
    user_doc.pop("password_hash")
    user_doc.pop("_id", None)
    user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    return AuthOut(access_token=token, user=UserOut(**user_doc))

@api.post("/auth/login", response_model=AuthOut)
async def login(data: LoginIn):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], email, user["role"])
    created_at = user["created_at"]
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    return AuthOut(
        access_token=token,
        user=UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"], created_at=created_at),
    )

@api.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    created_at = user["created_at"]
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    return UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"], created_at=created_at)

# =============================================================================
# COURSES
# =============================================================================
@api.get("/courses", response_model=List[Course])
async def list_courses():
    docs = await db.courses.find({}, {"_id": 0}).to_list(100)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs

@api.get("/courses/{code}", response_model=Course)
async def get_course(code: str):
    doc = await db.courses.find_one({"code": code.upper()}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Course not found")
    if isinstance(doc.get("created_at"), str):
        doc["created_at"] = datetime.fromisoformat(doc["created_at"])
    return doc

@api.post("/courses", response_model=Course)
async def create_course(data: CourseIn, _: dict = Depends(require_role("admin"))):
    payload = data.model_dump()
    payload["code"] = payload["code"].upper()
    course = Course(**payload)
    doc = course.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.courses.insert_one(doc)
    return course

@api.delete("/courses/{course_id}")
async def delete_course(course_id: str, _: dict = Depends(require_role("admin"))):
    await db.courses.delete_one({"id": course_id})
    return {"ok": True}

# =============================================================================
# FACULTY
# =============================================================================
@api.get("/faculty", response_model=List[Faculty])
async def list_faculty():
    docs = await db.faculty.find({}, {"_id": 0}).to_list(200)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs

@api.post("/faculty", response_model=Faculty)
async def create_faculty(data: FacultyIn, _: dict = Depends(require_role("admin"))):
    f = Faculty(**data.model_dump())
    doc = f.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.faculty.insert_one(doc)
    return f

@api.delete("/faculty/{faculty_id}")
async def delete_faculty(faculty_id: str, _: dict = Depends(require_role("admin"))):
    await db.faculty.delete_one({"id": faculty_id})
    return {"ok": True}

# =============================================================================
# EVENTS
# =============================================================================
@api.get("/events", response_model=List[Event])
async def list_events():
    docs = await db.events.find({}, {"_id": 0}).sort("date", -1).to_list(200)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs

@api.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    doc = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Event not found")
    if isinstance(doc.get("created_at"), str):
        doc["created_at"] = datetime.fromisoformat(doc["created_at"])
    return doc

@api.post("/events", response_model=Event)
async def create_event(data: EventIn, _: dict = Depends(require_role("admin"))):
    e = Event(**data.model_dump())
    doc = e.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.events.insert_one(doc)
    return e

@api.delete("/events/{event_id}")
async def delete_event(event_id: str, _: dict = Depends(require_role("admin"))):
    await db.events.delete_one({"id": event_id})
    return {"ok": True}

# =============================================================================
# ALUMNI
# =============================================================================
@api.get("/alumni", response_model=List[Alumni])
async def list_alumni():
    return await db.alumni.find({}, {"_id": 0}).to_list(200)

@api.post("/alumni", response_model=Alumni)
async def create_alumni(data: AlumniIn, _: dict = Depends(require_role("admin"))):
    a = Alumni(**data.model_dump())
    await db.alumni.insert_one(a.model_dump())
    return a

# =============================================================================
# ADMISSIONS
# =============================================================================
@api.post("/admissions", response_model=Admission)
async def submit_admission(data: AdmissionIn):
    a = Admission(**data.model_dump())
    doc = a.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.admissions.insert_one(doc)
    return a

@api.get("/admissions", response_model=List[Admission])
async def list_admissions(_: dict = Depends(require_role("admin"))):
    docs = await db.admissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs

@api.patch("/admissions/{admission_id}")
async def update_admission(admission_id: str, status_value: str, _: dict = Depends(require_role("admin"))):
    if status_value not in ("pending", "accepted", "rejected"):
        raise HTTPException(400, "Invalid status")
    await db.admissions.update_one({"id": admission_id}, {"$set": {"status": status_value}})
    return {"ok": True}

# =============================================================================
# CONTACT
# =============================================================================
@api.post("/contact", response_model=ContactMsg)
async def post_contact(data: ContactIn):
    m = ContactMsg(**data.model_dump())
    doc = m.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.contact.insert_one(doc)
    return m

@api.get("/contact", response_model=List[ContactMsg])
async def list_contact(_: dict = Depends(require_role("admin"))):
    docs = await db.contact.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs

# =============================================================================
# MATERIALS
# =============================================================================
@api.get("/materials", response_model=List[Material])
async def list_materials(course_code: Optional[str] = None):
    q = {"course_code": course_code.upper()} if course_code else {}
    docs = await db.materials.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs

@api.post("/materials", response_model=Material)
async def create_material(data: MaterialIn, user: dict = Depends(require_role("admin", "faculty"))):
    payload = data.model_dump(exclude={"uploaded_by"})
    payload["uploaded_by"] = user["email"]
    m = Material(**payload)
    doc = m.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["course_code"] = doc["course_code"].upper()
    await db.materials.insert_one(doc)
    return m

@api.delete("/materials/{material_id}")
async def delete_material(material_id: str, _: dict = Depends(require_role("admin", "faculty"))):
    await db.materials.delete_one({"id": material_id})
    return {"ok": True}

# =============================================================================
# ATTENDANCE
# =============================================================================
@api.post("/attendance", response_model=Attendance)
async def mark_attendance(data: AttendanceIn, user: dict = Depends(require_role("admin", "faculty"))):
    a = Attendance(**data.model_dump(), marked_by=user["email"])
    doc = a.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.attendance.insert_one(doc)
    return a

@api.get("/attendance", response_model=List[Attendance])
async def list_attendance(student_email: Optional[str] = None, user: dict = Depends(get_current_user)):
    if user["role"] == "student":
        student_email = user["email"]
    q = {"student_email": student_email.lower()} if student_email else {}
    docs = await db.attendance.find(q, {"_id": 0}).sort("date", -1).to_list(500)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs

# =============================================================================
# NOTIFICATIONS
# =============================================================================
@api.get("/notifications", response_model=List[Notification])
async def list_notifications(user: dict = Depends(get_current_user)):
    role_filter = {"audience": {"$in": ["all", user["role"] + "s"]}}
    docs = await db.notifications.find(role_filter, {"_id": 0}).sort("created_at", -1).to_list(100)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs

@api.post("/notifications", response_model=Notification)
async def create_notification(data: NotificationIn, _: dict = Depends(require_role("admin"))):
    n = Notification(**data.model_dump())
    doc = n.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.notifications.insert_one(doc)
    return n

# =============================================================================
# FEES
# =============================================================================
@api.get("/fees", response_model=List[Fee])
async def list_fees(student_email: Optional[str] = None, user: dict = Depends(get_current_user)):
    if user["role"] == "student":
        student_email = user["email"]
    q = {"student_email": student_email.lower()} if student_email else {}
    docs = await db.fees.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in docs:
        for k in ("created_at", "paid_at"):
            if isinstance(d.get(k), str):
                d[k] = datetime.fromisoformat(d[k])
    return docs

@api.post("/fees", response_model=Fee)
async def create_fee(data: FeeIn, _: dict = Depends(require_role("admin"))):
    f = Fee(**data.model_dump())
    doc = f.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    if doc.get("paid_at"):
        doc["paid_at"] = doc["paid_at"].isoformat()
    await db.fees.insert_one(doc)
    return f

@api.post("/fees/{fee_id}/pay")
async def pay_fee(fee_id: str, user: dict = Depends(get_current_user)):
    fee = await db.fees.find_one({"id": fee_id}, {"_id": 0})
    if not fee:
        raise HTTPException(404, "Fee not found")
    if user["role"] == "student" and fee["student_email"].lower() != user["email"].lower():
        raise HTTPException(403, "Forbidden")
    await db.fees.update_one(
        {"id": fee_id},
        {"$set": {"status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"ok": True, "message": "Payment recorded (mock)."}

# =============================================================================
# ADMIN: USERS
# =============================================================================
@api.get("/users")
async def list_users(_: dict = Depends(require_role("admin"))):
    docs = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs

@api.delete("/users/{user_id}")
async def delete_user(user_id: str, _: dict = Depends(require_role("admin"))):
    await db.users.delete_one({"id": user_id})
    return {"ok": True}

# =============================================================================
# STATS (analytics)
# =============================================================================
@api.get("/stats")
async def stats():
    return {
        "students": await db.users.count_documents({"role": "student"}),
        "faculty": await db.faculty.count_documents({}),
        "courses": await db.courses.count_documents({}),
        "events": await db.events.count_documents({}),
        "alumni": await db.alumni.count_documents({}),
        "admissions": await db.admissions.count_documents({}),
    }

# =============================================================================
# HEALTH
# =============================================================================
@api.get("/")
async def root():
    return {"name": "CCAUVERY API", "status": "ok"}

# =============================================================================
# SEED DATA
# =============================================================================
async def seed_admin():
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "name": "CCAUVERY Admin",
            "role": "admin",
            "password_hash": hash_password(ADMIN_PASSWORD),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
        )

async def seed_demo_users():
    demos = [
        {"email": "faculty@ccauvery.edu", "name": "Dr. Anjali Rao", "role": "faculty", "password": "Faculty@123"},
        {"email": "student@ccauvery.edu", "name": "Rohan Kumar", "role": "student", "password": "Student@123"},
    ]
    for d in demos:
        if not await db.users.find_one({"email": d["email"]}):
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "email": d["email"],
                "name": d["name"],
                "role": d["role"],
                "password_hash": hash_password(d["password"]),
                "created_at": datetime.now(timezone.utc).isoformat(),
            })

async def seed_courses():
    if await db.courses.count_documents({}) > 0:
        return
    courses_data = [
        {
            "code": "BCA", "name": "Bachelor of Computer Applications",
            "duration": "3 Years (6 Semesters)", "fees": 45000,
            "description": "A future-focused BCA programme blending innovation, coding excellence and cutting-edge technology. Students master full-stack web development with AI, Android development, data science, DevOps & cloud computing, and game development through hands-on labs and live projects.",
            "eligibility": "Pass in 10+2 (PUC / 12th) from any recognised board, with Mathematics or Computer Science as one of the subjects (minimum 45% aggregate, 40% for SC/ST/OBC).",
            "syllabus": [
                "Year 1 — Fundamentals of Information Technology",
                "Year 1 — Problem Solving using C",
                "Year 1 — Computational Mathematics",
                "Year 1 — Data Structures using C",
                "Year 1 — Database Management Systems",
                "Year 1 — Computer Architecture",
                "Year 2 — Object Oriented Programming with Java",
                "Year 2 — Operating Systems & Computer Networks",
                "Year 2 — Web Technologies (HTML, CSS, JavaScript, React)",
                "Year 2 — Software Engineering & Agile",
                "Year 3 — Artificial Intelligence & Machine Learning",
                "Year 3 — Cloud Computing & DevOps",
                "Year 3 — Mobile Application Development (Android/Kotlin)",
                "Year 3 — Data Science & Analytics",
                "Year 3 — Major Project & Industry Internship",
            ],
            "careers": [
                "Full Stack Developer", "AI / ML Engineer", "Android Developer",
                "Data Analyst", "Data Scientist", "Cloud Engineer",
                "DevOps Engineer", "UI / UX Designer", "Game Developer",
            ],
            "image": "https://res.cloudinary.com/dveiiup8m/image/upload/v1777906273/gallery-assets/bca/lab/lab.png",
        },
        {
            "code": "BBA", "name": "Bachelor of Business Administration",
            "duration": "3 Years (6 Semesters)", "fees": 38000,
            "description": "An industry-aligned management programme that builds future business leaders. Students gain real-world exposure to finance, marketing, human resources, entrepreneurship and digital strategy through case studies, industry visits and live projects with Kodagu's coffee, hospitality and agri-business sectors.",
            "eligibility": "Pass in 10+2 from any recognised board (any stream), with minimum 40% aggregate.",
            "syllabus": [
                "Principles & Practices of Management",
                "Financial Accounting & Reporting",
                "Marketing Management",
                "Human Resource Management",
                "Business Statistics & Quantitative Methods",
                "Business Communication & Soft Skills",
                "Entrepreneurship Development",
                "Business Law & Ethics",
                "Operations & Supply Chain Management",
                "Strategic Management",
                "Digital Marketing & E-Commerce",
                "Business Analytics with Excel & Power BI",
            ],
            "careers": [
                "Business Analyst", "Marketing Executive", "HR Associate",
                "Operations Manager", "Entrepreneur", "Banking Officer",
                "Sales Manager", "Management Consultant",
            ],
            "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
        },
        {
            "code": "BCOM", "name": "Bachelor of Commerce",
            "duration": "3 Years (6 Semesters)", "fees": 32000,
            "description": "A rigorous foundation in accounting, taxation, finance, economics, banking and corporate law. Designed for careers in Chartered Accountancy, banking, finance, taxation and the global commerce ecosystem. Mangalore University-affiliated curriculum with practical exposure through Tally, GST filing and audit simulations.",
            "eligibility": "Pass in 10+2 in Commerce / Arts / Science from any recognised board, with minimum 40% aggregate.",
            "syllabus": [
                "Financial Accounting",
                "Corporate Accounting",
                "Cost & Management Accounting",
                "Income Tax & GST",
                "Business Law & Company Law",
                "Auditing & Assurance",
                "Banking & Insurance",
                "Financial Management",
                "International Business",
                "Business Statistics & Mathematics",
                "Tally ERP & Computerised Accounting",
                "Entrepreneurship & Small Business Management",
            ],
            "careers": [
                "Chartered Accountant (CA)", "Cost & Management Accountant (CMA)",
                "Banking Officer", "Tax Consultant", "Financial Analyst",
                "Auditor", "Stock Broker", "Insurance Specialist",
            ],
            "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
        },
    ]
    for c in courses_data:
        course = Course(**c)
        doc = course.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.courses.insert_one(doc)

async def seed_faculty():
    if await db.faculty.count_documents({}) > 0:
        return
    fac = [
        {"name": "Prof. M.B. Kaverappa", "designation": "Principal", "qualification": "M.A., M.Phil., Ph.D.", "department": "Administration",
         "email": "principal@ccauvery.edu",
         "bio": "“At Cauvery College, Gonikoppal, we are moving boldly — and concertedly — to expand tomorrow's frontiers. We believe that we have the power to shape the future, for the better.”",
         "photo": "https://www.bcacauverycollege.com/images/uploads/kaverappa.jpg"},
        {"name": "Sri Pemmaiah U.T", "designation": "Head of Department — BCA", "qualification": "MCA, Ph.D. (Pursuing)", "department": "BCA",
         "email": "hod.bca@ccauvery.edu",
         "bio": "Leads the BCA department's vision of building industry-ready graduates through hands-on coding culture and AI-first curriculum.",
         "photo": "https://www.bcacauverycollege.com/images/uploads/phemmaiah.jpg"},
        {"name": "Miss Bojamma K.K", "designation": "Assistant Professor", "qualification": "M.Sc.(CS), B.Ed., UGC-NET", "department": "BCA",
         "email": "bojamma@ccauvery.edu",
         "bio": "Specialises in computer science fundamentals; recently completed an FDP on Artificial Intelligence to bring updated insights to students.",
         "photo": "https://www.bcacauverycollege.com/images/uploads/bojamma.jpg"},
        {"name": "Smt Pallavi K.S", "designation": "Assistant Professor", "qualification": "B.E., M.Sc.(CS)", "department": "BCA",
         "email": "pallavi.ks@ccauvery.edu",
         "bio": "Engineering background with focus on programming languages and software engineering; completed FDP on AI.",
         "photo": "https://www.bcacauverycollege.com/images/uploads/pallaviKs.jpg"},
        {"name": "Smt Accamma N.B", "designation": "Assistant Professor", "qualification": "MCA, B.Ed.", "department": "BCA",
         "email": "accamma@ccauvery.edu",
         "bio": "Mentors students in database systems and web technologies with a passion for student-centric pedagogy.",
         "photo": "https://www.bcacauverycollege.com/images/uploads/accamma.jpg"},
        {"name": "Smt Vedhashree C.G", "designation": "Assistant Professor", "qualification": "B.E., M.Tech., B.Ed.", "department": "BCA",
         "email": "vedhashree@ccauvery.edu",
         "bio": "Teaches computer architecture and operating systems; brings cross-disciplinary engineering expertise.",
         "photo": "https://www.bcacauverycollege.com/images/uploads/vedashree.jpg"},
        {"name": "Miss Pallavi H.R", "designation": "Assistant Professor", "qualification": "MCA", "department": "BCA",
         "email": "pallavi.hr@ccauvery.edu",
         "bio": "Focused on full-stack web development and modern JavaScript frameworks.",
         "photo": "https://www.bcacauverycollege.com/images/uploads/pallavihr.jpg"},
        {"name": "Sri Surya Thej S", "designation": "Assistant Professor", "qualification": "M.Sc. (Data Science)", "department": "BCA",
         "email": "surya.thej@ccauvery.edu",
         "bio": "Drives the Data Science specialisation — Python, ML pipelines, and analytics labs.",
         "photo": "https://www.bcacauverycollege.com/images/uploads/surya.jpg"},
        {"name": "Smt Shilpa P.G", "designation": "Assistant Professor", "qualification": "B.E., M.Tech.", "department": "BCA",
         "email": "shilpa@ccauvery.edu",
         "bio": "Cloud computing and DevOps mentor; conducts certification training workshops.",
         "photo": "https://www.bcacauverycollege.com/images/uploads/shilpa.jpg"},
        {"name": "Miss Deepthi B P", "designation": "Assistant Professor", "qualification": "MCA", "department": "BCA",
         "email": "deepthi@ccauvery.edu",
         "bio": "Mentors students in mobile app development (Android/Kotlin) and final year projects.",
         "photo": "https://www.bcacauverycollege.com/images/uploads/deepthi.jpg"},
        {"name": "Miss Kussum T", "designation": "Assistant Professor", "qualification": "MCA", "department": "BCA",
         "email": "kussum@ccauvery.edu",
         "bio": "Computer applications expert; guides students through DSA, Java and software engineering.",
         "photo": "https://www.bcacauverycollege.com/images/uploads/kusum.jpg"},
        {"name": "Sri Vachan S D", "designation": "Assistant Professor", "qualification": "M.Sc. — Mathematics", "department": "BCA",
         "email": "vachan@ccauvery.edu",
         "bio": "Computational mathematics & discrete structures — the rigour behind every CS curriculum.",
         "photo": "https://www.bcacauverycollege.com/images/uploads/vachan.jpg"},
        {"name": "Miss Nandana K R", "designation": "Lab Programmer", "qualification": "BCA, MCA (Pursuing)", "department": "BCA",
         "email": "nandana@ccauvery.edu",
         "bio": "Runs the programming labs and supports student projects from idea to deployment.",
         "photo": "https://www.bcacauverycollege.com/images/uploads/nandana.jpg"},
        {"name": "Miss Pooja P J", "designation": "Lab Programmer", "qualification": "BCA, MCA (Pursuing)", "department": "BCA",
         "email": "pooja@ccauvery.edu",
         "bio": "Lab programmer specialising in web technologies and student support.",
         "photo": "https://www.bcacauverycollege.com/images/uploads/pooja.jpg"},
        {"name": "Sri Harry C.M", "designation": "System Administrator", "qualification": "IT Support & Systems", "department": "BCA",
         "email": "harry@ccauvery.edu",
         "bio": "Keeps every lab, server and Wi-Fi network on campus running like clockwork.",
         "photo": "https://res.cloudinary.com/dveiiup8m/image/upload/v1777900127/faculty/qv4yqdlquvpqr858vsas.jpg"},
    ]
    for f in fac:
        obj = Faculty(**f)
        doc = obj.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.faculty.insert_one(doc)

async def seed_events():
    if await db.events.count_documents({}) > 0:
        return
    events = [
        {"title": "Techantlers — Annual Tech Fest", "date": "2026-03-12",
         "location": "Main Auditorium, Cauvery College", "category": "Technical Festival",
         "description": "Cauvery's flagship 3-day technology festival featuring hackathons, project showcases, robotics demos, AI workshops and expert talks from industry leaders. Open to students from across Kodagu.",
         "image": "https://www.bcacauverycollege.com/images/uploads/fest.JPG"},
        {"title": "5-Day Machine Learning Workshop", "date": "2026-04-06",
         "location": "BCA Computer Lab", "category": "Workshop",
         "description": "Intensive hands-on bootcamp covering Python for ML, supervised & unsupervised algorithms, model evaluation, and deploying a live ML project. Conducted by faculty + industry mentors.",
         "image": "https://res.cloudinary.com/dveiiup8m/image/upload/v1777890455/events/idwuh4en6cv894llhkis.jpg"},
        {"title": "AI / ML Hackathon Series", "date": "2026-02-22",
         "location": "BCA Department Block", "category": "Coding Competition",
         "description": "24-hour hackathons held monthly. Teams build AI-powered solutions to real social problems — from agri-tech for Kodagu coffee farmers to healthcare chatbots.",
         "image": "https://www.bcacauverycollege.com/images/uploads/hackathon.JPG"},
        {"title": "Full Stack Web Development Workshop", "date": "2026-01-18",
         "location": "Lab 2, BCA Block", "category": "Hands-on Training",
         "description": "Weekly 30-hour series on building production-grade apps with React, Node.js and modern databases. Capstone: launching a working SaaS product.",
         "image": "https://www.bcacauverycollege.com/images/uploads/11.JPG"},
        {"title": "Cauvery Premiere League (CPL)", "date": "2025-10-10",
         "location": "Cauvery College Sports Ground", "category": "Sports",
         "description": "2-day inter-departmental cricket tournament celebrating sportsmanship and team spirit. A flagship event of the Department of Physical Education.",
         "image": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200"},
        {"title": "Mini & Final-Year Project Expo", "date": "2026-05-20",
         "location": "BCA Department Block", "category": "Project Showcase",
         "description": "End-of-semester showcase where every BCA team demos their working application — from mobile apps to AI tools — reviewed by faculty and industry mentors.",
         "image": "https://www.bcacauverycollege.com/images/uploads/project.JPG"},
        {"title": "Cloud Computing Certification Workshop", "date": "2026-03-28",
         "location": "Seminar Hall", "category": "Certification",
         "description": "20-hour bi-annual workshop covering AWS, Azure, Docker and Kubernetes basics. Includes a hands-on capstone project and certificate.",
         "image": "https://www.bcacauverycollege.com/images/uploads/cloud.JPG"},
        {"title": "Industrial Visits & Internship Drive", "date": "2026-02-15",
         "location": "Bengaluru IT Corridor", "category": "Industry Exposure",
         "description": "Curated monthly visits to leading IT companies and partner firms — Infosys, Wipro, Happiest Minds — culminating in summer internship offers.",
         "image": "https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=1200"},
        {"title": "Swachh Bharat & NSS Activities", "date": "2025-11-05",
         "location": "Around Gonikoppal Town", "category": "Social Impact",
         "description": "Past event — students of the National Service Scheme led monthly cleanliness drives, tree plantation and rural awareness campaigns across Kodagu villages.",
         "image": "https://www.bcacauverycollege.com/images/uploads/swachBharath.JPG"},
    ]
    for e in events:
        obj = Event(**e)
        doc = obj.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.events.insert_one(doc)

async def seed_alumni():
    if await db.alumni.count_documents({}) > 0:
        return
    alumni = [
        {"name": "Abhishek B N", "batch": "BCA 2023", "role": "Software Engineer", "company": "Equalize RCM",
         "story": "The practical exposure and coding culture at Cauvery BCA helped me crack my placement with confidence. From writing my first 'Hello World' to deploying production code — every step had a mentor.",
         "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"},
        {"name": "Shawn Codava K S", "batch": "BCA 2024", "role": "Software Developer Intern", "company": "Tech Startup, Bengaluru",
         "story": "From zero coding knowledge to deploying real apps — this journey was transformational. The faculty's mentorship and the lab culture made all the difference.",
         "photo": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80"},
        {"name": "Prathvin T R", "batch": "BCA 2022", "role": "Full Stack Developer", "company": "Invenzo Labs Pvt Ltd",
         "story": "The mentorship and real-world projects gave me an edge over others in interviews. Final-year project expo prepared me to pitch and ship.",
         "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80"},
        {"name": "Ananya R", "batch": "BCA 2023", "role": "UI / UX Designer", "company": "Sigma Networks",
         "story": "Design thinking and creativity were strongly encouraged at Cauvery — I found my passion here and turned it into a career.",
         "photo": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80"},
        {"name": "Sneha M", "batch": "BCA 2024", "role": "Android Developer", "company": "SPTech",
         "story": "Publishing my first app on Play Store during college was a dream come true. The mobile development workshop and project guidance made it possible.",
         "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"},
        {"name": "Nithin V", "batch": "BCA 2023", "role": "Cloud Engineer", "company": "Happiest Minds",
         "story": "Workshops and certifications gave me real industry readiness. Cauvery's cloud workshop got me my first AWS certification before graduation.",
         "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80"},
        {"name": "Divya S", "batch": "BCA 2022", "role": "Data Analyst", "company": "Capgemini",
         "story": "The exposure to analytics tools and datasets was incredibly valuable. From Excel to Power BI to Python — I built every layer of my data career here.",
         "photo": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80"},
        {"name": "Pooja K", "batch": "BCA 2024", "role": "Frontend Developer", "company": "Wipro",
         "story": "I gained confidence, skills, and clarity about my career path. The placement training cell prepared me end-to-end for the interview process.",
         "photo": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80"},
    ]
    for a in alumni:
        obj = Alumni(**a)
        await db.alumni.insert_one(obj.model_dump())

async def seed_demo_data():
    # demo materials, attendance, fees, notifications for student@ccauvery.edu
    if await db.materials.count_documents({}) == 0:
        mats = [
            {"title": "Data Structures - Lecture Notes (Unit 1)", "course_code": "BCA", "description": "Arrays, Linked Lists, Stacks & Queues.", "file_url": "https://example.com/ds-unit1.pdf", "uploaded_by": "faculty@ccauvery.edu"},
            {"title": "DBMS Lab Manual", "course_code": "BCA", "description": "SQL exercises and ER modelling.", "file_url": "https://example.com/dbms-lab.pdf", "uploaded_by": "faculty@ccauvery.edu"},
            {"title": "Marketing Management Casebook", "course_code": "BBA", "description": "10 case studies for semester 4.", "file_url": "https://example.com/mm-cases.pdf", "uploaded_by": "faculty@ccauvery.edu"},
            {"title": "Income Tax Reckoner 2026", "course_code": "BCOM", "description": "Updated rates & deductions.", "file_url": "https://example.com/tax-2026.pdf", "uploaded_by": "faculty@ccauvery.edu"},
        ]
        for m in mats:
            obj = Material(**m)
            doc = obj.model_dump()
            doc["created_at"] = doc["created_at"].isoformat()
            await db.materials.insert_one(doc)

    if await db.fees.count_documents({}) == 0:
        await db.fees.insert_one({
            **Fee(student_email="student@ccauvery.edu", course_code="BCA", amount=22500, semester="Sem 4").model_dump(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        await db.fees.insert_one({
            "id": str(uuid.uuid4()), "student_email": "student@ccauvery.edu", "course_code": "BCA",
            "amount": 22500, "semester": "Sem 3", "status": "paid",
            "paid_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    if await db.attendance.count_documents({}) == 0:
        from random import choice
        days = 20
        for i in range(days):
            d = (datetime.now(timezone.utc) - timedelta(days=i)).date().isoformat()
            await db.attendance.insert_one({
                "id": str(uuid.uuid4()), "student_email": "student@ccauvery.edu",
                "course_code": "BCA", "date": d,
                "status": choice(["present", "present", "present", "absent"]),
                "marked_by": "faculty@ccauvery.edu",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })

    if await db.notifications.count_documents({}) == 0:
        notifs = [
            {"title": "Mid-Sem Exams Begin Mar 2", "message": "Hall tickets to be downloaded by Feb 25.", "audience": "students"},
            {"title": "Faculty Meeting - Friday 4pm", "message": "Agenda: TechFest planning.", "audience": "faculty"},
            {"title": "Library Hours Extended", "message": "Library now open till 9 PM during exams.", "audience": "all"},
        ]
        for n in notifs:
            obj = Notification(**n)
            doc = obj.model_dump()
            doc["created_at"] = doc["created_at"].isoformat()
            await db.notifications.insert_one(doc)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.courses.create_index("code", unique=True)
    await seed_admin()
    await seed_demo_users()
    await seed_courses()
    await seed_faculty()
    await seed_events()
    await seed_alumni()
    await seed_demo_data()

@app.on_event("shutdown")
async def shutdown():
    client.close()

# Mount router
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
