# Generated by Django 5.0 on 2024-07-02 15:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pipeline', '0005_card_anexos_pvtec_response_alter_card_anexos_file_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='card_anexos',
            name='name',
            field=models.CharField(max_length=100, null=True, verbose_name='Nome Arquivo'),
        ),
    ]
