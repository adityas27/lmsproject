# Generated by Django 5.2 on 2025-06-17 20:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0008_certificate_applied_at_certificate_status_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='certificate',
            name='is_approved',
        ),
    ]
