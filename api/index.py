from __future__ import annotations

import io
import json
import logging
import os
import threading
from http import HTTPStatus
from urllib.parse import parse_qs

from server import AppHandler, DATABASE_URL, ensure_storage

logger = logging.getLogger(__name__)
_storage_ready = False
_storage_lock = threading.Lock()


class RequestHeaders:
    def __init__(self, environ):
        self.values = {
            'content-length': environ.get('CONTENT_LENGTH', ''),
            'content-type': environ.get('CONTENT_TYPE', ''),
        }
        for key, value in environ.items():
            if key.startswith('HTTP_'):
                self.values[key[5:].replace('_', '-').lower()] = value

    def get(self, name, default=None):
        return self.values.get(name.lower(), default)


class HandlerAdapter:
    def __init__(self, environ, path, body):
        self.path = path
        self.command = environ.get('REQUEST_METHOD', 'GET').upper()
        self.headers = RequestHeaders(environ)
        self.rfile = io.BytesIO(body)
        self.wfile = io.BytesIO()
        self.status_code = HTTPStatus.INTERNAL_SERVER_ERROR
        self.response_headers = []

    def __getattr__(self, name):
        attribute = getattr(AppHandler, name)
        return attribute.__get__(self, type(self))

    def send_response(self, status_code, message=None):
        self.status_code = HTTPStatus(status_code)

    def send_header(self, name, value):
        self.response_headers.append((name, value))

    def end_headers(self):
        return


def _send_response(start_response, status_code, body, headers=()):
    status = f'{status_code.value} {status_code.phrase}'
    response_headers = [
        (name, value)
        for name, value in headers
        if name.lower() != 'content-length'
    ]
    response_headers.append(('Content-Length', str(len(body))))
    start_response(status, response_headers)
    return [body]


def application(environ, start_response):
    global _storage_ready

    query = parse_qs(environ.get('QUERY_STRING', ''), keep_blank_values=True)
    path = query.get('__route', [environ.get('PATH_INFO', '')])[0]
    method = environ.get('REQUEST_METHOD', 'GET').upper()
    if not path.startswith('/api/'):
        body = b'{"error":"Not found."}'
        return _send_response(
            start_response,
            HTTPStatus.NOT_FOUND,
            body,
            [('Content-Type', 'application/json; charset=utf-8'), ('Cache-Control', 'no-store')],
        )

    if not DATABASE_URL and os.environ.get('VERCEL') == '1':
        body = json.dumps({
            'error': 'Backend storage is not configured. Set DATABASE_URL in Vercel project settings.'
        }).encode('utf-8')
        return _send_response(
            start_response,
            HTTPStatus.SERVICE_UNAVAILABLE,
            body,
            [('Content-Type', 'application/json; charset=utf-8'), ('Cache-Control', 'no-store')],
        )

    try:
        if not _storage_ready:
            with _storage_lock:
                if not _storage_ready:
                    ensure_storage()
                    _storage_ready = True

        if method == 'GET' and path not in (
            '/api/health',
            '/api/admin/session',
            '/api/state',
        ):
            body = b'{"error":"Not found."}'
            return _send_response(
                start_response,
                HTTPStatus.NOT_FOUND,
                body,
                [('Content-Type', 'application/json; charset=utf-8'), ('Cache-Control', 'no-store')],
            )

        content_length = environ.get('CONTENT_LENGTH', '')
        try:
            length = int(content_length or 0)
        except ValueError:
            length = 0
        body = environ['wsgi.input'].read(min(max(length, 0), 16385))

        handler = HandlerAdapter(environ, path, body)
        if method == 'GET':
            AppHandler.do_GET(handler)
        elif method == 'POST':
            AppHandler.do_POST(handler)
        elif method == 'OPTIONS':
            AppHandler.do_OPTIONS(handler)
        else:
            handler._send_json(405, {'error': 'Method not allowed.'})

        response_body = handler.wfile.getvalue()
        if method == 'HEAD':
            response_body = b''
        if not any(name.lower() == 'content-type' for name, _ in handler.response_headers):
            handler.response_headers.append(('Content-Type', 'application/json; charset=utf-8'))
        return _send_response(
            start_response,
            handler.status_code,
            response_body,
            handler.response_headers,
        )
    except Exception:
        logger.exception('Vercel API request failed for %s.', path)
        body = b'{"error":"The request could not be completed. Please try again."}'
        return _send_response(
            start_response,
            HTTPStatus.INTERNAL_SERVER_ERROR,
            body,
            [('Content-Type', 'application/json; charset=utf-8'), ('Cache-Control', 'no-store')],
        )
