import os

from dotenv import dotenv_values

config = {**dotenv_values(".env"), **os.environ}  # For docker deployment


def check_config():
    pass
