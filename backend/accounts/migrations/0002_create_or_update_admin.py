from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_admin_user(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    UserProfile = apps.get_model('accounts', 'UserProfile')

    admin_user = (
        User.objects.filter(email__iexact='admin@gmail.com').first()
        or User.objects.filter(username__iexact='admin@gmail.com').first()
        or User.objects.filter(username__iexact='admin').first()
        or User.objects.filter(is_superuser=True).first()
    )

    if not admin_user:
        admin_user = User(
            username='admin@gmail.com',
            email='admin@gmail.com',
            first_name='Hospital',
            last_name='Administrator',
        )
    else:
        admin_user.username = 'admin@gmail.com'
        admin_user.email = 'admin@gmail.com'

    admin_user.password = make_password('admin123')
    admin_user.is_superuser = True
    admin_user.is_staff = True
    admin_user.is_active = True
    admin_user.save()

    profile, _ = UserProfile.objects.get_or_create(user=admin_user)
    profile.role = 'ADMIN'
    profile.save()

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_admin_user, reverse_code=migrations.RunPython.noop),
    ]
