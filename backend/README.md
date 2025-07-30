# 🩸 National Blood Bank Management System

A modern web-based Blood Bank Management System built with **Django REST Framework** and a **React** frontend. This project enables hospitals and blood banks to manage blood donations, routine and emergency distributions, and monitor real-time blood stock status with visual indicators.

## 🚀 Features

- 📥 Add new blood donations (with donor info and type)
- 📦 Regular and emergency blood distribution
- 🔄 Blood type compatibility fallback suggestions
- 🟢 Real-time blood stock visualization with color-coded levels
- 🔔 Smart alerts for low or critical levels
- 💬 Elegant modals for decision-making (e.g., replacement confirmation)
- 🌐 Cross-Origin access enabled for frontend consumption (CORS)

## 🧩 Technologies

- **Backend**: Django 5.2, Django REST Framework, Simple JWT, Pillow
- **Frontend**: React + Tailwind CSS
- **API**: RESTful endpoints for full CRUD and blood distribution
- **Tools**: `python-decouple`, CORS, token auth

## 🛠️ Installation

1. **Clone the repo**:
   ```bash
   git clone https://github.com/your-username/blood-bank-system.git
   cd blood-bank-system
   ```

2. **Create virtual environment & activate**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Run the server**:
   ```bash
   python manage.py runserver
   ```

6. *(Optional)* Access the admin:
   ```bash
   python manage.py createsuperuser
   ```

## 📦 requirements.txt

```
asgiref==3.9.1
Django==5.2.4
django-cors-headers==4.7.0
djangorestframework==3.16.0
djangorestframework-simplejwt>=5.3.0
Pillow>=10.0.0
python-decouple>=3.8
sqlparse==0.5.3
tzdata==2025.2
```

## 🧪 Example APIs

- `POST /api/donations/` – Add a donation
- `POST /api/distribute/` – Distribute blood (routine/emergency)
- `GET /api/donations/` – View all blood stock

## 👨‍💻 Author

Created by Bsoul Muhammed & Wattad Yazan & Dakka Muhammed – Software Engineering Student @ Sami Shamoon College  
Mentorship & Testing support by friends and teammates 💡

## 📄 License

This project is for educational and academic use only. Feel free to fork, extend, and improve!