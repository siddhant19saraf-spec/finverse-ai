from app.models.user import User

def user_has_role(user: User, role_name: str) -> bool:
    if user.is_superuser:
        return True
    for r in user.roles:
        if r.name == role_name:
            return True
    return False
