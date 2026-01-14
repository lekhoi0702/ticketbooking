class Config:
    DEBUG = True
    SECRET_KEY = 'dev_secret_key_123'

    # Hardcoded connection string for Aiven MySQL
    SQLALCHEMY_DATABASE_URI = (
        "mysql+pymysql://avnadmin:"
        "AVNS_Wyds9xpxDGzYAuRQ8Rm@"
        "mysql-3b8d5202-dailyreport.i.aivencloud.com:"
        "20325/"
        "ticketbookingdb"
    )

    # SSL configuration and connection pooling for Aiven MySQL
    SQLALCHEMY_ENGINE_OPTIONS = {
        'connect_args': {
            'ssl': {
                'ssl_mode': 'REQUIRED'
            }
        },
        'pool_recycle': 280,
        'pool_pre_ping': True,
        'pool_size': 10,
        'max_overflow': 20
    }

    SQLALCHEMY_TRACK_MODIFICATIONS = False

