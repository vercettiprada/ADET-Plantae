import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "build"
PORT = int(os.environ.get("PLANTAE_WEB_PORT", "3000"))



class PlantaeHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_head(self):
        requested = (ROOT / self.path.lstrip("/").split("?", 1)[0]).resolve()
        if requested.is_dir() or not requested.exists():
            self.path = "/index.html"
        return super().send_head()


if __name__ == "__main__":
    host = os.environ.get("PLANTAE_WEB_HOST", "0.0.0.0")
    server = ThreadingHTTPServer((host, PORT), PlantaeHandler)
    scheme = "http"
    print(f"Plantae web app running at {scheme}://{host}:{PORT}")
    server.serve_forever()

