from itsdangerous import URLSafeSerializer as utsr
import base64
import re


class Token():
    def __init__(self, security_key):
        self.security_key = security_key
        # self.salt = base64.encodestring(security_key)

    def generate_validate_token(self, username):
        serializer = utsr(self.security_key)
        return serializer.dumps(username)

    def confirm_validate_token(self, token):
        serializer = utsr(self.security_key)
        return serializer.loads(token)