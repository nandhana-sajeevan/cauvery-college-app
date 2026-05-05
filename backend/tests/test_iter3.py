"""Iteration 3 tests: BA/BSC courses, Projects, Stripe checkout"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN = {"email": "admin@ccauvery.edu", "password": "Admin@123"}
FACULTY = {"email": "faculty@ccauvery.edu", "password": "Faculty@123"}
STUDENT = {"email": "student@ccauvery.edu", "password": "Student@123"}


def _login(creds):
    r = requests.post(f"{API}/auth/login", json=creds, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def h(t):
    return {"Authorization": f"Bearer {t}"}


@pytest.fixture(scope="module")
def admin_token():
    return _login(ADMIN)


@pytest.fixture(scope="module")
def faculty_token():
    return _login(FACULTY)


@pytest.fixture(scope="module")
def student_token():
    return _login(STUDENT)


# -------- Courses (5 expected) --------
class TestCourses5:
    def test_courses_count_and_codes(self):
        r = requests.get(f"{API}/courses")
        assert r.status_code == 200
        codes = {c["code"] for c in r.json()}
        assert {"BCA", "BBA", "BCOM", "BA", "BSC"}.issubset(codes), f"Got {codes}"

    def test_ba_detail(self):
        r = requests.get(f"{API}/courses/BA")
        assert r.status_code == 200
        d = r.json()
        assert d["code"] == "BA"
        assert len(d["syllabus"]) > 0
        assert len(d["careers"]) > 0

    def test_bsc_detail(self):
        r = requests.get(f"{API}/courses/BSC")
        assert r.status_code == 200
        d = r.json()
        assert d["code"] == "BSC"
        assert len(d["syllabus"]) > 0
        assert len(d["careers"]) > 0


# -------- Projects --------
class TestProjects:
    def test_list_projects_public(self):
        r = requests.get(f"{API}/projects")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 6
        for p in data:
            assert "title" in p
            assert "image" in p or p.get("image") is None
            assert "tags" in p

    def test_known_titles_present(self):
        r = requests.get(f"{API}/projects")
        titles = {p["title"] for p in r.json()}
        assert "Cauvery College App" in titles
        assert "ClassBee" in titles

    def test_create_project_no_auth(self):
        r = requests.post(f"{API}/projects", json={
            "title": "X", "student_name": "y", "batch": "2024",
            "category": "Web", "description": "d"
        })
        assert r.status_code == 401

    def test_create_project_as_admin(self, admin_token):
        r = requests.post(f"{API}/projects", headers=h(admin_token), json={
            "title": f"TEST_proj_{uuid.uuid4().hex[:6]}",
            "student_name": "TEST",
            "batch": "BCA 2025",
            "category": "Web App",
            "description": "test desc",
            "tags": ["x"]
        })
        assert r.status_code == 200, r.text
        d = r.json()
        assert "id" in d
        assert d["category"] == "Web App"


# -------- Stripe Checkout --------
class TestStripeCheckout:
    def _make_fee(self, admin_token):
        r = requests.post(f"{API}/fees", headers=h(admin_token), json={
            "student_email": "student@ccauvery.edu",
            "course_code": "BCA",
            "amount": 1500,
            "semester": f"TEST_{uuid.uuid4().hex[:4]}"
        })
        assert r.status_code == 200, r.text
        return r.json()["id"]

    def test_checkout_no_auth(self, admin_token):
        fee_id = self._make_fee(admin_token)
        r = requests.post(f"{API}/fees/{fee_id}/checkout", json={
            "fee_id": fee_id, "origin_url": "https://example.com"
        })
        assert r.status_code == 401

    def test_checkout_creates_session(self, admin_token, student_token):
        fee_id = self._make_fee(admin_token)
        r = requests.post(
            f"{API}/fees/{fee_id}/checkout",
            headers=h(student_token),
            json={"fee_id": fee_id, "origin_url": "https://example.com"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert "url" in d and "session_id" in d
        assert d["url"].startswith("https://checkout.stripe.com/"), d["url"]
        assert d["session_id"].startswith("cs_test_"), d["session_id"]
        # status endpoint should report 'open'
        s = requests.get(f"{API}/payments/status/{d['session_id']}", headers=h(student_token), timeout=30)
        assert s.status_code == 200, s.text
        sd = s.json()
        assert sd["payment_status"] in ("unpaid", "open", "no_payment_required")
        assert sd["status"] in ("open", "complete", "expired")

    def test_checkout_for_other_student_forbidden(self, admin_token, student_token):
        # create fee belonging to another student
        r = requests.post(f"{API}/fees", headers=h(admin_token), json={
            "student_email": "someoneelse@ccauvery.edu",
            "course_code": "BCA", "amount": 500, "semester": "TEST_other"
        })
        assert r.status_code == 200
        fee_id = r.json()["id"]
        r2 = requests.post(
            f"{API}/fees/{fee_id}/checkout",
            headers=h(student_token),
            json={"fee_id": fee_id, "origin_url": "https://example.com"},
            timeout=30,
        )
        assert r2.status_code == 403, r2.text

    def test_checkout_already_paid(self, admin_token, student_token):
        fee_id = self._make_fee(admin_token)
        # mark paid via existing /pay endpoint
        rp = requests.post(f"{API}/fees/{fee_id}/pay", headers=h(student_token))
        assert rp.status_code == 200
        # now checkout should 400
        r = requests.post(
            f"{API}/fees/{fee_id}/checkout",
            headers=h(student_token),
            json={"fee_id": fee_id, "origin_url": "https://example.com"},
            timeout=30,
        )
        assert r.status_code == 400, r.text

    def test_checkout_fee_not_found(self, student_token):
        r = requests.post(
            f"{API}/fees/does-not-exist/checkout",
            headers=h(student_token),
            json={"fee_id": "x", "origin_url": "https://example.com"},
            timeout=30,
        )
        assert r.status_code == 404

    def test_payment_status_unknown_session(self, student_token):
        r = requests.get(f"{API}/payments/status/cs_test_unknown_xyz", headers=h(student_token), timeout=30)
        assert r.status_code == 404
