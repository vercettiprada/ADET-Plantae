# TODO - Fix “white screen” after `python manage.py runserver`

- [ ] Add a root `/` URL route so the base server URL is not blank
  - Option A: redirect `/` → `/swagger/`
  - Option B: serve a tiny JSON response
- [ ] Save changes to `plantae_api/plantae_api/urls.py`
- [ ] Verify via browser:
  - http://<host>:8000/ should show Swagger UI (or JSON)
  - http://<host>:8000/api/ should continue working
- [ ] Update TODO status after verification

