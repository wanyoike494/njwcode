# 1. Create a project folder
mkdir django-calculator && cd django-calculator

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install Django and the CORS library
pip install django djangorestframework django-cors-headers

# 4. Start the Django project
django-admin startproject calcbackend .

# 5. Create the calculator app
python manage.py startapp calculator




# Apply migrations (Django needs this even without a database model)
python manage.py migrate

# Start the development server
python manage.py runserver


# deactivate