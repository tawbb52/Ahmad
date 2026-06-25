import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

HOST = "0.0.0.0"
PORT = 8000
JWT_SECRET = os.getenv("JWT_SECRET", "xtream-change-this-secret")
JWT_EXP_SECONDS = 3600


def b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("utf-8")


def b64url_decode(raw: str) -> bytes:
    padding = "=" * (-len(raw) % 4)
    return base64.urlsafe_b64decode(raw + padding)


def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    salt, expected = stored.split("$", 1)
    return hmac.compare_digest(hash_password(password, salt).split("$", 1)[1], expected)


def create_jwt(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    body = {**payload, "exp": int(time.time()) + JWT_EXP_SECONDS}
    h64 = b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    b64 = b64url_encode(json.dumps(body, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{h64}.{b64}".encode("utf-8")
    sig = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    return f"{h64}.{b64}.{b64url_encode(sig)}"


def verify_jwt(token: str) -> dict | None:
    try:
        h64, b64, s64 = token.split(".")
        signing_input = f"{h64}.{b64}".encode("utf-8")
        expected_sig = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
        if not hmac.compare_digest(expected_sig, b64url_decode(s64)):
            return None
        payload = json.loads(b64url_decode(b64).decode("utf-8"))
        if int(payload.get("exp", 0)) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


users = [
    {
        "id": 1,
        "username": "admin",
        "password_hash": hash_password("Admin@123"),
        "plan": "Premium",
        "fee": 20,
        "status": "active",
        "active_sessions": 0,
    },
    {
        "id": 2,
        "username": "viewer_01",
        "password_hash": hash_password("Viewer@123"),
        "plan": "Standard",
        "fee": 10,
        "status": "active",
        "active_sessions": 1,
    },
]

channels = [
    {"id": 1, "name": "Sports 1", "quality": "FHD", "is_live": True},
    {"id": 2, "name": "Movies Max", "quality": "HD", "is_live": True},
    {"id": 3, "name": "Kids World", "quality": "SD", "is_live": False},
]

payments = []
invoices = []
access_logs = []


def auth_required(handler: BaseHTTPRequestHandler):
    auth = handler.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    return verify_jwt(auth.split(" ", 1)[1])


class XtreamAPI(BaseHTTPRequestHandler):
    def _send_json(self, code: int, payload: dict | list):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def _json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if not length:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def do_OPTIONS(self):
        self._send_json(200, {"ok": True})

    def do_POST(self):
        route = urlparse(self.path).path
        data = self._json_body()

        if route == "/api/auth/login":
            username = data.get("username", "")
            password = data.get("password", "")
            user = next((u for u in users if u["username"] == username), None)
            success = bool(user and verify_password(password, user["password_hash"]))
            access_logs.append({"timestamp": int(time.time()), "username": username, "success": success})
            if not success:
                self._send_json(401, {"error": "Invalid credentials"})
                return
            user["active_sessions"] += 1
            token = create_jwt({"sub": str(user["id"]), "username": user["username"]})
            self._send_json(200, {"token": token, "expires_in": JWT_EXP_SECONDS})
            return

        if not auth_required(self):
            self._send_json(401, {"error": "Unauthorized"})
            return

        if route == "/api/users":
            new_user = {
                "id": max([u["id"] for u in users], default=0) + 1,
                "username": data["username"],
                "password_hash": hash_password(data["password"]),
                "plan": data.get("plan", "Basic"),
                "fee": float(data.get("fee", 0)),
                "status": data.get("status", "active"),
                "active_sessions": 0,
            }
            users.append(new_user)
            safe_user = {k: v for k, v in new_user.items() if k != "password_hash"}
            self._send_json(201, safe_user)
            return

        if route == "/api/channels":
            new_channel = {
                "id": max([c["id"] for c in channels], default=0) + 1,
                "name": data["name"],
                "quality": data.get("quality", "HD"),
                "is_live": bool(data.get("is_live", False)),
            }
            channels.append(new_channel)
            self._send_json(201, new_channel)
            return

        if route == "/api/payments":
            payment = {
                "id": len(payments) + 1,
                "user_id": int(data["user_id"]),
                "amount": float(data["amount"]),
                "method": data.get("method", "stripe"),
                "status": "paid",
                "timestamp": int(time.time()),
            }
            invoice = {
                "id": len(invoices) + 1000,
                "user_id": payment["user_id"],
                "payment_id": payment["id"],
                "amount": payment["amount"],
                "status": "issued",
            }
            payments.append(payment)
            invoices.append(invoice)
            self._send_json(201, {"payment": payment, "invoice": invoice})
            return

        self._send_json(404, {"error": "Not found"})

    def do_GET(self):
        route = urlparse(self.path).path

        if route == "/api/health":
            self._send_json(200, {"status": "ok", "service": "xtream-dashboard-api"})
            return

        if not auth_required(self):
            self._send_json(401, {"error": "Unauthorized"})
            return

        if route == "/api/dashboard":
            daily_revenue = sum(p["amount"] for p in payments)
            payload = {
                "active_users": len([u for u in users if u["status"] == "active"]),
                "channels": len(channels),
                "live_streams": len([c for c in channels if c["is_live"]]),
                "daily_revenue": round(daily_revenue, 2),
            }
            self._send_json(200, payload)
            return

        if route == "/api/users":
            safe_users = [{k: v for k, v in u.items() if k != "password_hash"} for u in users]
            self._send_json(200, safe_users)
            return

        if route == "/api/channels":
            self._send_json(200, channels)
            return

        if route == "/api/streams":
            self._send_json(200, [c for c in channels if c["is_live"]])
            return

        if route == "/api/invoices":
            self._send_json(200, invoices)
            return

        if route == "/api/security/access-logs":
            self._send_json(200, access_logs[-50:])
            return

        self._send_json(404, {"error": "Not found"})

    def do_PUT(self):
        route = urlparse(self.path).path
        if not auth_required(self):
            self._send_json(401, {"error": "Unauthorized"})
            return

        if route.startswith("/api/users/"):
            user_id = int(route.rsplit("/", 1)[1])
            data = self._json_body()
            user = next((u for u in users if u["id"] == user_id), None)
            if not user:
                self._send_json(404, {"error": "User not found"})
                return
            for field in ("plan", "fee", "status"):
                if field in data:
                    user[field] = data[field]
            self._send_json(200, {k: v for k, v in user.items() if k != "password_hash"})
            return

        self._send_json(404, {"error": "Not found"})

    def do_DELETE(self):
        route = urlparse(self.path).path
        if not auth_required(self):
            self._send_json(401, {"error": "Unauthorized"})
            return

        if route.startswith("/api/users/"):
            user_id = int(route.rsplit("/", 1)[1])
            idx = next((i for i, u in enumerate(users) if u["id"] == user_id), None)
            if idx is None:
                self._send_json(404, {"error": "User not found"})
                return
            deleted = users.pop(idx)
            self._send_json(200, {"deleted": deleted["id"]})
            return

        self._send_json(404, {"error": "Not found"})


if __name__ == "__main__":
    print(f"Xtream IPTV API running on http://{HOST}:{PORT}")
    HTTPServer((HOST, PORT), XtreamAPI).serve_forever()
