import os

class Config:
    DEBUG = True
    SECRET_KEY = 'dev_secret_key_123'

    # TiDB Cloud connection string
    SQLALCHEMY_DATABASE_URI = (
        "mysql+pymysql://2CVjR46iAJPpbCG.root:"
        "Cojs8xqBx7I3q0Zb@"
        "gateway01.ap-southeast-1.prod.aws.tidbcloud.com:"
        "4000/"
        "ticketbookingdb"
    )

    # Path to CA certificate
    # Assuming config.py is in app/ and CA_cert.pem is in the project root
    basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    ssl_ca_path = os.path.join(basedir, 'CA_cert.pem')

    # SSL configuration and connection pooling for TiDB
    SQLALCHEMY_ENGINE_OPTIONS = {
        'connect_args': {
            'ssl_verify_cert': True,
            'ssl_verify_identity': True,
            'ssl_ca': ssl_ca_path
        },
        'pool_recycle': 280,
        'pool_pre_ping': True,
        'pool_size': 10,
        'max_overflow': 20
    }

    SQLALCHEMY_TRACK_MODIFICATIONS = False

