# Generated by Django 5.1.4 on 2024-12-20 05:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_dashboard', '0003_leave_admin_card_user_department'),
    ]

    operations = [
        migrations.AddField(
            model_name='leave_admin',
            name='user_department',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
