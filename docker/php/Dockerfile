FROM php:8.3-fpm

# Рабочая директория
WORKDIR /var/www/html

# Копирование проекта
COPY ../../. /var/www/html

# Права на файлы
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Запуск PHP-FPM
CMD ["php-fpm"]