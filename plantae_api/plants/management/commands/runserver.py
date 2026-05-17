import errno
import sys

from django.contrib.staticfiles.management.commands.runserver import Command as StaticfilesRunserverCommand
from django.core.servers.basehttp import WSGIServer


CLIENT_DISCONNECT_WINERRORS = {10053, 10054, 10058}


def is_client_disconnect(exc):
    if isinstance(exc, (BrokenPipeError, ConnectionAbortedError, ConnectionResetError)):
        return True

    if not isinstance(exc, OSError):
        return False

    return (
        getattr(exc, "errno", None) in {errno.EPIPE, errno.ECONNABORTED, errno.ECONNRESET}
        or getattr(exc, "winerror", None) in CLIENT_DISCONNECT_WINERRORS
    )


class QuietDisconnectWSGIServer(WSGIServer):
    def handle_error(self, request, client_address):
        _, exc, _ = sys.exc_info()

        if is_client_disconnect(exc):
            return

        return super().handle_error(request, client_address)


class Command(StaticfilesRunserverCommand):
    server_cls = QuietDisconnectWSGIServer
