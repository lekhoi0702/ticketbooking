import os
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path=env_path)

class Config:
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"

    # Using the correct connection string format for Aiven MySQL
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:"
        f"{os.getenv('DB_PASSWORD', '')}@"
        f"{os.getenv('DB_HOST', 'localhost')}:"
        f"{os.getenv('DB_PORT', '3306')}/"
        f"{os.getenv('DB_NAME', 'ticketbookingdb')}"
    )

    # SSL configuration for Aiven MySQL
    SQLALCHEMY_ENGINE_OPTIONS = {
        'connect_args': {
            'ssl': {
                'ssl_mode': 'REQUIRED'
            }
        }
    }

    SQLALCHEMY_TRACK_MODIFICATIONS = False

