from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0002_alter_appointment_id"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="appointment",
            constraint=models.UniqueConstraint(
                fields=("doctor", "appointment_date", "appointment_time"),
                name="unique_doctor_appointment_slot",
            ),
        ),
    ]
