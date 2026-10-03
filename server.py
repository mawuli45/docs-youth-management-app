from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import time
from http.cookies import CookieError, SimpleCookie
from decimal import Decimal, InvalidOperation
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urlsplit
from urllib.request import Request, urlopen

APP_DIR = Path(__file__).resolve().parent
ROOT_DIR = APP_DIR
DATABASE_PATH = os.environ.get('DATABASE_PATH', '').strip()
DB_FILE = (
    Path(DATABASE_PATH).expanduser()
    if DATABASE_PATH
    else APP_DIR / 'mmogcc_youth.db'
)
PAYSTACK_API_URL = 'https://api.paystack.co'
PAYMENT_CURRENCY = 'GHS'
ADMIN_SESSION_COOKIE = 'mmogcc_admin_session'
ADMIN_SESSION_MAX_AGE = 8 * 60 * 60


def payment_matches(payment, data, reference):
    customer = data.get('customer')
    return (
        data.get('status') == 'success'
        and data.get('reference') == reference
        and data.get('amount') == payment['amount']
        and data.get('currency') == payment['currency']
        and isinstance(customer, dict)
        and str(customer.get('email', '')).strip().lower() == payment['member_email']
    )


DEFAULT_STATE = {
    'events': [
        {
            'title': 'MMOGCC YOUTH Clean-Up Drive',
            'date': '2026-09-20',
            'venue': 'MMOGCC YOUTH Community Park',
            'category': 'Outreach',
            'description': 'Join us for a neighborhood cleanup and MMOGCC YOUTH awareness campaign.',
            'poster': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
        },
        {
            'title': 'MMOGCC YOUTH Leadership & Public Speaking Workshop',
            'date': '2026-09-24',
            'venue': 'MMOGCC YOUTH Center',
            'category': 'Workshop',
            'description': 'An interactive session on confidence-building, public speaking, and service leadership.',
            'poster': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
        },
        {
            'title': 'MMOGCC YOUTH Career Mentorship Meetup',
            'date': '2026-10-02',
            'venue': 'MMOGCC YOUTH Innovation Hub',
            'category': 'Training',
            'description': 'Connect with mentors and learn practical career pathways for young adults within MMOGCC YOUTH.',
            'poster': 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
        },
    ],
    'gallery': [
        {
            'title': 'MMOGCC YOUTH Training Session',
            'category': 'Training',
            'image': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
        },
        {
            'title': 'MMOGCC YOUTH Outreach Mission',
            'category': 'Outreach',
            'image': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80',
        },
        {
            'title': 'MMOGCC YOUTH Creative Workshop',
            'category': 'Workshop',
            'image': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
        },
        {
            'title': 'MMOGCC YOUTH Talent Showcase Night',
            'category': 'Social',
            'image': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
        },
    ],
    'members': [
        {
            'name': 'Sarah Mantey',
            'role': 'MMOGCC YOUTH Program Lead',
            'engagement': '96%',
            'status': 'Active',
        },
        {
            'name': 'James Owusu',
            'role': 'MMOGCC YOUTH Volunteer Coordinator',
            'engagement': '89%',
            'status': 'Active',
        },
        {
            'name': 'Amina Salifu',
            'role': 'MMOGCC YOUTH Media & Outreach',
            'engagement': '83%',
            'status': 'Pending',
        },
        {
            'name': 'Daniel Koduah',
            'role': 'MMOGCC YOUTH Mentor',
            'engagement': '74%',
            'status': 'Review',
        },
    ],
    'announcements': [
        {
            'title': 'MMOGCC YOUTH council meeting rescheduled',
            'summary': 'The MMOGCC YOUTH council meeting has moved to Thursday at 4:00 PM to allow wider participation across the organization.',
            'tone': 'Update',
        },
        {
            'title': 'Volunteer recruitment open',
            'summary': 'Applications for MMOGCC YOUTH outreach volunteers are now open for the next community drive.',
            'tone': 'Call to action',
        },
        {
            'title': 'Scholarship opportunity shared',
            'summary': 'A new scholarship support desk is available for members seeking career guidance and formation support within MMOGCC YOUTH.',
            'tone': 'Support',
        },
    ],
    'executives': [
        {
            'name': 'Grace Wiafe',
            'role': 'MMOGCC YOUTH Chair',
            'focus': 'Leadership',
            'quote': 'Empowering every MMOGCC YOUTH member to lead with faith and purpose.',
            'initials': 'GW',
        },
        {
            'name': 'Kevin Tetteh',
            'role': 'MMOGCC YOUTH Programs Director',
            'focus': 'Impact',
            'quote': 'Strong programs create lasting transformation in our MMOGCC YOUTH community.',
            'initials': 'KT',
        },
        {
            'name': 'Lilian Mensah',
            'role': 'MMOGCC YOUTH Community Relations Lead',
            'focus': 'Engagement',
            'quote': 'Every voice deserves a seat at the table in MMOGCC YOUTH.',
            'initials': 'LM',
        },
    ],
    'activities': [],
}


def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def ensure_storage():
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    conn = get_connection()
    conn.execute(
        'CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK(id = 1), payload TEXT NOT NULL)'
    )
    conn.execute(
        '''
        CREATE TABLE IF NOT EXISTS dues_payments (
            reference TEXT PRIMARY KEY,
            member_name TEXT NOT NULL,
            member_email TEXT NOT NULL,
            amount INTEGER NOT NULL,
            currency TEXT NOT NULL,
            status TEXT NOT NULL,
            paid_at TEXT
        )
        '''
    )
    row = conn.execute('SELECT payload FROM app_state WHERE id = 1').fetchone()
    if row is None:
        conn.execute(
            'INSERT INTO app_state(id, payload) VALUES (1, ?)',
            (json.dumps(DEFAULT_STATE),),
        )
    conn.commit()
    conn.close()


def load_state():
    conn = get_connection()
    row = conn.execute('SELECT payload FROM app_state WHERE id = 1').fetchone()
    conn.close()

    if row is None:
        return json.loads(json.dumps(DEFAULT_STATE))

    try:
        return json.loads(row['payload'])
    except Exception:
        return json.loads(json.dumps(DEFAULT_STATE))


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

    def end_headers(self):
        if urlsplit(self.path).path in ('/', '/index.html', '/styles.css'):
            self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def do_GET(self):
        parsed = urlsplit(self.path)
        path = parsed.path

        if self._is_private_database_path(path):
            self.send_error(404)
            return

        if path == '/api/health':
            self._send_json(200, {'status': 'ok'})
            return

        if path == '/api/admin/session':
            self._send_json(200, {'authenticated': self._is_admin_authenticated()})
            return

        if path == '/api/state':
            state = load_state()
            if not self._is_admin_authenticated():
                state.pop('members', None)
                state.pop('activities', None)
            self._send_json(200, state)
            return

        if path == '/':
            self.path = '/index.html'

        return super().do_GET()

    def do_HEAD(self):
        path = urlsplit(self.path).path
        if self._is_private_database_path(path):
            self.send_error(404)
            return
        return super().do_HEAD()

    def do_POST(self):
        parsed = urlsplit(self.path)
        path = parsed.path

        if path == '/api/admin/login':
            self._handle_admin_login()
            return

        if path == '/api/admin/logout':
            self._handle_admin_logout()
            return

        if path == '/api/members/register':
            self._handle_member_registration()
            return

        if path == '/api/state':
            self._handle_save_state()
            return

        if path == '/api/payments/initialize':
            self._handle_payment_initialize()
            return

        if path == '/api/payments/verify':
            self._handle_payment_verify()
            return

        if path == '/api/payments/webhook':
            self._handle_payment_webhook()
            return

        self._send_json(404, {'error': 'Not found.'})

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def log_message(self, format, *args):
        return

    def _is_private_database_path(self, path):
        filename = Path(unquote(path)).name
        database_names = {DB_FILE.name, 'mmogcc_youth.db'}
        return any(
            filename == name or filename.startswith(f'{name}-')
            for name in database_names
        )

    def _handle_save_state(self):
        if not self._require_admin():
            return

        payload = self._read_json_body()
        if payload is None:
            return

        conn = get_connection()
        try:
            conn.execute('BEGIN IMMEDIATE')
            row = conn.execute('SELECT payload FROM app_state WHERE id = 1').fetchone()
            stored_state = json.loads(row['payload']) if row else None
            current_state = (
                stored_state if isinstance(stored_state, dict) else json.loads(json.dumps(DEFAULT_STATE))
            )
            for key in ('events', 'gallery', 'members', 'announcements', 'executives', 'activities'):
                if key in payload:
                    current_state[key] = payload[key]
            conn.execute(
                'INSERT OR REPLACE INTO app_state(id, payload) VALUES (1, ?)',
                (json.dumps(current_state),),
            )
            conn.commit()
        except (sqlite3.Error, json.JSONDecodeError, TypeError):
            conn.rollback()
            self._send_json(500, {'error': 'Your changes could not be saved. Please try again.'})
            return
        finally:
            conn.close()
        self._send_json(200, {'status': 'saved'})

    def _admin_credentials(self):
        password = os.environ.get('ADMIN_PASSWORD', '').strip()
        session_secret = os.environ.get('ADMIN_SESSION_SECRET', '').strip()
        if len(password) < 12 or len(session_secret) < 32:
            return None, None
        return password, session_secret.encode('utf-8')

    def _request_is_same_origin(self):
        origin = self.headers.get('Origin', '')
        parsed_origin = urlsplit(origin)
        forwarded_proto = self.headers.get('X-Forwarded-Proto', '').split(',')[0].strip().lower()
        expected_scheme = 'https' if forwarded_proto == 'https' else 'http'
        host = self.headers.get('Host', '').strip().lower()
        return (
            parsed_origin.scheme == expected_scheme
            and parsed_origin.netloc.lower() == host
            and not parsed_origin.path
            and not parsed_origin.query
            and not parsed_origin.fragment
        )

    def _admin_session_signature(self, expires_at, password, secret):
        message = f'admin:{expires_at}:{password}'.encode('utf-8')
        return hmac.new(secret, message, hashlib.sha256).hexdigest()

    def _is_admin_authenticated(self):
        password, secret = self._admin_credentials()
        if password is None or secret is None:
            return False

        cookie = SimpleCookie()
        try:
            cookie.load(self.headers.get('Cookie', ''))
        except CookieError:
            return False
        morsel = cookie.get(ADMIN_SESSION_COOKIE)
        if morsel is None:
            return False

        try:
            expiry_text, signature = morsel.value.split('.', 1)
            expires_at = int(expiry_text)
        except (ValueError, TypeError):
            return False
        if (
            not re.fullmatch(r'[a-f0-9]{64}', signature)
            or expires_at <= int(time.time())
            or expires_at > int(time.time()) + ADMIN_SESSION_MAX_AGE
        ):
            return False
        expected = self._admin_session_signature(expires_at, password, secret)
        return hmac.compare_digest(signature, expected)

    def _require_admin(self):
        if not self._request_is_same_origin():
            self._send_json(403, {'error': 'Request origin is not allowed.'})
            return False
        if not self._is_admin_authenticated():
            self._send_json(401, {'error': 'Administrator sign-in is required.'})
            return False
        return True

    def _handle_admin_login(self):
        if not self._request_is_same_origin():
            self._send_json(403, {'error': 'Request origin is not allowed.'})
            return

        password_configured, secret = self._admin_credentials()
        if password_configured is None or secret is None:
            self._send_json(
                503,
                {'error': 'Admin sign-in is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.'},
            )
            return

        payload = self._read_json_body()
        if payload is None:
            return
        username = payload.get('username')
        password = payload.get('password')
        if not isinstance(username, str) or not isinstance(password, str):
            self._send_json(400, {'error': 'Enter a valid username and password.'})
            return
        username_bytes = username.strip().lower().encode('utf-8')
        if not hmac.compare_digest(username_bytes, b'admin') or not hmac.compare_digest(
            password.encode('utf-8'), password_configured.encode('utf-8')
        ):
            self._send_json(401, {'error': 'Invalid login details.'})
            return

        expires_at = int(time.time()) + ADMIN_SESSION_MAX_AGE
        token = f'{expires_at}.{self._admin_session_signature(expires_at, password_configured, secret)}'
        forwarded_proto = self.headers.get('X-Forwarded-Proto', '').split(',')[0].strip().lower()
        cookie = (
            f'{ADMIN_SESSION_COOKIE}={token}; HttpOnly; SameSite=Lax; Path=/; '
            f'Max-Age={ADMIN_SESSION_MAX_AGE}'
        )
        if forwarded_proto == 'https':
            cookie += '; Secure'
        self._send_json(200, {'status': 'ok'}, {'Set-Cookie': cookie})

    def _handle_admin_logout(self):
        if not self._request_is_same_origin():
            self._send_json(403, {'error': 'Request origin is not allowed.'})
            return

        forwarded_proto = self.headers.get('X-Forwarded-Proto', '').split(',')[0].strip().lower()
        cookie = f'{ADMIN_SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'
        if forwarded_proto == 'https':
            cookie += '; Secure'
        self._send_json(200, {'status': 'ok'}, {'Set-Cookie': cookie})

    def _handle_member_registration(self):
        if not self._request_is_same_origin():
            self._send_json(403, {'error': 'Request origin is not allowed.'})
            return

        payload = self._read_json_body()
        if payload is None:
            return

        fields = {
            'name': 120,
            'email': 254,
            'role': 120,
            'dob': 10,
            'age': 3,
            'dayBornGroup': 12,
            'location': 120,
            'employmentStatus': 24,
            'employmentDetail': 120,
            'contact': 40,
            'emergencyContact': 40,
        }
        member = {}
        for field, max_length in fields.items():
            value = payload.get(field, '')
            if not isinstance(value, str) or len(value.strip()) > max_length:
                self._send_json(400, {'error': 'Please check the registration details and try again.'})
                return
            member[field] = value.strip()

        if (
            not member['name']
            or not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', member['email'])
            or not member['role']
            or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', member['dob'])
            or not re.fullmatch(r'\d{1,3}', member['age'])
            or not 1 <= int(member['age']) <= 120
            or member['dayBornGroup'] not in (
                'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
            )
            or not member['location']
            or member['employmentStatus'] not in ('Employed', 'Self-employed', 'Student', 'Unemployed')
            or not member['contact']
            or not member['emergencyContact']
            or (
                member['employmentStatus'] in ('Employed', 'Self-employed', 'Student')
                and not member['employmentDetail']
            )
        ):
            self._send_json(400, {'error': 'Please complete all required registration fields.'})
            return

        member.update({'engagement': 'New', 'status': 'Pending'})
        member['email'] = member['email'].lower()
        conn = get_connection()
        try:
            conn.execute('BEGIN IMMEDIATE')
            row = conn.execute('SELECT payload FROM app_state WHERE id = 1').fetchone()
            stored_state = json.loads(row['payload']) if row else None
            state = stored_state if isinstance(stored_state, dict) else json.loads(json.dumps(DEFAULT_STATE))
            members = state.setdefault('members', [])
            if any(
                isinstance(existing, dict)
                and str(existing.get('email', '')).strip().lower() == member['email']
                for existing in members
            ):
                conn.rollback()
                self._send_json(409, {'error': 'This email address is already registered.'})
                return
            members.insert(0, member)
            state.setdefault('activities', []).insert(
                0,
                {
                    'memberName': member['name'],
                    'email': member['email'],
                    'action': 'Signed up',
                    'details': 'New membership registration completed.',
                    'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                },
            )
            conn.execute(
                'INSERT OR REPLACE INTO app_state(id, payload) VALUES (1, ?)',
                (json.dumps(state),),
            )
            conn.commit()
        except (sqlite3.Error, json.JSONDecodeError, TypeError):
            conn.rollback()
            self._send_json(500, {'error': 'Registration could not be saved. Please try again.'})
            return
        finally:
            conn.close()
        self._send_json(201, {'status': 'registered', 'member': member})

    def _read_json_body(self):
        try:
            length = int(self.headers.get('Content-Length', '0') or 0)
        except ValueError:
            self._send_json(400, {'error': 'Invalid request body.'})
            return None

        if length <= 0 or length > 16384:
            self._send_json(400, {'error': 'Invalid request body.'})
            return None

        try:
            payload = json.loads(self.rfile.read(length).decode('utf-8'))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send_json(400, {'error': 'Invalid JSON request body.'})
            return None

        if not isinstance(payload, dict):
            self._send_json(400, {'error': 'Invalid request body.'})
            return None

        return payload

    def _paystack_request(self, endpoint, payload=None):
        secret_key = os.environ.get('PAYSTACK_SECRET_KEY', '').strip()
        if not secret_key:
            raise RuntimeError('Paystack payments are not configured. Set PAYSTACK_SECRET_KEY.')

        body = json.dumps(payload).encode('utf-8') if payload is not None else None
        request = Request(
            f'{PAYSTACK_API_URL}{endpoint}',
            data=body,
            headers={
                'Authorization': f'Bearer {secret_key}',
                'Content-Type': 'application/json',
            },
            method='POST' if payload is not None else 'GET',
        )
        try:
            with urlopen(request, timeout=15) as response:
                result = json.loads(response.read().decode('utf-8'))
        except HTTPError as error:
            raise RuntimeError('Paystack could not process the payment request.') from error
        except URLError as error:
            raise RuntimeError('Could not connect to Paystack. Please try again.') from error
        except (TimeoutError, json.JSONDecodeError, UnicodeDecodeError) as error:
            raise RuntimeError('Paystack returned an invalid or delayed response.') from error

        if not isinstance(result, dict) or not result.get('status'):
            message = result.get('message') if isinstance(result, dict) else None
            raise RuntimeError(message or 'Paystack could not process the payment request.')

        data = result.get('data')
        if not isinstance(data, dict):
            raise RuntimeError('Paystack returned an invalid payment response.')
        return data

    def _handle_payment_initialize(self):
        payload = self._read_json_body()
        if payload is None:
            return

        name = payload.get('name')
        email = payload.get('email')
        raw_amount = payload.get('amount')
        if not isinstance(name, str) or not name.strip() or len(name.strip()) > 120:
            self._send_json(400, {'error': 'Enter a valid member name.'})
            return
        if not isinstance(email, str) or not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', email.strip()):
            self._send_json(400, {'error': 'Enter a valid member email address.'})
            return

        if not isinstance(raw_amount, str) or not re.fullmatch(r'\d{1,12}(?:\.\d{1,2})?', raw_amount.strip()):
            self._send_json(400, {'error': 'Enter a valid payment amount.'})
            return

        try:
            amount_major = Decimal(raw_amount.strip())
        except InvalidOperation:
            self._send_json(400, {'error': 'Enter a valid payment amount.'})
            return

        if amount_major <= 0:
            self._send_json(400, {'error': 'Amount must be greater than zero.'})
            return
        amount_minor = int(amount_major * 100)

        reference = f'MMOGCC-{secrets.token_hex(12)}'
        member_name = name.strip()
        member_email = email.strip().lower()
        conn = get_connection()
        conn.execute(
            '''
            INSERT INTO dues_payments(reference, member_name, member_email, amount, currency, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
            ''',
            (reference, member_name, member_email, amount_minor, PAYMENT_CURRENCY),
        )
        conn.commit()
        conn.close()

        forwarded_proto = self.headers.get('X-Forwarded-Proto', '').split(',')[0].strip().lower()
        scheme = 'https' if forwarded_proto == 'https' else 'http'
        host = self.headers.get('Host', 'localhost')
        if not re.fullmatch(r'[A-Za-z0-9.-]+(?::\d{1,5})?', host):
            host = 'localhost'
        callback_url = f'{scheme}://{host}/'
        try:
            data = self._paystack_request(
                '/transaction/initialize',
                {
                    'email': member_email,
                    'amount': amount_minor,
                    'currency': PAYMENT_CURRENCY,
                    'reference': reference,
                    'callback_url': callback_url,
                    'metadata': {
                        'custom_fields': [
                            {'display_name': 'Member name', 'variable_name': 'member_name', 'value': member_name},
                            {'display_name': 'Payment type', 'variable_name': 'payment_type', 'value': 'Youth dues'},
                        ]
                    },
                },
            )
        except RuntimeError as error:
            self._send_json(503 if 'not configured' in str(error) else 502, {'error': str(error)})
            return

        authorization_url = data.get('authorization_url')
        if not isinstance(authorization_url, str) or not authorization_url.startswith('https://'):
            self._send_json(502, {'error': 'Paystack did not return a valid checkout link.'})
            return

        self._send_json(200, {'authorizationUrl': authorization_url, 'reference': reference})

    def _handle_payment_verify(self):
        payload = self._read_json_body()
        if payload is None:
            return

        reference = payload.get('reference')
        if not isinstance(reference, str) or not re.fullmatch(r'MMOGCC-[a-f0-9]{24}', reference):
            self._send_json(400, {'error': 'Invalid payment reference.'})
            return

        conn = get_connection()
        payment = conn.execute(
            'SELECT * FROM dues_payments WHERE reference = ?',
            (reference,),
        ).fetchone()
        if payment is None:
            conn.close()
            self._send_json(404, {'error': 'Payment reference was not found.'})
            return

        if payment['status'] == 'paid':
            conn.close()
            self._send_json(200, self._payment_receipt(payment))
            return

        try:
            data = self._paystack_request(f'/transaction/verify/{reference}')
        except RuntimeError as error:
            conn.close()
            self._send_json(503 if 'not configured' in str(error) else 502, {'error': str(error)})
            return

        if not payment_matches(payment, data, reference):
            conn.close()
            self._send_json(409, {'error': 'Payment has not been confirmed. If you were charged, contact the youth team with your reference.'})
            return

        self._mark_payment_paid(conn, reference, data.get('paid_at'))
        payment = conn.execute(
            'SELECT * FROM dues_payments WHERE reference = ?',
            (reference,),
        ).fetchone()
        conn.close()
        self._send_json(200, self._payment_receipt(payment))

    def _handle_payment_webhook(self):
        secret_key = os.environ.get('PAYSTACK_SECRET_KEY', '').strip()
        if not secret_key:
            self._send_json(503, {'error': 'Paystack payments are not configured.'})
            return

        try:
            length = int(self.headers.get('Content-Length', '0') or 0)
        except ValueError:
            self._send_json(400, {'error': 'Invalid webhook request.'})
            return
        if length <= 0 or length > 16384:
            self._send_json(400, {'error': 'Invalid webhook request.'})
            return

        raw_body = self.rfile.read(length)
        signature = self.headers.get('x-paystack-signature', '')
        expected_signature = hmac.new(
            secret_key.encode('utf-8'),
            raw_body,
            hashlib.sha512,
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_signature):
            self._send_json(401, {'error': 'Invalid webhook signature.'})
            return

        try:
            event = json.loads(raw_body.decode('utf-8'))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send_json(400, {'error': 'Invalid webhook JSON.'})
            return

        if not isinstance(event, dict) or event.get('event') != 'charge.success':
            self._send_json(200, {'status': 'ignored'})
            return

        data = event.get('data')
        reference = data.get('reference') if isinstance(data, dict) else None
        if not isinstance(reference, str) or not re.fullmatch(r'MMOGCC-[a-f0-9]{24}', reference):
            self._send_json(200, {'status': 'ignored'})
            return

        conn = get_connection()
        payment = conn.execute(
            'SELECT * FROM dues_payments WHERE reference = ?',
            (reference,),
        ).fetchone()
        if payment is None or payment['status'] == 'paid':
            conn.close()
            self._send_json(200, {'status': 'ignored'})
            return
        if not payment_matches(payment, data, reference):
            conn.close()
            self._send_json(400, {'error': 'Webhook payment details did not match the pending payment.'})
            return

        self._mark_payment_paid(conn, reference, data.get('paid_at'))
        conn.close()
        self._send_json(200, {'status': 'ok'})

    def _mark_payment_paid(self, conn, reference, paid_at):
        conn.execute(
            "UPDATE dues_payments SET status = 'paid', paid_at = ? WHERE reference = ?",
            (paid_at, reference),
        )
        conn.commit()

    def _payment_receipt(self, payment):
        return {
            'status': payment['status'],
            'reference': payment['reference'],
            'memberName': payment['member_name'],
            'amount': payment['amount'] / 100,
            'currency': payment['currency'],
            'paidAt': payment['paid_at'],
        }

    def _send_json(self, status_code, payload, headers=None):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)


if __name__ == '__main__':
    ensure_storage()
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', '8000'))
    server = ThreadingHTTPServer((host, port), AppHandler)
    print(f'MMOGCC YOUTH backend running on http://{host}:{port}')
    server.serve_forever()
