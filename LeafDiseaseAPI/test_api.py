import requests

url = "http://127.0.0.1:5000/predict"

image_path = r"E:\MINI PROJECT\LeafDiseaseAPI\dataset\test\Apple___Apple_scab\002c6f35db42612d.jpg"

with open(image_path, "rb") as img:
    response = requests.post(
        url,
        files={"image": img}
    )

print("Status:", response.status_code)
print("Response:")
print(response.text)