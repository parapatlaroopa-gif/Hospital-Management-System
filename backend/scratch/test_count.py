import urllib.request
import json

BASE_URL = "https://hospital-backend-ggfo.onrender.com"

req = urllib.request.Request(
    f"{BASE_URL}/api/accounts/login/",
    data=json.dumps({
        "email": "nithinkumarreddy1538@gmail.com",
        "password": "Nithin@1538"
    }).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

with urllib.request.urlopen(req) as resp:
    result = json.loads(resp.read().decode("utf-8"))
    print(result)