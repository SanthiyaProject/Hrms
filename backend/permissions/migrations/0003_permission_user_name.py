# Generated by Django 5.1.4 on 2024-12-24 03:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('permissions', '0002_alter_permission_notes'),
    ]

    operations = [
        migrations.AddField(
            model_name='permission',
            name='user_name',
            field=models.CharField(max_length=20, null=True),
        ),
    ]