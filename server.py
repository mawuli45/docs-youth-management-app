from __future__ import annotations

import json
import os
import sqlite3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

APP_DIR = Path(__file__).resolve().parent
ROOT_DIR = APP_DIR
DB_FILE = APP_DIR / 'mmogcc_youth.db'

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
    conn = get_connection()
    conn.execute(
        'CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK(id = 1), payload TEXT NOT NULL)'
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


def save_state(payload):
    conn = get_connection()
    conn.execute(
        'UPDATE app_state SET payload = ? WHERE id = 1',
        (json.dumps(payload),),
    )
    conn.commit()
    conn.close()


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

    def do_GET(self):
        parsed = urlsplit(self.path)
        path = parsed.path

        if path == '/api/health':
            self._send_json(200, {'status': 'ok'})
            return

        if path == '/api/state':
            self._send_json(200, load_state())
            return

        if path == '/':
            self.path = '/index.html'

        return super().do_GET()

    def do_POST(self):
        parsed = urlsplit(self.path)
        path = parsed.path

        if path == '/api/state':
            self._handle_save_state()
            return

        self._send_json(404, {'error': 'Not found.'})

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        return

    def _handle_save_state(self):
        length = int(self.headers.get('Content-Length', '0') or 0)
        raw_body = self.rfile.read(length) if length else b'{}'

        try:
            payload = json.loads(raw_body.decode('utf-8') or '{}')
        except Exception:
            payload = {}

        if not isinstance(payload, dict):
            self._send_json(400, {'error': 'Invalid payload.'})
            return

        current_state = load_state()
        for key in ('events', 'gallery', 'members', 'announcements', 'executives', 'activities'):
            if key in payload:
                current_state[key] = payload[key]

        save_state(current_state)
        self._send_json(200, {'status': 'saved'})

    def _send_json(self, status_code, payload):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == '__main__':
    ensure_storage()
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', '8000'))
    server = ThreadingHTTPServer((host, port), AppHandler)
    print(f'MMOGCC YOUTH backend running on http://{host}:{port}')
    server.serve_forever()
