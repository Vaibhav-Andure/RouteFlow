import requests, json, sys

BASE_URL = 'http://127.0.0.1:8000/api/v1'
login_payload = {
    'username': 'admin@example.com',
    'password': 'changethis'
}
# Use form-encoded data as required by OAuth2PasswordRequestForm
resp = requests.post(f'{BASE_URL}/login/access-token', data=login_payload)
if resp.status_code != 200:
    print('Login failed', resp.status_code, resp.text)
    sys.exit(1)

token = resp.json().get('access_token')
if not token:
    print('No token returned')
    sys.exit(1)
headers = {'Authorization': f'Bearer {token}'}
# Create delivery payload
delivery_payload = {
    'customer_name': 'Test Customer',
    'latitude': 12.9716,
    'longitude': 77.5946,
    'status': 'PENDING'
}
resp2 = requests.post(f'{BASE_URL}/deliveries/', json=delivery_payload, headers=headers)
print('Create delivery status:', resp2.status_code)
print('Response:', resp2.text)
