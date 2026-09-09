import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("NVIDIA_API_KEY")

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=api_key
)

prompt = """
நீங்கள் விவசாயிகளுக்கு உதவும் ஒரு Agricultural AI Assistant.

ஏற்கனவே உள்ள disease detection model கண்டறிந்த முடிவு:

பயிர்: Pepper Bell
கண்டறியப்பட்ட நோய்: Pepper Bell Bacterial Spot
நம்பகத்தன்மை: 95%

இந்த தகவலை மாற்றக்கூடாது.

விவசாயி எளிதாக புரிந்து கொள்ளும் வகையில் முழுமையான அறிக்கையை தமிழில் மட்டும் உருவாக்கவும்.

முக்கிய விதிகள்:
- நோயின் பெயரை மாற்றக்கூடாது.
- 95% confidence-ஐ மாற்றக்கூடாது.
- வேறு நோயை கண்டறியக்கூடாது.
- Laboratory confirmation என்று கூறக்கூடாது.
- மருந்தின் குறிப்பிட்ட dosage-ஐ கற்பனை செய்து கூறக்கூடாது.
- பாதுகாப்பான மற்றும் நடைமுறை விவசாய மேலாண்மை ஆலோசனைகளை மட்டும் வழங்கவும்.

கீழ்கண்ட அனைத்து பகுதிகளையும் தமிழில் வழங்கவும்:

1. நோய் கண்டறிதல்
2. சுருக்கம்
3. அறிகுறிகள்
4. காரணங்கள்
5. உடனடி நடவடிக்கைகள்
6. சிகிச்சை / மேலாண்மை
7. தடுப்பு முறைகள்
8. கண்காணிப்பு

ஒவ்வொரு பகுதியிலும் பயனுள்ள மற்றும் விவசாயிக்கு புரியும் விளக்கத்தை கொடுக்கவும்.

முழு பதிலும் தமிழில் இருக்க வேண்டும்.
"""

try:
    completion = client.chat.completions.create(
        model="nvidia/nemotron-3.5-lightning-30b-a3b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        top_p=0.9,
        max_tokens=1800,
        stream=False,
        extra_body={
            "chat_template_kwargs": {
                "enable_thinking": False
            }
        }
    )

    result = completion.choices[0].message.content

    print("\n" + "=" * 60)
    print("NVIDIA FARMER REPORT")
    print("=" * 60)
    print(result)
    print("=" * 60)

except Exception as e:
    print("\nNVIDIA API ERROR:")
    print(type(e).__name__)
    print(str(e))