# Generated by Django 5.1.4 on 2024-12-19 10:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_dashboard', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='leave_admin',
            name='reason',
            field=models.TextField(blank=True, null=True),
        ),
    ]
