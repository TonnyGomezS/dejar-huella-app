<?php
$host = '127.0.0.1';
$db   = 'deja_tu_huella'; // Asegúrate que sea el nombre de tu BD
$user = 'postgres';
$pass = 'postgres';
$port = '5432';

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$db", $user, $pass);
    echo "¡Conexión exitosa a la base de datos!";
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
}